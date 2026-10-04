import { forwardRef, type ComponentType, type Ref } from 'react';
import type { NativeSyntheticEvent, ViewProps } from 'react-native';
import { requireNativeView } from 'expo';
import type { CardCorners } from './CardRectangleDetector';

/** none: no card in view · detected: card outlined · steady: card held still, good moment to capture. */
export type CardScanState = 'none' | 'detected' | 'steady';

export type CardScannerCapture = {
  /** file:// URI of the JPEG: the straightened card, or the full photo when no card was found. */
  uri: string;
  width: number;
  height: number;
  /** true when a card was found and the photo was cropped and straightened to it. */
  edgeDetected: boolean;
  corners?: CardCorners;
};

export type CardScannerViewProps = ViewProps & {
  /** Runs the camera; set false to pause it (defaults to true). */
  active?: boolean;
  /** Also read QR codes from the camera frames. */
  barcodeScanningEnabled?: boolean;
  onCardStateChange?: (event: NativeSyntheticEvent<{ state: CardScanState }>) => void;
  onBarcodeScanned?: (event: NativeSyntheticEvent<{ data: string }>) => void;
  onCameraError?: (event: NativeSyntheticEvent<{ message: string }>) => void;
};

/** Methods on the native view, reached through a ref. */
export type CardScannerViewRef = {
  captureAsync(): Promise<CardScannerCapture>;
};

type NativeProps = CardScannerViewProps & { ref?: Ref<CardScannerViewRef> };
let NativeCardScannerView: ComponentType<NativeProps> | undefined;

// Looked up on first render, not on import, so screens can import this in Expo Go where the view is missing.
function nativeView() {
  NativeCardScannerView ??= requireNativeView<NativeProps>('CardRectangleDetector');
  return NativeCardScannerView;
}

/**
 * Live camera that outlines a business card as Apple Vision (VNDetectRectanglesRequest) finds it.
 * iOS development builds only; check isCardRectangleDetectorAvailable() before rendering it.
 */
export const CardScannerView = forwardRef<CardScannerViewRef, CardScannerViewProps>(function CardScannerView(props, ref) {
  const NativeView = nativeView();
  return <NativeView {...props} ref={ref} />;
});
