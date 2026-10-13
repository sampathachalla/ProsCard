import { describe, expect, it } from 'vitest';
import { formatPersonName } from '@/utils/personName';

describe('formatPersonName', () => {
  it('capitalizes first, middle, and last names for display', () => {
    expect(formatPersonName('sampath vinayak achalla')).toBe('Sampath Vinayak Achalla');
  });

  it('handles hyphenated and apostrophe names without lowercasing saved casing', () => {
    expect(formatPersonName("mary-jane o'Neil")).toBe("Mary-Jane O'Neil");
  });
});
