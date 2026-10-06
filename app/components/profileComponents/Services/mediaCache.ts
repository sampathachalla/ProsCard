import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';

type CachedDownloadUrl = {
  url: string;
  expiresAt: number;
};

const SIGNED_URL_CACHE_PREFIX = 'proscard:media-download-url:';
const FILE_CACHE_PREFIX = 'proscard:media-file:';
const SIGNED_URL_CACHE_TTL_MS = 10 * 60 * 1000;
const memoryCache = new Map<string, CachedDownloadUrl>();
const pendingRequests = new Map<string, Promise<string>>();
const memoryFileCache = new Map<string, string>();
const pendingFileRequests = new Map<string, Promise<string>>();
let mediaDirectoryRef: Directory | undefined;

/**
 * Created on first use, not when this file loads: if the native file system is missing (an older
 * build, or web), the error is caught by the caller and images load from their signed URL instead of
 * the app failing to start.
 */
function mediaDirectory(): Directory {
  mediaDirectoryRef ??= new Directory(Paths.cache, 'proscard-media');
  return mediaDirectoryRef;
}

function storageKey(mediaId: string) {
  return `${SIGNED_URL_CACHE_PREFIX}${mediaId}`;
}

function fileStorageKey(mediaId: string) {
  return `${FILE_CACHE_PREFIX}${mediaId}`;
}

function mediaFile(mediaId: string) {
  return new File(mediaDirectory(), `${mediaId.replace(/[^a-zA-Z0-9_-]/g, '_')}.image`);
}

function existingFileUri(uri: string | null | undefined): string | undefined {
  if (!uri || Platform.OS === 'web') return undefined;
  try {
    return new File(uri).exists ? uri : undefined;
  } catch {
    return undefined;
  }
}

function ensureMediaDirectory() {
  const directory = mediaDirectory();
  if (!directory.exists) directory.create({ intermediates: true, idempotent: true });
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

/** Returns an already verified device-local image without touching the network. */
export function peekCachedMediaFileUrl(mediaId: string): string | undefined {
  const uri = memoryFileCache.get(mediaId);
  const usable = existingFileUri(uri);
  if (!usable && uri) memoryFileCache.delete(mediaId);
  return usable;
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

/**
 * Keeps the actual protected image on-device, keyed by the stable media id. Signed OCI URLs are
 * deliberately short lived; the local file remains usable until that media object is replaced,
 * deleted, evicted by the OS, or cleared on logout.
 */
export async function getCachedMediaFileUrl(
  mediaId: string,
  loadDownloadUrl: () => Promise<string>,
): Promise<string> {
  if (Platform.OS === 'web') return loadDownloadUrl();

  const immediate = peekCachedMediaFileUrl(mediaId);
  if (immediate) return immediate;

  const pending = pendingFileRequests.get(mediaId);
  if (pending) return pending;

  const request = (async () => {
    try {
      const persisted = existingFileUri(await AsyncStorage.getItem(fileStorageKey(mediaId)));
      if (persisted) {
        memoryFileCache.set(mediaId, persisted);
        return persisted;
      }
    } catch {
      // A cache miss must never prevent the protected OCI image from loading.
    }

    const downloadUrl = await loadDownloadUrl();
    try {
      ensureMediaDirectory();
      const destination = mediaFile(mediaId);
      const downloaded = await File.downloadFileAsync(downloadUrl, destination, { idempotent: true });
      memoryFileCache.set(mediaId, downloaded.uri);
      await AsyncStorage.setItem(fileStorageKey(mediaId), downloaded.uri).catch(() => {});
      return downloaded.uri;
    } catch {
      // expo-image can still render and cache the signed URL if filesystem caching is unavailable.
      return downloadUrl;
    }
  })().finally(() => pendingFileRequests.delete(mediaId));

  pendingFileRequests.set(mediaId, request);
  return request;
}

/** Seeds the persistent cache from a newly selected local image, avoiding a download after upload. */
export async function cacheMediaFileFromUri(mediaId: string, sourceUri: string): Promise<void> {
  if (Platform.OS === 'web' || !sourceUri.startsWith('file:')) return;
  try {
    ensureMediaDirectory();
    const destination = mediaFile(mediaId);
    await new File(sourceUri).copy(destination, { overwrite: true });
    memoryFileCache.set(mediaId, destination.uri);
    await AsyncStorage.setItem(fileStorageKey(mediaId), destination.uri);
  } catch {
    // The subsequent display path will download the confirmed OCI object instead.
  }
}

export async function invalidateCachedMedia(mediaId: string): Promise<void> {
  memoryCache.delete(mediaId);
  pendingRequests.delete(mediaId);
  memoryFileCache.delete(mediaId);
  pendingFileRequests.delete(mediaId);
  try {
    const persistedFile = await AsyncStorage.getItem(fileStorageKey(mediaId));
    const file = persistedFile ? new File(persistedFile) : mediaFile(mediaId);
    if (file.exists) file.delete();
    await Promise.all([
      AsyncStorage.removeItem(storageKey(mediaId)),
      AsyncStorage.removeItem(fileStorageKey(mediaId)),
    ]);
  } catch {
    // The server-side deletion has already succeeded; local cleanup is best effort.
  }
}


/** Removes all protected images and signed URL metadata when the local session ends. */
export async function clearMediaCache(): Promise<void> {
  memoryCache.clear();
  pendingRequests.clear();
  memoryFileCache.clear();
  pendingFileRequests.clear();
  try {
    if (Platform.OS !== 'web' && mediaDirectory().exists) mediaDirectory().delete();
    const keys = await AsyncStorage.getAllKeys();
    const mediaKeys = keys.filter((key) => key.startsWith(SIGNED_URL_CACHE_PREFIX) || key.startsWith(FILE_CACHE_PREFIX));
    if (mediaKeys.length) await AsyncStorage.multiRemove(mediaKeys);
  } catch {
    // Logout must still complete even if best-effort cache cleanup fails.
  }
}
