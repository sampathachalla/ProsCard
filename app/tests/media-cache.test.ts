import { beforeEach, describe, expect, it, vi } from 'vitest';

const storage = vi.hoisted(() => new Map<string, string>());
const files = vi.hoisted(() => new Set<string>());

vi.mock('expo-file-system', () => {
  class Directory {
    uri: string;
    constructor(...parts: ({ uri: string } | string)[]) {
      this.uri = parts.map((part) => typeof part === 'string' ? part : part.uri).join('/').replace(/\/{2,}/g, '/').replace('file:/', 'file://');
    }
    get exists() { return true; }
    create() {}
    delete() { files.clear(); }
  }
  class File {
    uri: string;
    constructor(...parts: ({ uri: string } | string)[]) {
      this.uri = parts.map((part) => typeof part === 'string' ? part : part.uri).join('/').replace(/\/{2,}/g, '/').replace('file:/', 'file://');
    }
    get exists() { return files.has(this.uri); }
    delete() { files.delete(this.uri); }
    async copy(destination: File) { files.add(destination.uri); }
    static async downloadFileAsync(_url: string, destination: File) {
      files.add(destination.uri);
      return destination;
    }
  }
  return { Directory, File, Paths: { cache: { uri: 'file:///cache' } } };
});

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async (key: string) => storage.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => { storage.set(key, value); }),
    removeItem: vi.fn(async (key: string) => { storage.delete(key); }),
    getAllKeys: vi.fn(async () => [...storage.keys()]),
    multiRemove: vi.fn(async (keys: string[]) => { keys.forEach((key) => storage.delete(key)); }),
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
    files.clear();
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
