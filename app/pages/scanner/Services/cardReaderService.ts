// pages/scanner/Services/cardReaderService.ts
import { ImageManipulator, SaveFormat, type ImageRef } from 'expo-image-manipulator';
import { Platform } from 'react-native';
import { detectCardAsync } from '@/modules/card-rectangle-detector';
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

async function requestReading(uri: string, size: Size) {
  const resize = resizeFor(size, READER_MAX_EDGE);
  const small = await render(uri, (context) => {
    if (resize) context.resize(resize);
  });
  const { base64, uri: readerUri } = await small.saveAsync({ format: SaveFormat.JPEG, compress: 0.7, base64: true });
  if (!base64) throw new Error('Could not prepare the photo.');
  // Uploading the photo and reading it with the model can take longer than an ordinary request.
  const reading = await apiRequest<CardReading>('/scanner/read', { method: 'POST', body: { image: base64, mimeType: 'image/jpeg' }, timeoutMs: 90_000 });
  return { reading, readerUri, readerSize: { width: small.width, height: small.height } };
}

async function cropToCard(
  uri: string,
  size: Size,
  bounds: CardBounds,
  rotation: CardReading['rotation'],
  padX = CROP_PADDING,
  padY = CROP_PADDING,
): Promise<string> {
  const left = Math.floor(Math.max(0, bounds.x - padX) * size.width);
  const top = Math.floor(Math.max(0, bounds.y - padY) * size.height);
  const right = Math.ceil(Math.min(1, bounds.x + bounds.width + padX) * size.width);
  const bottom = Math.ceil(Math.min(1, bounds.y + bounds.height + padY) * size.height);
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

/** Finds and straightens the card using the device's native detector. */
async function straightenOnDevice(card: CapturedCard): Promise<ProcessedCard | null> {
  try {
    const detected = await detectCardAsync(card.uri, { quality: STORED_QUALITY });
    if (!detected) return null;
    return { ...card, uri: detected.uri, edgeDetected: true, originalUri: card.uri, autoCropped: true, mimeType: 'image/jpeg', fileName: undefined };
  } catch {
    // Fall back to the reader's crop rather than failing the scan.
    return null;
  }
}

export async function prepareCardPhoto(captured: ProcessedCard): Promise<ProcessedCard> {
  if (captured.edgeDetected || captured.autoCropped) return captured;
  return (await straightenOnDevice(captured)) ?? captured;
}

/** Reads the card and uses the reader's bounds to guide a fallback crop. */
export async function readCardPhoto(card: ProcessedCard): Promise<{ card: ProcessedCard; reading: CardReading }> {
  const size = await orientedSize(card.uri);
  const { reading, readerUri, readerSize } = await requestReading(card.uri, size);
  if (card.edgeDetected || card.autoCropped || !reading.isBusinessCard || !reading.cardBounds) return { card, reading };

  if (Platform.OS === 'android') {
    // The reader's box can be offset. Search a wider area of the exact JPEG it saw and let
    // OpenCV find all four physical corners before showing a crop in Review Contact.
    const bounds = reading.cardBounds;
    const searchUri = await cropToCard(readerUri, readerSize, bounds, 0, bounds.width / 2, bounds.height / 2);
    const detected = await straightenOnDevice({ ...card, uri: searchUri });
    return { card: detected ? { ...detected, originalUri: card.uri } : card, reading };
  }

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
