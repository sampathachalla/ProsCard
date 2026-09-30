import type { ImagePickerAsset } from 'expo-image-picker';
import type { MediaKind, MediaScope } from '@/services/api/types';
import { confirmMedia, requestMediaUpload, uploadToObjectStorage } from './mediaService';

const pendingAssets = new Map<string, ImagePickerAsset>();
const localPattern = /^(file:|content:|ph:\/\/|assets-library:|data:|blob:)/i;

export function registerPendingMedia(asset: ImagePickerAsset): void {
  pendingAssets.set(asset.uri, asset);
}

export function isPendingMediaUrl(value: string): boolean {
  return localPattern.test(value);
}

export function mediaIdFromContentUrl(value: string): string | null {
  return value.match(/\/api\/v1\/media\/([^/]+)\/content$/)?.[1] ?? null;
}

/** A just-picked local image or an already uploaded backend image — not a user-typed URL. */
export function isMediaReference(value: string): boolean {
  return isPendingMediaUrl(value) || mediaIdFromContentUrl(value) !== null;
}

export async function commitPendingMedia(
  uri: string,
  kind: MediaKind,
  scope: MediaScope = 'profile',
  cardId?: string,
): Promise<string> {
  if (!isPendingMediaUrl(uri)) return uri;
  const asset = pendingAssets.get(uri);
  const source = await fetch(uri);
  const blob = await source.blob();
  const contentType = asset?.mimeType || blob.type || 'image/jpeg';
  const fileName = asset?.fileName || `upload-${Date.now()}.${contentType.split('/')[1] || 'jpg'}`;
  const ticket = await requestMediaUpload({
    kind, scope, cardId, fileName, contentType, sizeBytes: asset?.fileSize ?? blob.size,
  });
  await uploadToObjectStorage(ticket, blob);
  const confirmed = await confirmMedia(ticket.mediaId);
  pendingAssets.delete(uri);
  return confirmed.contentUrl;
}
