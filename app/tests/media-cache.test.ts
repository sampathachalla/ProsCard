import { beforeEach, describe, expect, it, vi } from 'vitest';

const storage = vi.hoisted(() => new Map<string, string>());

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async (key: string) => storage.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => { storage.set(key, value); }),
    removeItem: vi.fn(async (key: string) => { storage.delete(key); }),
  },
}));

import {
  getCachedMediaDownloadUrl,
  invalidateCachedMedia,
  mediaImageCacheKey,
} from '@/components/profileComponents/Services/mediaCache';

describe('media cache', () => {
  beforeEach(() => {
    storage.clear();
  });

  it('deduplicates simultaneous signed URL requests and reuses the result', async () => {
    const load = vi.fn(async () => 'https://object-storage.example/signed-photo');

    const [first, second] = await Promise.all([
      getCachedMediaDownloadUrl('media-dedup', load),
      getCachedMediaDownloadUrl('media-dedup', load),
    ]);
    const third = await getCachedMediaDownloadUrl('media-dedup', load);

    expect(first).toBe(second);
    expect(third).toBe(first);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('removes signed URL metadata when media is deleted', async () => {
    const load = vi.fn(async () => 'https://object-storage.example/signed-logo');
    await getCachedMediaDownloadUrl('media-delete', load);
    await invalidateCachedMedia('media-delete');
    await getCachedMediaDownloadUrl('media-delete', load);

    expect(load).toHaveBeenCalledTimes(2);
  });

  it('uses a stable native image cache key for each media object', () => {
    expect(mediaImageCacheKey('123')).toBe('proscard-media:123');
  });
});
