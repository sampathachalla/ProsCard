// components/cardsComponents/types/card.types.ts
export type CardSectionId = 'identity' | 'professional' | 'bio' | 'connections';
export type CardTemplateId =
  | 'classic'
  | 'minimal'
  | 'bold'
  | 'glass'
  | 'compact'
  | 'editorial'
  | 'spotlight'
  | 'banner'
  | 'cards'
  | 'badge'
  | 'split'
  | 'neon';

/**
 * Section 1 (identity) layouts. Cards store these stable ids; the names shown to users live in the
 * layout picker, so renaming a layout never changes saved cards.
 */
export const IDENTITY_LAYOUT_IDS = ['layout-1', 'layout-2', 'layout-3', 'layout-4', 'layout-5', 'layout-6'] as const;

export type IdentityLayoutId = (typeof IDENTITY_LAYOUT_IDS)[number];

/** Visual style each identity layout is drawn with (palette and renderer branch). */
export const IDENTITY_LAYOUT_STYLES = {
  'layout-1': 'classic',
  'layout-2': 'minimal',
  'layout-3': 'split',
  'layout-4': 'bold',
  'layout-5': 'spotlight',
  'layout-6': 'editorial',
} as const satisfies Record<IdentityLayoutId, CardTemplateId>;

/** Styles the identity renderers can draw. */
export const IDENTITY_SECTION_TEMPLATE_IDS = IDENTITY_LAYOUT_IDS.map((id) => IDENTITY_LAYOUT_STYLES[id]);

export type IdentitySectionTemplateId = (typeof IDENTITY_LAYOUT_STYLES)[IdentityLayoutId];

/** A section's saved layout: identity uses layout ids; older cards and other sections use style ids. */
export type CardLayoutId = CardTemplateId | IdentityLayoutId;

export function isIdentityLayoutId(id: unknown): id is IdentityLayoutId {
  return (IDENTITY_LAYOUT_IDS as readonly unknown[]).includes(id);
}

/**
 * The identity layout id for a saved value. Cards saved before layout ids stored the style name
 * (e.g. 'minimal'); those map to the matching layout. Unknown values fall back to layout 1.
 */
export function resolveIdentityLayoutId(id: CardLayoutId | string | undefined): IdentityLayoutId {
  if (isIdentityLayoutId(id)) return id;
  const legacy = IDENTITY_LAYOUT_IDS.find((layoutId) => IDENTITY_LAYOUT_STYLES[layoutId] === id);
  return legacy ?? 'layout-1';
}

/** The style to draw an identity layout with, from a saved layout id or a legacy style name. */
export function resolveIdentityTemplateId(id: CardLayoutId | string | undefined): IdentitySectionTemplateId {
  return IDENTITY_LAYOUT_STYLES[resolveIdentityLayoutId(id)];
}

/** The drawing style for any section's saved layout (identity layout ids become their style). */
export function resolveLayoutStyle(id: CardLayoutId): CardTemplateId {
  return isIdentityLayoutId(id) ? IDENTITY_LAYOUT_STYLES[id] : id;
}

/** Default card title when no personal name is set — not shown on the identity face. */
export const DEFAULT_CARD_DISPLAY_NAME = 'My ProsCard';

export function resolveIdentityPreferredName(input: {
  override?: string;
  profilePreferredName?: string;
  profileFirstName?: string;
  profileLastName?: string;
  profileFullName?: string;
  cardName?: string;
}): string {
  const override = input.override?.trim();
  if (override && override !== DEFAULT_CARD_DISPLAY_NAME) return override;

  const preferred = input.profilePreferredName?.trim();
  if (preferred) return preferred;

  const built = [input.profileFirstName, input.profileLastName].filter(Boolean).join(' ').trim();
  if (built) return built;

  const full = input.profileFullName?.trim();
  if (full) return full;

  const cardName = input.cardName?.trim();
  if (cardName && cardName !== DEFAULT_CARD_DISPLAY_NAME) return cardName;

  return override ?? '';
}

export type DynamicCardFieldType = 'text' | 'email' | 'phone' | 'url';
export type CardFontStyle = 'modern' | 'classic' | 'rounded' | 'mono';
export type CardThemeId = 'ocean' | 'midnight' | 'violet' | 'sand' | 'sunset' | 'aurora' | 'custom';

export type ThemePaletteTier = 2 | 3 | 4;

export const TEMPLATE_TIER_MAP: Record<CardTemplateId, ThemePaletteTier> = {
  minimal: 2,
  compact: 2,
  bold: 2,
  split: 2,
  classic: 3,
  spotlight: 3,
  editorial: 3,
  glass: 3,
  banner: 4,
  cards: 4,
  badge: 4,
  neon: 4,
};

export function getTemplatePaletteTier(templateId: CardTemplateId): ThemePaletteTier {
  return TEMPLATE_TIER_MAP[templateId] ?? 3;
}

export type SavedSectionTheme = {
  id: string;
  name: string;
  gradient: [string, string];
  paletteTier?: ThemePaletteTier;
  paletteColors?: string[];
};

export type CardVisualTheme = {
  id: CardThemeId;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  accentColor: string;
  gradient: [string, string];
  fontStyle: CardFontStyle;
  /** Multi-tier palette tier (2, 3, or 4 color theme) */
  paletteTier?: ThemePaletteTier;
  /** Explicit array of 2, 3, or 4 colors forming the theme palette */
  paletteColors?: string[];
  /** Set when this section uses a saved custom theme from the card library. */
  customThemeId?: string;
  customThemeName?: string;
};

export type ResolvedLayoutSlots = {
  background: string;
  surface: string;
  accent: string;
  highlight: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  surfaceTextPrimary: string;
  surfaceTextSecondary: string;
  surfaceTextMuted: string;
  bgTextPrimary: string;
  bgTextSecondary: string;
  bgTextMuted: string;
  accentText: string;
  gradientText: string;
  logoBackdrop: string;
  logoBorder: string;
  borderColor: string;
  isDark: boolean;
};

export type CardThemePresetId = Exclude<CardThemeId, 'custom'>;

export const CARD_THEME_PRESETS: Record<CardThemePresetId, Omit<CardVisualTheme, 'fontStyle'>> = {
  ocean: { id: 'ocean', backgroundColor: '#eff6ff', surfaceColor: '#ffffff', textColor: '#0f172a', mutedTextColor: '#64748b', accentColor: '#0284c7', gradient: ['#2563eb', '#00a8e8'] },
  midnight: { id: 'midnight', backgroundColor: '#020617', surfaceColor: '#0f172a', textColor: '#f8fafc', mutedTextColor: '#94a3b8', accentColor: '#38bdf8', gradient: ['#111827', '#020617'] },
  violet: { id: 'violet', backgroundColor: '#f5f3ff', surfaceColor: '#ffffff', textColor: '#2e1065', mutedTextColor: '#7c3aed', accentColor: '#7c3aed', gradient: ['#4f46e5', '#7c3aed'] },
  sand: { id: 'sand', backgroundColor: '#fffbeb', surfaceColor: '#fff7ed', textColor: '#451a03', mutedTextColor: '#92400e', accentColor: '#ea580c', gradient: ['#f59e0b', '#ea580c'] },
  sunset: {
    id: 'sunset',
    backgroundColor: '#fff7ed',
    surfaceColor: '#ffffff',
    textColor: '#431407',
    mutedTextColor: '#c2410c',
    accentColor: '#f97316',
    gradient: ['#fb923c', '#ec4899'],
  },
  aurora: {
    id: 'aurora',
    backgroundColor: '#ecfdf5',
    surfaceColor: '#ffffff',
    textColor: '#064e3b',
    mutedTextColor: '#0f766e',
    accentColor: '#14b8a6',
    gradient: ['#10b981', '#06b6d4'],
  },
};

export const DEFAULT_CARD_THEME: CardVisualTheme = { ...CARD_THEME_PRESETS.ocean, fontStyle: 'modern' };

export type DynamicCardField = {
  id: string;
  title: string;
  type: DynamicCardFieldType;
  value: string;
};

export type CardSectionFieldId =
  | 'preferredName' | 'coverPhoto' | 'profilePhoto' | 'logo'
  | 'tagline' | 'accreditations' | 'prefix' | 'suffix'
  | 'firstName' | 'middleName' | 'lastName' | 'title' | 'company'
  | 'bio';

export type CardSectionLayouts = Record<CardSectionId, CardLayoutId>;
export type CardSectionThemes = Record<CardSectionId, CardVisualTheme>;
export type CardSectionOverrides = Partial<Record<CardSectionFieldId, string>>;

export const DEFAULT_CARD_SECTION_LAYOUTS: CardSectionLayouts = {
  identity: 'layout-1',
  professional: 'classic',
  bio: 'classic',
  connections: 'classic',
};

export function createDefaultCardSectionThemes(theme: CardVisualTheme = DEFAULT_CARD_THEME): CardSectionThemes {
  return {
    identity: { ...theme, gradient: [...theme.gradient] },
    professional: { ...theme, gradient: [...theme.gradient] },
    bio: { ...theme, gradient: [...theme.gradient] },
    connections: { ...theme, gradient: [...theme.gradient] },
  };
}

export type BusinessCard = {
  id: string;
  isPrimary?: boolean;
  category: string;
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  gradient: [string, string];
  sectionLayouts: CardSectionLayouts;
  sectionThemes: CardSectionThemes;
  sectionOverrides: CardSectionOverrides;
  connectionFields: DynamicCardField[];
  connectionFieldsCustomized: boolean;
  cardTheme: CardVisualTheme;
  /** User-created gradient themes for this card (shown first in the theme picker). */
  customThemes?: SavedSectionTheme[];
  createdAt?: string;
  updatedAt?: string;
};
