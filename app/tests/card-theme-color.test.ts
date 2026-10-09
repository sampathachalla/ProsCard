import { describe, expect, it } from 'vitest';
import type { CardVisualTheme } from '@/components/cardsComponents/types/card.types';
import { contrastRatio, resolveLayoutColorSlots } from '@/utils/cardThemeColor';

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
});
