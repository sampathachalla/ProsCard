// components/scannerComponents/Services/cardReaderService.ts
import { ImageManipulator, SaveFormat, type ImageRef } from 'expo-image-manipulator';
import { apiRequest } from '@/services/api/client';
import type { CapturedCard, CardBounds, CardReading, ProcessedCard } from '../types/scanner.types';

/** Longest edge kept for the stored card photo. */
const WORKING_MAX_EDGE = 2000;
/** Longest edge sent to the card reader; enough for small print, small enough to upload quickly. */
const READER_MAX_EDGE = 1280;
/** Extra margin around the detected card so the crop never clips its edges. */
const CROP_PADDING = 0.02;

function resizeFor(image: { width: number; height: number }, maxEdge: number) {
  if (Math.max(image.width, image.height) <= maxEdge) return null;
  return image.width >= image.height ? { width: maxEdge } : { height: maxEdge };
}

async function render(source: string | ImageRef, apply?: (context: ReturnType<typeof ImageManipulator.manipulate>) => void) {
  const context = ImageManipulator.manipulate(source);
  apply?.(context);
  return context.renderAsync();
}

/**
 * Decodes the photo once with its camera orientation applied, so the reader's coordinates
 * and the later crop refer to the same pixels.
 */
async function loadWorkingImage(uri: string): Promise<ImageRef> {
  const original = await render(uri);
  const size = resizeFor(original, WORKING_MAX_EDGE);
  return size ? render(original, (context) => context.resize(size)) : original;
}

async function requestReading(image: ImageRef): Promise<CardReading> {
  const size = resizeFor(image, READER_MAX_EDGE);
  const small = size ? await render(image, (context) => context.resize(size)) : image;
  const { base64 } = await small.saveAsync({ format: SaveFormat.JPEG, compress: 0.7, base64: true });
  if (!base64) throw new Error('Could not prepare the photo.');
  return apiRequest<CardReading>('/scanner/read', { method: 'POST', body: { image: base64, mimeType: 'image/jpeg' } });
}

async function cropToCard(image: ImageRef, bounds: CardBounds, rotation: CardReading['rotation']): Promise<string> {
  const left = Math.max(0, bounds.x - CROP_PADDING);
  const top = Math.max(0, bounds.y - CROP_PADDING);
  const right = Math.min(1, bounds.x + bounds.width + CROP_PADDING);
  const bottom = Math.min(1, bounds.y + bounds.height + CROP_PADDING);
  const cropped = await render(image, (context) => {
    context.crop({
      originX: Math.round(left * image.width),
      originY: Math.round(top * image.height),
      width: Math.round((right - left) * image.width),
      height: Math.round((bottom - top) * image.height),
    });
    // Sideways guesses are unreliable, so only upside-down photos are turned automatically.
    if (rotation === 180) context.rotate(180);
  });
  return (await cropped.saveAsync({ format: SaveFormat.JPEG, compress: 0.9 })).uri;
}

/**
 * Reads the contact details on a card photo and, unless the native scanner already cropped it,
 * crops the photo to the card.
 */
export async function readCardPhoto(card: CapturedCard): Promise<{ card: ProcessedCard; reading: CardReading }> {
  const image = await loadWorkingImage(card.uri);
  const reading = await requestReading(image);
  if (card.edgeDetected || !reading.isBusinessCard || !reading.cardBounds) return { card, reading };
  const uri = await cropToCard(image, reading.cardBounds, reading.rotation);
  return {
    card: { ...card, uri, originalUri: card.uri, autoCropped: true, mimeType: 'image/jpeg', fileName: undefined },
    reading,
  };
}

/** Turns the card photo 90° clockwise, for sideways photos. */
export async function rotateCardPhoto(uri: string): Promise<string> {
  const rotated = await render(uri, (context) => context.rotate(90));
  return (await rotated.saveAsync({ format: SaveFormat.JPEG, compress: 0.9 })).uri;
}
