import { requireOptionalNativeModule } from 'expo';

/** A point as fractions (0–1) of the photo, origin at the top left. */
export type NormalizedPoint = { x: number; y: number };

export type CardCorners = {
  topLeft: NormalizedPoint;
  topRight: NormalizedPoint;
  bottomRight: NormalizedPoint;
  bottomLeft: NormalizedPoint;
};

export type DetectedCard = {
  /** file:// URI of the straightened card image (JPEG). */
  uri: string;
  width: number;
  height: number;
  edgeDetected: true;
  /** Where the card's corners were found in the original photo. */
  corners: CardCorners;
};

export type DetectCardOptions = {
  /** Vision confidence (0–1) below which a rectangle is ignored. Defaults to 0.8. */
  minimumConfidence?: number;
  /** Smallest card accepted, as a fraction of the photo's shorter side. Defaults to 0.2. */
  minimumSize?: number;
  /** JPEG quality (0–1) of the straightened card. Defaults to 0.9. */
  quality?: number;
};

type CardRectangleDetectorModule = {
  detectCardAsync(uri: string, options: DetectCardOptions): Promise<DetectedCard | null>;
};

// Native iOS only: missing in Expo Go, on Android and on web.
const nativeModule = requireOptionalNativeModule<CardRectangleDetectorModule>('CardRectangleDetector');

export function isCardRectangleDetectorAvailable(): boolean {
  return nativeModule != null;
}

/**
 * Finds a business card in a photo with Apple Vision (VNDetectRectanglesRequest) and returns it
 * perspective-corrected. Resolves to null when no card-shaped rectangle is found or the module is missing.
 */
export async function detectCardAsync(uri: string, options: DetectCardOptions = {}): Promise<DetectedCard | null> {
  if (!nativeModule) return null;
  return nativeModule.detectCardAsync(uri, options);
}
