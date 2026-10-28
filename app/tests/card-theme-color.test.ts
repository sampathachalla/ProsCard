import { describe, expect, it } from 'vitest';
import type { CardVisualTheme } from '@/pages/cards/types/card.types';
import { buildDynamicTagThemes, buildThemeFromLogoPalette, contrastRatio, resolveLayoutColorSlots } from '@/utils/cardThemeColor';

const theme: CardVisualTheme = {
  id: 'custom',
  backgroundColor: '#e8f8f1',
  surfaceColor: '#f6fcf9',
  textColor: '#123b31',
  mutedTextColor: '#315f52',
  accentColor: '#059669',
  gradient: ['#047857', '#0f766e'],
  fontStyle: 'modern',
  paletteTier: 3,
  paletteColors: ['#e8f8f1', '#f6fcf9', '#059669'],
};

describe('enterprise card theme colors', () => {
  it('uses the authored theme font colors when they meet readable contrast', () => {
    const slots = resolveLayoutColorSlots({ templateId: 'classic', theme });
    expect(slots.surfaceTextPrimary).toBe('#123b31');
    expect(slots.surfaceTextSecondary).toBe('#315f52');
    expect(contrastRatio(slots.surfaceTextPrimary, slots.surface)).toBeGreaterThanOrEqual(4.5);
  });

  it('falls back to safe text when an authored color has insufficient contrast', () => {
    const slots = resolveLayoutColorSlots({
      templateId: 'classic',
      theme: { ...theme, textColor: '#ffffff', mutedTextColor: '#ffffff' },
    });
    expect(slots.surfaceTextPrimary).toBe('#0f172a');
    expect(contrastRatio(slots.surfaceTextPrimary, slots.surface)).toBeGreaterThanOrEqual(4.5);
  });

  it('generates 4 distinct dynamic brand themes from a logo palette', () => {
    const palette = {
      dominant: '#00bffe',
      secondary: '#0072bc',
      accent: '#00e0fd',
      hasDarkElements: true,
      hasLightElements: true,
      suggestedGradient: ['#0072bc', '#00bffe'] as [string, string],
      suggestedSurface: '#ffffff',
      isDarkRecommended: false,
    };

    const dynamicThemes = buildDynamicTagThemes(palette);
    expect(dynamicThemes.Business).toBeDefined();
    expect(dynamicThemes.Personal).toBeDefined();
    expect(dynamicThemes.Networking).toBeDefined();
    expect(dynamicThemes.Portfolio).toBeDefined();

    // High contrast light surface for dark text logos
    expect(dynamicThemes.Business.surfaceColor).toBe('#ffffff');
    expect(dynamicThemes.Networking.surfaceColor).toBe('#ffffff');

    // Font styles matched to tag purpose
    expect(dynamicThemes.Business.fontStyle).toBe('modern');
    expect(dynamicThemes.Personal.fontStyle).toBe('rounded');
    expect(dynamicThemes.Portfolio.fontStyle).toBe('classic');

    // Tag theme selection via buildThemeFromLogoPalette
    const networkingTheme = buildThemeFromLogoPalette(palette, 'modern', 'Networking');
    expect(networkingTheme.customThemeName).toBe('Brand Networking');
    expect(networkingTheme.surfaceColor).toBe('#ffffff');
  });
});
