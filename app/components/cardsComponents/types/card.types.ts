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

export type CardSectionLayouts = Record<CardSectionId, CardTemplateId>;
export type CardSectionThemes = Record<CardSectionId, CardVisualTheme>;
export type CardSectionOverrides = Partial<Record<CardSectionFieldId, string>>;

export const DEFAULT_CARD_SECTION_LAYOUTS: CardSectionLayouts = {
  identity: 'classic',
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
};
