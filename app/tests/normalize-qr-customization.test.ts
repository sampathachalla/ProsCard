import { describe, expect, it } from 'vitest';

import { normalizeQrCustomization } from '@/pages/share/Utils/normalizeQrCustomization';

describe('normalizeQrCustomization', () => {
  it('coerces invalid persisted caption values', () => {
    const result = normalizeQrCustomization({
      caption: null as unknown as string,
      captionVisible: true,
    });
    expect(typeof result.caption).toBe('string');
    expect(() => result.caption.trim()).not.toThrow();
  });

  it('keeps the default captionVisible when the stored value is not a boolean', () => {
    const result = normalizeQrCustomization({
      captionVisible: undefined as unknown as boolean,
    });
    expect(result.captionVisible).toBe(true);
    expect(normalizeQrCustomization({ captionVisible: false }).captionVisible).toBe(false);
  });

  it('rejects unknown enum values', () => {
    const result = normalizeQrCustomization({
      patternStyle: 'invalid' as 'dots',
      cornerStyle: 'invalid' as 'rounded',
    });
    expect(result.patternStyle).toBe('dots');
    expect(result.cornerStyle).toBe('rounded');
  });
});
