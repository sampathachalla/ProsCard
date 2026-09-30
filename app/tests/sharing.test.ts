import { describe, expect, it, vi } from 'vitest';

vi.mock('@/services/api/client', () => ({ apiRequest: vi.fn() }));
vi.mock('@/components/authComponents/Config/authMode', () => ({ AUTH_TEST_MODE: false }));

import { parseShareSlug, shareUrlForSlug } from '@/components/sharingComponents/Services/sharingService';

describe('share links', () => {
  it('round-trips a slug through the QR share URL', () => {
    expect(parseShareSlug(shareUrlForSlug('Ab3_x-9Q'))).toBe('Ab3_x-9Q');
  });

  it('accepts share URLs from any origin, with trailing slash or query', () => {
    expect(parseShareSlug('http://192.168.1.10:8081/share/abc123/')).toBe('abc123');
    expect(parseShareSlug('https://proscard.app/share/abc123?ref=qr')).toBe('abc123');
  });

  it('rejects QR codes that are not ProsCard share links', () => {
    expect(parseShareSlug('https://example.com/some/page')).toBeNull();
    expect(parseShareSlug('WIFI:S:home;T:WPA;P:secret;;')).toBeNull();
    expect(parseShareSlug('https://proscard.app/card/123e4567')).toBeNull();
  });
});
