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
  colors: { background: string; foreground: string; label: string };
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

/** Background from the card's professional section (the large coloured area on My Cards), readable text on top. */
function passColors(card: Json) {
  const themes = (card.sectionThemes ?? {}) as Record<string, { gradient?: string[] } | undefined>;
  const background = hexToRgb(themes.professional?.gradient?.[0] ?? '') ?? hexToRgb(themes.identity?.gradient?.[0] ?? '') ?? [37, 99, 235];
  const luminance = (0.2126 * background[0] + 0.7152 * background[1] + 0.0722 * background[2]) / 255;
  const dark = luminance < 0.6;
  return {
    background,
    foreground: (dark ? [255, 255, 255] : [15, 23, 42]) as [number, number, number],
    label: (dark ? [226, 232, 240] : [71, 85, 105]) as [number, number, number],
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
    colors: { background: rgb(colors.background), foreground: rgb(colors.foreground), label: rgb(colors.label) },
  };
}

export function backgroundHex(card: WalletCard): string {
  const parts = card.colors.background.match(/\d+/g)?.map(Number) as [number, number, number] | undefined;
  return parts ? hex(parts) : '#2563eb';
}
