/**
 * What a wallet pass shows, resolved the same way the app's card renderer does
 * (app/components/cardsComponents/Templates/cardDetailTemplate.ts): a card-level override wins,
 * then the owner's profile, then the card's own field.
 */
export type WalletCard = {
  cardId: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  /** Media ids behind the stored `/api/v1/media/:id/content` links, if any. */
  photoMediaId: string | null;
  logoMediaId: string | null;
  coverMediaId: string | null;
  colors: {
    background: string;
    foreground: string;
    label: string;
    accent: string;
    headerBackground: string;
    headerGradient: [string, string];
  };
};

type Json = Record<string, unknown>;

const str = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const mediaId = (value: string) => value.match(/\/api\/v1\/media\/([0-9a-f-]{36})\/content/)?.[1] ?? null;

function hexToRgb(hex: string): [number, number, number] | null {
  const match = hex.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return null;
  const digits = match[1]!.length === 3 ? match[1]!.split('').map((c) => c + c).join('') : match[1]!;
  return [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16)) as [number, number, number];
}

export const rgb = ([r, g, b]: [number, number, number]) => `rgb(${r}, ${g}, ${b})`;
export const hex = ([r, g, b]: [number, number, number]) => `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;

type StoredTheme = {
  accentColor?: unknown;
  backgroundColor?: unknown;
  gradient?: unknown;
  mutedTextColor?: unknown;
  surfaceColor?: unknown;
  textColor?: unknown;
  textColorOverride?: unknown;
};

function themeColor(value: unknown, fallback: string) {
  return hexToRgb(str(value)) ?? hexToRgb(fallback)!;
}

function themeGradient(theme: StoredTheme | undefined, fallback: [string, string]): [string, string] {
  const gradient = theme?.gradient;
  if (!Array.isArray(gradient)) return fallback;
  const start = hexToRgb(str(gradient[0]));
  const end = hexToRgb(str(gradient[1]));
  return start && end ? [hex(start), hex(end)] : fallback;
}

function relativeLuminance([r, g, b]: [number, number, number]) {
  const channel = (value: number) => {
    const normalized = value / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function readableThemeColor(value: unknown, background: [number, number, number], fallback: string, minimum = 4.5) {
  const candidate = hexToRgb(str(value));
  if (!candidate) return hexToRgb(fallback)!;
  const foregroundLum = relativeLuminance(candidate);
  const backgroundLum = relativeLuminance(background);
  const ratio = (Math.max(foregroundLum, backgroundLum) + 0.05) / (Math.min(foregroundLum, backgroundLum) + 0.05);
  return ratio >= minimum ? candidate : hexToRgb(fallback)!;
}

/** Use the same stored surface/text/accent choices as the in-app wallet card. */
function passColors(card: Json) {
  const themes = (card.sectionThemes ?? {}) as Record<string, StoredTheme | undefined>;
  const fallback = (card.cardTheme ?? {}) as StoredTheme;
  const identity = themes.identity ?? fallback;
  const professional = themes.professional ?? fallback;
  const connections = themes.connections ?? professional;
  const professionalGradient = themeGradient(professional, ['#2563eb', '#00a8e8']);
  const background = themeColor(professionalGradient[0] ?? professional.backgroundColor, '#2563eb');
  const luminance = (0.2126 * background[0] + 0.7152 * background[1] + 0.0722 * background[2]) / 255;
  const dark = luminance < 0.6;
  const foregroundFallback = dark ? '#f8fafc' : '#0f172a';
  const labelFallback = dark ? '#cbd5e1' : '#475569';
  return {
    background,
    foreground: readableThemeColor(professional.textColorOverride ?? professional.textColor, background, foregroundFallback),
    label: readableThemeColor(professional.mutedTextColor, background, labelFallback, 3),
    accent: readableThemeColor(connections.accentColor ?? professional.accentColor, background, foregroundFallback, 3),
    headerBackground: themeColor(identity.backgroundColor ?? identity.surfaceColor, dark ? '#0f172a' : '#eff6ff'),
    headerGradient: themeGradient(identity, ['#2563eb', '#00a8e8']),
  };
}

export function toWalletCard(cardId: string, card: Json, profile: Json | null): WalletCard {
  const overrides = (card.sectionOverrides ?? {}) as Json;
  const p = profile ?? {};
  // `??` like the app: an override that is an empty string intentionally hides the profile value.
  const pick = (override: string, ...fallbacks: unknown[]) =>
    overrides[override] !== undefined && overrides[override] !== null
      ? str(overrides[override])
      : fallbacks.map(str).find(Boolean) ?? '';

  const photo = pick('profilePhoto', p.photoUrl);
  const logo = pick('logo', p.companyLogoUrl);
  const cover = pick('coverPhoto', p.coverPhotoUrl);
  const colors = passColors(card);
  return {
    cardId,
    name: pick('preferredName', p.preferredName, card.name) || 'Business card',
    title: pick('title', p.title, card.title),
    company: pick('company', p.organization, card.company),
    email: str(p.email) || str(card.email),
    phone: str(p.phone) || str(card.phone),
    website: str(p.website),
    address: str(p.businessAddress),
    photoMediaId: mediaId(photo),
    logoMediaId: mediaId(logo),
    coverMediaId: mediaId(cover),
    colors: {
      background: rgb(colors.background),
      foreground: rgb(colors.foreground),
      label: rgb(colors.label),
      accent: rgb(colors.accent),
      headerBackground: rgb(colors.headerBackground),
      headerGradient: colors.headerGradient,
    },
  };
}

export function backgroundHex(card: WalletCard): string {
  const parts = card.colors.background.match(/\d+/g)?.map(Number) as [number, number, number] | undefined;
  return parts ? hex(parts) : '#2563eb';
}
