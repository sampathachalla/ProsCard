import type { ImagePickerAsset } from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import type { MediaKind, MediaScope } from '@/services/api/types';
import {
  cacheMediaFileFromUri,
  confirmMedia,
  requestMediaUpload,
  uploadToObjectStorage,
} from './mediaService';
import { invalidateCachedMedia } from './mediaCache';

const pendingAssets = new Map<string, ImagePickerAsset>();
const localPattern = /^(file:|content:|ph:\/\/|assets-library:|data:|blob:)/i;
const MAX_MEDIA_EDGE: Record<Exclude<MediaKind, 'contactCard'>, number> = {
  profilePhoto: 512,
  coverPhoto: 1600,
  companyLogo: 800,
};

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

async function optimizeProfileMedia(uri: string, kind: MediaKind, asset?: ImagePickerAsset) {
  if (kind === 'contactCard' || !asset?.width || !asset.height) {
    return { uri, contentType: asset?.mimeType, fileName: asset?.fileName };
  }
  const maxEdge = MAX_MEDIA_EDGE[kind];
  const longest = Math.max(asset.width, asset.height);
  if (longest <= maxEdge && asset.mimeType !== 'image/heic' && asset.mimeType !== 'image/heif') {
    return { uri, contentType: asset.mimeType, fileName: asset.fileName };
  }
  const context = ImageManipulator.manipulate(uri);
  context.resize(asset.width >= asset.height ? { width: maxEdge } : { height: maxEdge });
  const image = await context.renderAsync();
  const preserveTransparency = kind === 'companyLogo' && asset.mimeType === 'image/png';
  const format = preserveTransparency ? SaveFormat.PNG : SaveFormat.JPEG;
  const saved = await image.saveAsync({ format, compress: preserveTransparency ? 1 : 0.84 });
  const extension = preserveTransparency ? 'png' : 'jpg';
  return {
    uri: saved.uri,
    contentType: preserveTransparency ? 'image/png' : 'image/jpeg',
    fileName: `${kind}-${Date.now()}.${extension}`,
  };
}

export async function commitPendingMedia(
  uri: string,
  kind: MediaKind,
  scope: MediaScope = 'profile',
  cardId?: string,
): Promise<string> {
  if (!isPendingMediaUrl(uri)) return uri;
  const asset = pendingAssets.get(uri);
  const optimized = await optimizeProfileMedia(uri, kind, asset);
  const source = await fetch(optimized.uri);
  const blob = await source.blob();
  const contentType = optimized.contentType || blob.type || 'image/jpeg';
  const fileName = optimized.fileName || `upload-${Date.now()}.${contentType.split('/')[1] || 'jpg'}`;
  const ticket = await requestMediaUpload({
    kind, scope, cardId, fileName, contentType, sizeBytes: blob.size,
  });
  await uploadToObjectStorage(ticket, blob);
  const confirmed = await confirmMedia(ticket.mediaId);
  await cacheMediaFileFromUri(ticket.mediaId, optimized.uri);
  if (confirmed.replacedMediaId) await invalidateCachedMedia(confirmed.replacedMediaId);
  pendingAssets.delete(uri);
  return confirmed.contentUrl;
}
