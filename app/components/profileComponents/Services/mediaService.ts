import { apiRequest } from '@/services/api/client';
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

export async function requestMediaUpload(input: MediaUploadRequest): Promise<MediaUploadTicket> {
  return apiRequest('/media/upload-url', { method: 'POST', body: input });
}

export async function uploadToObjectStorage(
  ticket: MediaUploadTicket,
  body: Blob | ArrayBuffer,
): Promise<void> {
  const response = await fetch(ticket.url, {
    method: ticket.method,
    headers: ticket.headers,
    body,
  });
  if (!response.ok) throw new Error(`Object upload failed (${response.status}).`);
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
    const result = await apiRequest<{ url: string }>(`/media/${encodeURIComponent(mediaId)}/download-url`);
    return result.url;
  });
}

export function resolveProtectedMediaUrl(contentUrl: string): string {
  if (!contentUrl || /^(https?:|file:|content:|ph:\/\/|assets-library:|data:|blob:)/i.test(contentUrl)) return contentUrl;
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

export { cacheMediaFileFromUri };

export async function retryMediaCleanup(): Promise<{ examined: number; cleaned: number; failed: number }> {
  return apiRequest('/media/cleanup/retry', { method: 'POST' });
}
