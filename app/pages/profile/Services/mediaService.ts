import { ApiError, apiRequest, NETWORK_ERROR_STATUS } from '@/services/api/client';
import { API_BASE_URL } from '@/services/api/config';
import type {
  ConfirmedMedia,
  MediaUploadRequest,
  MediaUploadTicket,
} from '@/services/api/types';
import {
  cacheMediaFileFromUri,
  getCachedMediaFileUrl,
  getCachedMediaDownloadUrl,
  invalidateCachedMedia,
  mediaImageCacheKey,
  peekCachedMediaFileUrl,
  peekCachedMediaDownloadUrl,
} from './mediaCache';

const PROTECTED_MEDIA_PATTERN = /\/api\/v1\/media\/([^/]+)\/content$/;
const OBJECT_UPLOAD_TIMEOUT_MS = 45_000;

export async function requestMediaUpload(input: MediaUploadRequest): Promise<MediaUploadTicket> {
  return apiRequest('/media/upload-url', { method: 'POST', body: input });
}

/** Reads a local or remote URI as bytes without Response.blob() (avoids RN Blob / expo-blob warning). */
export async function readUriAsArrayBuffer(uri: string): Promise<ArrayBuffer> {
  const response = await fetch(uri);
  return response.arrayBuffer();
}

export async function uploadToObjectStorage(
  ticket: MediaUploadTicket,
  body: ArrayBuffer,
): Promise<void> {
  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, OBJECT_UPLOAD_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(ticket.url, {
      method: ticket.method,
      headers: ticket.headers,
      body,
      signal: controller.signal,
    });
  } catch (error) {
    throw new ApiError(
      timedOut
        ? 'The image upload took too long. Check your connection and try again.'
        : 'The image upload was interrupted. Check your internet connection and try again.',
      NETWORK_ERROR_STATUS,
      error,
    );
  } finally {
    clearTimeout(timeout);
  }
  if (!response.ok) {
    throw new ApiError(
      response.status >= 500
        ? 'The image service is temporarily unavailable. Please try again.'
        : 'The image could not be uploaded. Please select it again and retry.',
      response.status,
      null,
    );
  }
}

export async function confirmMedia(mediaId: string): Promise<ConfirmedMedia> {
  return apiRequest(`/media/${encodeURIComponent(mediaId)}/confirm`, { method: 'POST' });
}

export async function deleteMedia(mediaId: string): Promise<void> {
  await apiRequest(`/media/${encodeURIComponent(mediaId)}`, { method: 'DELETE' });
  await invalidateCachedMedia(mediaId);
}

export async function getMediaDownloadUrl(mediaId: string): Promise<string> {
  return getCachedMediaDownloadUrl(mediaId, async () => {
    return apiRequest<{ url: string; expiresAt?: string }>(
      `/media/${encodeURIComponent(mediaId)}/download-url`,
    );
  });
}

export function resolveProtectedMediaUrl(contentUrl: string): string {
  if (!contentUrl) return contentUrl;
  if (/^https?:\/\/cdn\.brandfetch\.io\//i.test(contentUrl)) {
    try {
      const url = new URL(contentUrl);
      const brandId = url.pathname.split('/').filter(Boolean)[0];
      if (brandId) {
        // Keep this extensionless: Brandfetch's `symbol.webp` variant can be a
        // fully transparent image even when the extensionless symbol exists.
        url.pathname = `/${brandId}/w/256/h/256/theme/dark/symbol`;
        return url.toString();
      }
    } catch {
      return contentUrl;
    }
  }
  if (/^(https?:|file:|content:|ph:\/\/|assets-library:|data:|blob:)/i.test(contentUrl)) return contentUrl;
  return `${API_BASE_URL}${contentUrl.startsWith('/') ? '' : '/'}${contentUrl}`;
}

export async function getDisplayMediaUrl(storedUrl: string): Promise<string> {
  const match = storedUrl.match(PROTECTED_MEDIA_PATTERN);
  return match
    ? getCachedMediaFileUrl(match[1], () => getMediaDownloadUrl(match[1]))
    : resolveProtectedMediaUrl(storedUrl);
}

export function getImmediateDisplayMediaUrl(storedUrl: string): string {
  const match = storedUrl.match(PROTECTED_MEDIA_PATTERN);
  return match
    ? (peekCachedMediaFileUrl(match[1]) ?? peekCachedMediaDownloadUrl(match[1]) ?? '')
    : resolveProtectedMediaUrl(storedUrl);
}

export function getMediaImageCacheKey(storedUrl: string): string | undefined {
  const match = storedUrl.match(PROTECTED_MEDIA_PATTERN);
  return match ? mediaImageCacheKey(match[1]) : undefined;
}

/** Warms protected media in the background as soon as profile/card data arrives. */
export function prefetchMedia(storedUrls: (string | undefined)[]): void {
  const unique = [...new Set(storedUrls.filter((url): url is string => Boolean(url)))];
  unique.forEach((url) => { void getDisplayMediaUrl(url).catch(() => {}); });
}

/** Resolves protected media to stable display URLs so a screen can wait before revealing content. */
export async function resolveDisplayMediaUrls(storedUrls: (string | undefined)[]): Promise<string[]> {
  const unique = [...new Set(storedUrls.filter((url): url is string => Boolean(url)))];
  const resolved = await Promise.all(
    unique.map((url) => getDisplayMediaUrl(url).catch(() => '')),
  );
  return resolved.filter(Boolean);
}

export { cacheMediaFileFromUri };

export async function retryMediaCleanup(): Promise<{ examined: number; cleaned: number; failed: number }> {
  return apiRequest('/media/cleanup/retry', { method: 'POST' });
}
