import type { ImagePickerAsset } from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { ApiError, NETWORK_ERROR_STATUS } from '@/services/api/client';
import type { MediaKind, MediaScope } from '@/services/api/types';
import {
  cacheMediaFileFromUri,
  confirmMedia,
  readUriAsArrayBuffer,
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

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export function registerPendingMedia(asset: ImagePickerAsset): void {
  pendingAssets.set(asset.uri, asset);
}

export function clearPendingMedia(uri: string): void {
  pendingAssets.delete(uri);
}

export function isPendingMediaUrl(value: string): boolean {
  return localPattern.test(value);
}

function isHeicLike(mimeType?: string | null): boolean {
  const normalized = (mimeType ?? '').toLowerCase().split(';', 1)[0]!.trim();
  return normalized === 'image/heic' || normalized === 'image/heif';
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
    return {
      uri,
      contentType: asset?.mimeType || 'image/jpeg',
      fileName: asset?.fileName,
    };
  }
  const maxEdge = MAX_MEDIA_EDGE[kind];
  const longest = Math.max(asset.width, asset.height);
  if (longest <= maxEdge && !isHeicLike(asset.mimeType)) {
    return {
      uri,
      contentType: asset.mimeType || 'image/jpeg',
      fileName: asset.fileName,
    };
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
  let bytes: ArrayBuffer;
  try {
    bytes = await readUriAsArrayBuffer(optimized.uri);
  } catch (error) {
    throw new ApiError(
      'VC Pros couldn’t read the selected image. Select it again and retry.',
      NETWORK_ERROR_STATUS,
      error,
    );
  }
  const knownSize =
    bytes.byteLength > 0
      ? bytes.byteLength
      : typeof asset?.fileSize === 'number' && asset.fileSize > 0
        ? asset.fileSize
        : undefined;
  if (knownSize != null && knownSize > MAX_UPLOAD_BYTES) {
    pendingAssets.delete(uri);
    throw new ApiError(
      'That image is too large. Choose a photo under 20 MB.',
      422,
      null,
    );
  }
  if (!knownSize) {
    pendingAssets.delete(uri);
    throw new ApiError(
      'The selected image could not be read. Choose a different photo and try again.',
      422,
      null,
    );
  }
  const rawType = (optimized.contentType || 'image/jpeg').toLowerCase().split(';', 1)[0]!.trim();
  const contentType = rawType.startsWith('image/') ? rawType : 'image/jpeg';
  const fileName = optimized.fileName || `upload-${Date.now()}.${contentType.split('/')[1] || 'jpg'}`;
  try {
    const ticket = await requestMediaUpload({
      kind,
      scope,
      cardId,
      fileName,
      contentType,
      sizeBytes: knownSize,
    });
    await uploadToObjectStorage(ticket, bytes);
    const confirmed = await confirmMedia(ticket.mediaId);
    await cacheMediaFileFromUri(ticket.mediaId, optimized.uri);
    if (confirmed.replacedMediaId) await invalidateCachedMedia(confirmed.replacedMediaId);
    pendingAssets.delete(uri);
    return confirmed.contentUrl;
  } catch (error) {
    pendingAssets.delete(uri);
    throw error;
  }
}
