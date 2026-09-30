// components/scannerComponents/types/scanner.types.ts
export type ScannedCard = {
  data: string;
  scannedAt: number;
};

/** How a business-card photo was obtained. */
export type CardCaptureSource = 'scanner' | 'camera' | 'library';

/** A business-card photo on the device, not yet uploaded. */
export type CapturedCard = {
  uri: string;
  source: CardCaptureSource;
  /** true when the native scanner found the card edges and cropped the image. */
  edgeDetected: boolean;
  mimeType?: string;
  fileName?: string;
};

/** A captured card after it has been cropped by the card reader. */
export type ProcessedCard = CapturedCard & {
  /** The full photo, kept so the user can undo the automatic crop. */
  originalUri?: string;
  autoCropped?: boolean;
};

/** Card position as fractions (0–1) of the image. */
export type CardBounds = { x: number; y: number; width: number; height: number };

export type CardContactFields = {
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  notes: string;
};

/** Response of POST /scanner/read. */
export type CardReading = {
  isBusinessCard: boolean;
  cardBounds: CardBounds | null;
  rotation: 0 | 90 | 180 | 270;
  contact: CardContactFields;
};
