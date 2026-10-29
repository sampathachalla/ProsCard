import { describe, expect, it } from 'vitest';
import {
  fitTaglineToViewport,
  getEffectiveCardContentWidth,
  getProfessionalTaglineFontSize,
} from '@/utils/cardTextLayout';

describe('cardTextLayout', () => {
  it('does not slice tagline text', () => {
    const copy = 'I am here to bring the tools used by future';
    expect(fitTaglineToViewport(copy, 390)).toBe(copy);
  });

  it('caps layout width to the share card column on wide viewports', () => {
    expect(getEffectiveCardContentWidth(1200)).toBe(520);
    expect(getEffectiveCardContentWidth(390)).toBe(390);
  });

  it('sizes long taglines to fit roughly two lines in the share column', () => {
    const width = getEffectiveCardContentWidth(1200) - 40;
    const size = getProfessionalTaglineFontSize(width, 44, false);
    expect(size).toBeGreaterThanOrEqual(14);
    expect(size).toBeLessThanOrEqual(18);
  });
});
