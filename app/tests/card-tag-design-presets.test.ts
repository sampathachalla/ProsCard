import { describe, expect, it } from 'vitest';
import {
  resolveCardSectionTheme,
  savedSectionTheme,
  withResolvedCardTheme,
} from '@/pages/addCard/Config/cardTagDesignPresets';
import type { BusinessCard } from '@/pages/cards/types/card.types';
import { CARD_THEME_PRESETS } from '@/pages/cards/types/card.types';

function minimalCard(overrides: Partial<BusinessCard> = {}): BusinessCard {
  const baseTheme = { ...CARD_THEME_PRESETS.ocean, gradient: [...CARD_THEME_PRESETS.ocean.gradient] as [string, string], fontStyle: 'modern' as const };
  return {
    id: 'c1',
    name: 'Test',
    title: '',
    company: '',
    phone: '',
    email: '',
    gradient: [baseTheme.gradient[0], baseTheme.gradient[1]],
    category: 'business',
    isPrimary: false,
    createdAt: '',
    updatedAt: '',
    sectionLayouts: { identity: 'layout-1', professional: 'layout-1', connections: 'compact' },
    sectionThemes: { identity: baseTheme, professional: baseTheme, connections: baseTheme },
    sectionOverrides: {},
    connectionFields: [],
    connectionFieldsCustomized: false,
    cardTheme: baseTheme,
    ...overrides,
  };
}

describe('resolveCardSectionTheme', () => {
  it('uses the card tag theme when logo themes are off and tag design is on', () => {
    const card = minimalCard({ sectionOverrides: { cardTag: 'Personal' } });
    const resolved = resolveCardSectionTheme('identity', card, {
      tagDesignEnabled: true,
      logoThemesEnabled: false,
      logoTheme: null,
    });
    expect(resolved.gradient).toEqual(CARD_THEME_PRESETS.slate.gradient);
  });

  it('uses saved section theme when tag design is off and logo themes are off', () => {
    const card = minimalCard({
      sectionOverrides: { cardTag: 'Personal' },
      sectionThemes: {
        identity: {
          ...CARD_THEME_PRESETS.ocean,
          gradient: ['#111111', '#222222'] as [string, string],
          fontStyle: 'modern',
        },
        professional: {
          ...CARD_THEME_PRESETS.ocean,
          gradient: [...CARD_THEME_PRESETS.ocean.gradient] as [string, string],
          fontStyle: 'modern',
        },
        connections: {
          ...CARD_THEME_PRESETS.ocean,
          gradient: [...CARD_THEME_PRESETS.ocean.gradient] as [string, string],
          fontStyle: 'modern',
        },
      },
    });
    const resolved = resolveCardSectionTheme('identity', card, {
      tagDesignEnabled: false,
      logoThemesEnabled: false,
      logoTheme: null,
    });
    expect(resolved.gradient).toEqual(['#111111', '#222222']);
  });

  it('prefers logo-derived theme when logo themes are on', () => {
    const card = minimalCard();
    const logoTheme = {
      ...card.cardTheme,
      gradient: ['#abcdef', '#fedcba'] as [string, string],
    };
    const resolved = resolveCardSectionTheme('identity', card, {
      tagDesignEnabled: true,
      logoThemesEnabled: true,
      logoTheme,
    });
    expect(resolved.gradient).toEqual(['#abcdef', '#fedcba']);
  });
});

describe('withResolvedCardTheme / savedSectionTheme', () => {
  const palette = {
    dominant: '#e11d48',
    secondary: '#9f1239',
    accent: '#fb7185',
    hasDarkElements: true,
    hasLightElements: false,
    suggestedGradient: ['#e11d48', '#9f1239'] as [string, string],
    suggestedSurface: '#fff1f2',
    isDarkRecommended: false,
  };

  it('stores the logo theme without touching the card\'s own themes', () => {
    const card = minimalCard({ sectionOverrides: { logo: 'https://example.com/logo.png' } });
    const applied = withResolvedCardTheme(card, { tagDesignEnabled: true, logoThemesEnabled: true, logoPalette: palette });
    expect(applied.appliedTheme).toBeTruthy();
    expect(applied.sectionThemes).toEqual(card.sectionThemes);
    expect(savedSectionTheme(applied, 'identity')).toEqual(applied.appliedTheme);
    expect(savedSectionTheme(applied, 'professional').backgroundColor).toBe(applied.appliedTheme?.backgroundColor);
    expect(savedSectionTheme(applied, 'connections').surfaceColor).toBe(applied.appliedTheme?.surfaceColor);
  });

  it('restores the card tag theme when logo themes are switched off', () => {
    const card = minimalCard({ sectionOverrides: { logo: 'https://example.com/logo.png', cardTag: 'Personal' } });
    const on = withResolvedCardTheme(card, { tagDesignEnabled: true, logoThemesEnabled: true, logoPalette: palette });
    const off = withResolvedCardTheme(on, { tagDesignEnabled: true, logoThemesEnabled: false });
    expect(off.appliedTheme).toBeTruthy();
    expect(savedSectionTheme(off, 'professional').gradient).toEqual(CARD_THEME_PRESETS.slate.gradient);
  });

  it('never overrides a custom theme', () => {
    const card = minimalCard({ cardTheme: { ...minimalCard().cardTheme, customThemeId: 'mine' } });
    const applied = withResolvedCardTheme(card, { tagDesignEnabled: true, logoThemesEnabled: true, logoPalette: palette });
    expect(applied.appliedTheme).toBeNull();
  });
});
