import {
  CARD_TAG_OPTIONS,
  CARD_THEME_PRESETS,
  type CardFontStyle,
  type CardSectionLayouts,
  type CardVisualTheme,
} from '@/pages/cards/types/card.types';

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
    layouts: { identity: 'layout-1', professional: 'layout-1', connections: 'editorial' },
    theme: theme('ocean', 'modern'),
  },
  Personal: {
    layouts: { identity: 'layout-2', professional: 'layout-1', connections: 'compact' },
    theme: theme('sand', 'rounded'),
  },
  Networking: {
    layouts: { identity: 'layout-5-new', professional: 'layout-3', connections: 'compact' },
    theme: theme('aurora', 'modern'),
  },
  Portfolio: {
    layouts: { identity: 'layout-6', professional: 'layout-5', connections: 'editorial' },
    theme: theme('violet', 'classic'),
  },
};

export function isCardTag(value: string): value is CardTag {
  return (CARD_TAG_OPTIONS as readonly string[]).includes(value);
}
