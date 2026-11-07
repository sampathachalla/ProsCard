import { describe, expect, it } from 'vitest';
import {
  CARD_TEXT_LIMITS,
  fitAccreditationsToViewport,
  fitCardText,
  fitProfessionalName,
  fitTaglineToViewport,
  splitGraphemes,
} from '@/utils/cardTextLayout';

describe('card-safe text layouts and bounds', () => {
  it('does not split emoji or complex grapheme clusters', () => {
    // 👨‍👩‍👧‍👦 is a ZWJ sequence
    const familyEmoji = '👨‍👩‍👧‍👦';
    expect(splitGraphemes(familyEmoji)).toEqual(['👨‍👩‍👧‍👦']);

    // Flag sequence
    const flag = '🇺🇸';
    expect(splitGraphemes(flag)).toEqual(['🇺🇸']);

    // Clamping emoji does not corrupt UTF-16 surrogate pairs or ZWJ
    const textWithEmoji = 'CEO 🚀 ' + familyEmoji;
    const clamped = fitCardText(textWithEmoji, 8);
    // Should safely clamp without breaking surrogate halves
    expect(() => encodeURIComponent(clamped)).not.toThrow();
  });

  it('avoids cutting mid-word when possible while respecting max length', () => {
    const text = 'Vice President of Global Engineering Operations';
    const clipped = fitCardText(text, 32);
    expect(clipped.length).toBeLessThanOrEqual(32);
    // Should end cleanly on a word boundary
    expect(clipped).toBe('Vice President of Global');
  });

  it('keeps long single words strictly within limit without crashing', () => {
    const singleWord = 'SupercalifragilisticexpialidociousLongName';
    const clipped = fitCardText(singleWord, 32);
    expect(clipped.length).toBe(32);
    expect(clipped).toBe('Supercalifragilisticexpialidocio');
  });

  it('fitProfessionalName progressively optimizes long names to fit 32 chars', () => {
    // Fits full name if short enough
    const shortName = fitProfessionalName({
      prefix: 'Dr.',
      firstName: 'Jane',
      lastName: 'Doe',
      suffix: 'PhD',
    });
    expect(shortName).toBe('Dr. Jane Doe PhD');

    // Too long: drops prefix and suffix and abbreviates middle name
    const longName = fitProfessionalName({
      prefix: 'Prof. Dr.',
      firstName: 'Alexander',
      middleName: 'Maximilian',
      lastName: 'Montgomery-Smith',
      suffix: 'Esq.',
    });
    expect(longName.length).toBeLessThanOrEqual(CARD_TEXT_LIMITS.professionalName);
    expect(longName).toBe('Alexander M. Montgomery-Smith');
  });

  it('never returns text longer than the budget for any edge case input', () => {
    const stressInputs = [
      'W'.repeat(200),
      '日本語の長いテキストが入るテストです。レイアウトが崩れないか検証します。',
      '🔥'.repeat(50),
      '   \n\t  spaced out text \t \n ',
      'A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R',
    ];

    for (const input of stressInputs) {
      const cardTitle = fitCardText(input, CARD_TEXT_LIMITS.title);
      expect(cardTitle.length).toBeLessThanOrEqual(CARD_TEXT_LIMITS.title);

      const company = fitCardText(input, CARD_TEXT_LIMITS.company);
      expect(company.length).toBeLessThanOrEqual(CARD_TEXT_LIMITS.company);

      const tagline = fitTaglineToViewport(input, 320);
      expect(tagline.length).toBeLessThanOrEqual(CARD_TEXT_LIMITS.tagline);

      const accreditations = fitAccreditationsToViewport(input, 320);
      expect(accreditations.length).toBeLessThanOrEqual(CARD_TEXT_LIMITS.accreditations);
    }
  });
});
