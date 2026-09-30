import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/profileComponents/Services/mediaService', () => ({
  requestMediaUpload: vi.fn(), uploadToObjectStorage: vi.fn(), confirmMedia: vi.fn(),
}));

import { isPendingMediaUrl, mediaIdFromContentUrl } from '@/components/profileComponents/Services/pendingMedia';

describe('media model helpers', () => {
  it('recognizes device-local selections but not server references', () => {
    expect(isPendingMediaUrl('file:///avatar.jpg')).toBe(true);
    expect(isPendingMediaUrl('content://photos/avatar')).toBe(true);
    expect(isPendingMediaUrl('blob:http://localhost:8081/5f2c-uuid')).toBe(true);
    expect(isPendingMediaUrl('/api/v1/media/id/content')).toBe(false);
  });

  it('extracts media IDs only from protected content references', () => {
    expect(mediaIdFromContentUrl('/api/v1/media/abc-123/content')).toBe('abc-123');
    expect(mediaIdFromContentUrl('https://example.com/avatar.jpg')).toBeNull();
  });
});
