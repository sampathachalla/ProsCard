import { ApiError, apiRequest, NETWORK_ERROR_STATUS } from '@/services/api/client';
import { API_BASE_URL } from '@/services/api/config';
import type {
  ConfirmedMedia,
  LogoPalette,
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

const logoPaletteCache = new Map<string, LogoPalette>();

export function getCachedLogoPalette(key: string): LogoPalette | undefined {
  return logoPaletteCache.get(key);
}

export function cacheLogoPalette(key: string, palette: LogoPalette): void {
  logoPaletteCache.set(key, palette);
}

export async function extractLogoPalette(input: { mediaId?: string; imageUrl?: string }): Promise<LogoPalette> {
  const cacheKey = input.mediaId || input.imageUrl;
  if (cacheKey) {
    const cached = logoPaletteCache.get(cacheKey);
    if (cached) return cached;
  }

  if (input.imageUrl && input.imageUrl.startsWith('proscard-logo:')) {
    const slug = input.imageUrl.replace('proscard-logo:', '').toLowerCase();
    const isMindpros = slug === 'mindpros' || slug.includes('mindpros');
    const dominant = isMindpros ? '#00bffe' : '#2563eb';
    const secondary = isMindpros ? '#0072bc' : '#1d4ed8';
    const accent = isMindpros ? '#00e0fd' : '#38bdf8';
    const hasDarkElements = isMindpros;
    const palette: LogoPalette = {
      dominant,
      secondary,
      accent,
      hasDarkElements,
      hasLightElements: true,
      suggestedGradient: [secondary, dominant],
      suggestedSurface: hasDarkElements ? '#ffffff' : '#0f172a',
      logoBackground: hasDarkElements ? '#ffffff' : '#0f172a',
      isDarkRecommended: !hasDarkElements,
      tagThemes: {
        Business: {
          id: 'custom-business',
          name: 'Brand Business',
          tag: 'Business',
          gradient: [secondary, dominant],
          surfaceColor: hasDarkElements ? '#ffffff' : '#0f172a',
          backgroundColor: hasDarkElements ? '#f1f5f9' : '#020617',
          textColor: hasDarkElements ? '#0f172a' : '#f8fafc',
          mutedTextColor: hasDarkElements ? '#475569' : '#94a3b8',
          accentColor: dominant,
          fontStyle: 'modern',
          paletteTier: 3,
          paletteColors: [secondary, hasDarkElements ? '#ffffff' : '#0f172a', dominant],
          customThemeName: 'Brand Business',
        },
        Personal: {
          id: 'custom-personal',
          name: 'Brand Personal',
          tag: 'Personal',
          gradient: [isMindpros ? '#38bdf8' : '#60a5fa', secondary],
          surfaceColor: hasDarkElements ? '#fffaf5' : '#111827',
          backgroundColor: hasDarkElements ? '#fefce8' : '#0a0a0a',
          textColor: hasDarkElements ? '#1c1917' : '#f5f5f4',
          mutedTextColor: hasDarkElements ? '#78716c' : '#a8a29e',
          accentColor: secondary,
          fontStyle: 'rounded',
          paletteTier: 3,
          paletteColors: [dominant, hasDarkElements ? '#fffaf5' : '#111827', secondary],
          customThemeName: 'Brand Personal',
        },
        Networking: {
          id: 'custom-networking',
          name: 'Brand Networking',
          tag: 'Networking',
          gradient: ['#030712', dominant],
          surfaceColor: hasDarkElements ? '#ffffff' : '#0f172a',
          backgroundColor: hasDarkElements ? '#f0f9ff' : '#020617',
          textColor: hasDarkElements ? '#0f172a' : '#f8fafc',
          mutedTextColor: hasDarkElements ? '#334155' : '#cbd5e1',
          accentColor: accent,
          fontStyle: 'modern',
          paletteTier: 3,
          paletteColors: ['#030712', hasDarkElements ? '#ffffff' : '#0f172a', accent],
          customThemeName: 'Brand Networking',
        },
        Portfolio: {
          id: 'custom-portfolio',
          name: 'Brand Portfolio',
          tag: 'Portfolio',
          gradient: ['#1e293b', dominant],
          surfaceColor: hasDarkElements ? '#fafafa' : '#18181b',
          backgroundColor: hasDarkElements ? '#f8fafc' : '#09090b',
          textColor: hasDarkElements ? '#18181b' : '#fafafa',
          mutedTextColor: hasDarkElements ? '#52525b' : '#a1a1aa',
          accentColor: dominant,
          fontStyle: 'classic',
          paletteTier: 3,
          paletteColors: ['#1e293b', hasDarkElements ? '#fafafa' : '#18181b', dominant],
          customThemeName: 'Brand Portfolio',
        },
      },
      paletteSource: 'deterministic',
    };
    if (cacheKey) logoPaletteCache.set(cacheKey, palette);
    return palette;
  }

  const result = await apiRequest<LogoPalette>('/media/extract-palette', { method: 'POST', body: input });
  if (cacheKey && result) {
    logoPaletteCache.set(cacheKey, result);
  }
  return result;
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
