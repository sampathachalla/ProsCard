import { describe, expect, it } from 'vitest';
import { getBusinessCardHeight } from '@/components/homepageComponents/Utils/businessCardLayout';

describe('homepage business-card sizing', () => {
  it('uses the taller preview range when vertical space is available', () => {
    expect(getBusinessCardHeight(340, 730)).toBe(730);
  });

  it('never extends beyond the available showcase height', () => {
    expect(getBusinessCardHeight(340, 620)).toBe(620);
  });
});
