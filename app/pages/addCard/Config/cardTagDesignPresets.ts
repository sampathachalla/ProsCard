import {
  CARD_TAG_OPTIONS,
  CARD_THEME_PRESETS,
  type CardFontStyle,
  type CardSectionId,
  type CardSectionLayouts,
  type CardVisualTheme,
  type BusinessCard,
} from '@/pages/cards/types/card.types';
import type { LogoPalette } from '@/services/api/types';
import { buildDynamicTagThemes, buildThemeFromLogoPalette } from '@/utils/cardThemeColor';

export type CardTag = (typeof CARD_TAG_OPTIONS)[number];

type CardTagDesignPreset = {
  layouts: CardSectionLayouts;
  theme: CardVisualTheme;
};

function theme(
  id: keyof typeof CARD_THEME_PRESETS,
  fontStyle: CardFontStyle,
): CardVisualTheme {
  return { ...CARD_THEME_PRESETS[id], gradient: [...CARD_THEME_PRESETS[id].gradient], fontStyle };
}

export const CARD_TAG_DESIGN_PRESETS: Record<CardTag, CardTagDesignPreset> = {
  Business: {
    layouts: { identity: 'layout-1', professional: 'layout-1', connections: 'compact' },
    theme: theme('navy', 'modern'),
  },
  Personal: {
    layouts: { identity: 'layout-2', professional: 'layout-1', connections: 'compact' },
    theme: theme('slate', 'rounded'),
  },
  Networking: {
    layouts: { identity: 'layout-5-new', professional: 'layout-3', connections: 'compact' },
    theme: theme('ocean', 'modern'),
  },
  Portfolio: {
    layouts: { identity: 'layout-6', professional: 'layout-5', connections: 'compact' },
    theme: theme('midnight', 'classic'),
  },
};

export function getCardTagDesignPreset(
  tag: CardTag,
  logoPalette?: LogoPalette,
): CardTagDesignPreset {
  const base = CARD_TAG_DESIGN_PRESETS[tag];
  if (!logoPalette) return base;
  const dynamicThemes = buildDynamicTagThemes(logoPalette);
  return {
    layouts: { ...base.layouts },
    theme: dynamicThemes[tag] ?? base.theme,
  };
}

export function isCardTag(value: string): value is CardTag {
  return (CARD_TAG_OPTIONS as readonly string[]).includes(value);
}

export function resolveCardTag(card: BusinessCard): CardTag {
  const tag = card.sectionOverrides?.cardTag;
  return tag && isCardTag(tag) ? tag : 'Business';
}

function withThemeEverywhere(card: BusinessCard, theme: CardVisualTheme): BusinessCard {
  const copy = () => ({ ...theme, gradient: [...theme.gradient] as [string, string] });
  return {
    ...card,
    gradient: [theme.gradient[0], theme.gradient[1]],
    cardTheme: copy(),
    sectionThemes: { identity: copy(), professional: copy(), connections: copy() },
  };
}

/** Applies tag preset layouts and colors when tag-based design is enabled in profile. */
export function applyCardTagDesign(
  card: BusinessCard,
  tag: CardTag,
  options: { logoThemesEnabled: boolean; logoPalette?: LogoPalette },
): BusinessCard {
  const preset = getCardTagDesignPreset(tag, options.logoThemesEnabled ? options.logoPalette : undefined);
  return withThemeEverywhere(
    {
      ...card,
      sectionLayouts: { ...preset.layouts },
      sectionOverrides: { ...card.sectionOverrides, cardTag: tag },
    },
    preset.theme,
  );
}

/** Theme shown for a section given profile toggles and optional logo-derived theme. */
export function resolveCardSectionTheme(
  sectionId: CardSectionId,
  card: BusinessCard,
  options: {
    tagDesignEnabled: boolean;
    logoThemesEnabled: boolean;
    logoTheme: CardVisualTheme | null;
  },
): CardVisualTheme {
  if (options.logoThemesEnabled && options.logoTheme && !card.cardTheme?.customThemeId) {
    return options.logoTheme;
  }
  if (options.tagDesignEnabled && !card.cardTheme?.customThemeId) {
    return getCardTagDesignPreset(resolveCardTag(card)).theme;
  }
  // Tag presets are written into the card's own themes when the tag is picked (applyCardTagDesign).
  return card.sectionThemes[sectionId] ?? card.cardTheme;
}

/**
 * Stores the theme the profile toggles produce in `appliedTheme`, leaving the card's own themes
 * untouched so switching a toggle off restores them. Saved views read it via `savedSectionTheme`.
 */
export function withResolvedCardTheme(
  card: BusinessCard,
  options: {
    tagDesignEnabled: boolean;
    logoThemesEnabled: boolean;
    logoPalette?: LogoPalette;
  },
): BusinessCard {
  const cardTag = resolveCardTag(card);
  const appliedTheme = !card.cardTheme?.customThemeId
    ? options.logoThemesEnabled && options.logoPalette
      ? buildThemeFromLogoPalette(options.logoPalette, card.cardTheme?.fontStyle, cardTag)
      : options.tagDesignEnabled
        ? getCardTagDesignPreset(cardTag).theme
        : null
    : null;
  return { ...card, appliedTheme: appliedTheme ? { ...appliedTheme, gradient: [...appliedTheme.gradient] as [string, string] } : null };
}

/** Theme every saved view (phone and public share link) renders for a section. */
export function savedSectionTheme(card: BusinessCard, sectionId: CardSectionId): CardVisualTheme {
  return card.appliedTheme ?? card.sectionThemes[sectionId] ?? card.cardTheme;
}
