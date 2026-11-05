import { describe, expect, it } from 'vitest';
import {
  CARD_TEXT_LIMITS,
  CONTACT_TEXT_LIMITS,
  fitAccreditationsToViewport,
  fitCardText,
  fitTaglineToViewport,
} from '@/utils/cardTextLayout';

describe('card-safe text budgets', () => {
  it('keeps the fields that share narrow layouts within their tested budgets', () => {
    expect(CARD_TEXT_LIMITS.professionalName).toBe(32);
    expect(CARD_TEXT_LIMITS.title).toBe(32);
    expect(CARD_TEXT_LIMITS.company).toBe(32);
    expect(CARD_TEXT_LIMITS.accreditations).toBe(24);
    expect(CARD_TEXT_LIMITS.tagline).toBe(48);
    expect(CARD_TEXT_LIMITS.bio).toBe(180);
    expect(CONTACT_TEXT_LIMITS.name).toBe(48);
    expect(CONTACT_TEXT_LIMITS.email).toBe(80);
    expect(CONTACT_TEXT_LIMITS.website).toBe(96);
    expect(CONTACT_TEXT_LIMITS.address).toBe(120);
  });

  it('clips legacy oversized values before rendering', () => {
    expect(fitCardText(`  ${'N'.repeat(40)}  `, 32)).toHaveLength(32);
    expect(fitTaglineToViewport('T'.repeat(60), 320)).toHaveLength(48);
    expect(fitAccreditationsToViewport('A'.repeat(40), 320)).toHaveLength(24);
  });
});
