import { ImageManipulator, SaveFormat, type ImageRef } from 'expo-image-manipulator';
import { detectCardAsync } from '@/modules/card-rectangle-detector';
import { apiRequest } from '@/services/api/client';
import type { CapturedCard, CardBounds, ProcessedCard } from '../types/scanner.types';
import type { BadgeReading } from '../types/badge.types';

const WORKING_MAX_EDGE = 1600;
const READER_MAX_EDGE = 1280;
const STORED_QUALITY = 0.8;
const CROP_PADDING = 0.02;

type Size = { width: number; height: number };

function resizeFor(image: Size, maxEdge: number) {
  if (Math.max(image.width, image.height) <= maxEdge) return null;
  return image.width >= image.height ? { width: maxEdge } : { height: maxEdge };
}

async function render(uri: string, apply?: (context: ReturnType<typeof ImageManipulator.manipulate>) => void): Promise<ImageRef> {
  const context = ImageManipulator.manipulate(uri);
  apply?.(context);
  return context.renderAsync();
}

async function orientedSize(uri: string): Promise<Size> {
  const image = await render(uri);
  return { width: image.width, height: image.height };
}

async function requestBadgeReading(uri: string, size: Size): Promise<BadgeReading> {
  const resize = resizeFor(size, READER_MAX_EDGE);
  const small = await render(uri, (context) => {
    if (resize) context.resize(resize);
  });
  const { base64 } = await small.saveAsync({ format: SaveFormat.JPEG, compress: 0.7, base64: true });
  if (!base64) throw new Error('Could not prepare the photo.');
  return apiRequest<BadgeReading>('/scanner/read-badge', {
    method: 'POST',
    body: { image: base64, mimeType: 'image/jpeg' },
    timeoutMs: 90_000,
  });
}

async function cropToBadge(uri: string, size: Size, bounds: CardBounds, rotation: BadgeReading['rotation']): Promise<string> {
  const left = Math.floor(Math.max(0, bounds.x - CROP_PADDING) * size.width);
  const top = Math.floor(Math.max(0, bounds.y - CROP_PADDING) * size.height);
  const right = Math.ceil(Math.min(1, bounds.x + bounds.width + CROP_PADDING) * size.width);
  const bottom = Math.ceil(Math.min(1, bounds.y + bounds.height + CROP_PADDING) * size.height);
  const crop = {
    originX: left,
    originY: top,
    width: Math.min(size.width - left, right - left),
    height: Math.min(size.height - top, bottom - top),
  };
  const resize = resizeFor(crop, WORKING_MAX_EDGE);
  const cropped = await render(uri, (context) => {
    context.crop(crop);
    if (rotation === 180) context.rotate(180);
    if (resize) context.resize(resize);
  });
  return (await cropped.saveAsync({ format: SaveFormat.JPEG, compress: STORED_QUALITY })).uri;
}

async function straightenOnDevice(card: CapturedCard): Promise<ProcessedCard | null> {
  try {
    const detected = await detectCardAsync(card.uri, { quality: STORED_QUALITY });
    if (!detected) return null;
    return {
      ...card,
      uri: detected.uri,
      edgeDetected: true,
      originalUri: card.uri,
      autoCropped: true,
      mimeType: 'image/jpeg',
      fileName: undefined,
    };
  } catch {
    return null;
  }
}

/** Reads an event badge photo and crops it when possible. */
export async function readBadgePhoto(captured: CapturedCard): Promise<{ card: ProcessedCard; reading: BadgeReading }> {
  const card: ProcessedCard = (!captured.edgeDetected && (await straightenOnDevice(captured))) || captured;
  const size = await orientedSize(card.uri);
  const reading = await requestBadgeReading(card.uri, size);
  if (card.edgeDetected || !reading.isEventBadge || !reading.cardBounds) return { card, reading };
  const uri = await cropToBadge(card.uri, size, reading.cardBounds, reading.rotation);
  return {
    card: { ...card, uri, originalUri: card.uri, autoCropped: true, mimeType: 'image/jpeg', fileName: undefined },
    reading,
  };
}
