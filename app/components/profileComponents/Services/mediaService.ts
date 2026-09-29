import { apiRequest } from '@/services/api/client';
import { API_BASE_URL } from '@/services/api/config';
import type {
  ConfirmedMedia,
  MediaUploadRequest,
  MediaUploadTicket,
} from '@/services/api/types';

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
}

export async function getMediaDownloadUrl(mediaId: string): Promise<string> {
  const result = await apiRequest<{ url: string }>(`/media/${encodeURIComponent(mediaId)}/download-url`);
  return result.url;
}

export function resolveProtectedMediaUrl(contentUrl: string): string {
  if (!contentUrl || /^https?:\/\//i.test(contentUrl)) return contentUrl;
  return `${API_BASE_URL}${contentUrl.startsWith('/') ? '' : '/'}${contentUrl}`;
}

export async function getDisplayMediaUrl(storedUrl: string): Promise<string> {
  const match = storedUrl.match(/\/api\/v1\/media\/([^/]+)\/content$/);
  return match ? getMediaDownloadUrl(match[1]) : resolveProtectedMediaUrl(storedUrl);
}

export async function retryMediaCleanup(): Promise<{ examined: number; cleaned: number; failed: number }> {
  return apiRequest('/media/cleanup/retry', { method: 'POST' });
}
