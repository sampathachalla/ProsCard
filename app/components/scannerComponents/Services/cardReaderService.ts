// components/scannerComponents/Services/cardReaderService.ts
import { ImageManipulator, SaveFormat, type ImageRef } from 'expo-image-manipulator';
import { apiRequest } from '@/services/api/client';
import type { CapturedCard, CardBounds, CardReading, ProcessedCard } from '../types/scanner.types';

/** Longest edge kept for the stored card photo. */
const WORKING_MAX_EDGE = 1600;
/** Longest edge sent to the card reader; enough for small print, small enough to upload quickly. */
const READER_MAX_EDGE = 1280;
/** JPEG quality for stored card photos: sharp for reading, small enough to upload quickly on mobile. */
const STORED_QUALITY = 0.8;
/** Extra margin around the detected card so the crop never clips its edges. */
const CROP_PADDING = 0.02;

type Size = { width: number; height: number };

function resizeFor(image: Size, maxEdge: number) {
  if (Math.max(image.width, image.height) <= maxEdge) return null;
  return image.width >= image.height ? { width: maxEdge } : { height: maxEdge };
}

/**
 * Every pass starts from the photo file, never from an already rendered image: on iOS a resized image
 * can come back in extended (16-bit) colour, and starting a new pass from it fails in the manipulator's
 * orientation step ("Calling the 'renderAsync' function has failed"). Resizing is always the last step.
 */
async function render(uri: string, apply?: (context: ReturnType<typeof ImageManipulator.manipulate>) => void): Promise<ImageRef> {
  const context = ImageManipulator.manipulate(uri);
  apply?.(context);
  return context.renderAsync();
}

/** Pixel size of the photo with its camera orientation applied, the space the reader's coordinates use. */
async function orientedSize(uri: string): Promise<Size> {
  const image = await render(uri);
  return { width: image.width, height: image.height };
}

async function requestReading(uri: string, size: Size): Promise<CardReading> {
  const resize = resizeFor(size, READER_MAX_EDGE);
  const small = await render(uri, (context) => {
    if (resize) context.resize(resize);
  });
  const { base64 } = await small.saveAsync({ format: SaveFormat.JPEG, compress: 0.7, base64: true });
  if (!base64) throw new Error('Could not prepare the photo.');
  return apiRequest<CardReading>('/scanner/read', { method: 'POST', body: { image: base64, mimeType: 'image/jpeg' } });
}

async function cropToCard(uri: string, size: Size, bounds: CardBounds, rotation: CardReading['rotation']): Promise<string> {
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
    // Sideways guesses are unreliable, so only upside-down photos are turned automatically.
    if (rotation === 180) context.rotate(180);
    if (resize) context.resize(resize);
  });
  return (await cropped.saveAsync({ format: SaveFormat.JPEG, compress: STORED_QUALITY })).uri;
}

/**
 * Reads the contact details on a card photo and, unless the native scanner already cropped it,
 * crops the photo to the card.
 */
export async function readCardPhoto(card: CapturedCard): Promise<{ card: ProcessedCard; reading: CardReading }> {
  const size = await orientedSize(card.uri);
  const reading = await requestReading(card.uri, size);
  if (card.edgeDetected || !reading.isBusinessCard || !reading.cardBounds) return { card, reading };
  const uri = await cropToCard(card.uri, size, reading.cardBounds, reading.rotation);
  return {
    card: { ...card, uri, originalUri: card.uri, autoCropped: true, mimeType: 'image/jpeg', fileName: undefined },
    reading,
  };
}

/**
 * Shrinks a card photo to the stored size before upload. Camera-sized photos (native scanner output,
 * photos that were never cropped) are often several MB; ones already at the stored size are sent as is.
 */
export async function prepareCardPhotoForUpload<T extends { uri: string; mimeType?: string; fileName?: string }>(photo: T): Promise<T> {
  try {
    const size = await orientedSize(photo.uri);
    const resize = resizeFor(size, WORKING_MAX_EDGE);
    if (!resize) return photo;
    const small = await render(photo.uri, (context) => context.resize(resize));
    const { uri } = await small.saveAsync({ format: SaveFormat.JPEG, compress: STORED_QUALITY });
    return { ...photo, uri, mimeType: 'image/jpeg', fileName: undefined };
  } catch {
    // Unreadable by the manipulator (unusual format): upload the original rather than failing.
    return photo;
  }
}

/** Turns the card photo 90° clockwise, for sideways photos. */
export async function rotateCardPhoto(uri: string): Promise<string> {
  const rotated = await render(uri, (context) => context.rotate(90));
  return (await rotated.saveAsync({ format: SaveFormat.JPEG, compress: STORED_QUALITY })).uri;
}
