import AsyncStorage from '@react-native-async-storage/async-storage';

type CachedDownloadUrl = {
  url: string;
  expiresAt: number;
};

const SIGNED_URL_CACHE_PREFIX = 'proscard:media-download-url:';
const SIGNED_URL_CACHE_TTL_MS = 10 * 60 * 1000;
const memoryCache = new Map<string, CachedDownloadUrl>();
const pendingRequests = new Map<string, Promise<string>>();

function storageKey(mediaId: string) {
  return `${SIGNED_URL_CACHE_PREFIX}${mediaId}`;
}

function isUsable(entry: CachedDownloadUrl | undefined): entry is CachedDownloadUrl {
  return Boolean(entry?.url && entry.expiresAt > Date.now());
}

function parseStoredEntry(value: string | null): CachedDownloadUrl | undefined {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value) as Partial<CachedDownloadUrl>;
    if (typeof parsed.url === 'string' && typeof parsed.expiresAt === 'number') {
      return { url: parsed.url, expiresAt: parsed.expiresAt };
    }
  } catch {
    // A malformed or old cache entry is treated as a cache miss.
  }
  return undefined;
}

export function mediaImageCacheKey(mediaId: string): string {
  return `proscard-media:${mediaId}`;
}

export function peekCachedMediaDownloadUrl(mediaId: string): string | undefined {
  const entry = memoryCache.get(mediaId);
  return isUsable(entry) ? entry.url : undefined;
}

export async function getCachedMediaDownloadUrl(
  mediaId: string,
  load: () => Promise<string>,
): Promise<string> {
  const memoryEntry = memoryCache.get(mediaId);
  if (isUsable(memoryEntry)) return memoryEntry.url;

  const pending = pendingRequests.get(mediaId);
  if (pending) return pending;

  const request = (async () => {
    try {
      const persisted = parseStoredEntry(await AsyncStorage.getItem(storageKey(mediaId)));
      if (isUsable(persisted)) {
        memoryCache.set(mediaId, persisted);
        return persisted.url;
      }
    } catch {
      // Storage availability must never prevent an image from loading.
    }

    const url = await load();
    const entry: CachedDownloadUrl = {
      url,
      expiresAt: Date.now() + SIGNED_URL_CACHE_TTL_MS,
    };
    memoryCache.set(mediaId, entry);
    try {
      await AsyncStorage.setItem(storageKey(mediaId), JSON.stringify(entry));
    } catch {
      // The in-memory and native image caches still provide a useful fallback.
    }
    return url;
  })().finally(() => {
    pendingRequests.delete(mediaId);
  });

  pendingRequests.set(mediaId, request);
  return request;
}

export async function invalidateCachedMedia(mediaId: string): Promise<void> {
  memoryCache.delete(mediaId);
  pendingRequests.delete(mediaId);
  try {
    await AsyncStorage.removeItem(storageKey(mediaId));
  } catch {
    // The server-side deletion has already succeeded; local cleanup is best effort.
  }
}
