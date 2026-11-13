import { PixelRatio, Platform } from 'react-native';
import Constants from 'expo-constants';
import { File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import type { QrSvgRef } from './qrExportService';

export type PrepareWidgetResult = 'ready' | 'requires-native-build' | 'unsupported';

/** Largest size, in points, that any widget or Live Activity draws the QR at. */
const WIDGET_QR_MAX_POINTS = 148;

async function readCapturedQrPng(qrSvg: QrSvgRef | null): Promise<string | null> {
  const uri = await qrSvg?.capturePngUri?.();
  if (!uri) return null;
  try {
    const file = new File(uri);
    const base64 = await file.base64();
    return base64.trim() || null;
  } catch {
    return null;
  }
}

async function readQrPng(qrSvg: QrSvgRef | null): Promise<string | null> {
  await qrSvg?.whenLogoReady?.();

  if (qrSvg?.toDataURL) {
    const svgPng = await new Promise<string | null>((resolve) => {
      try {
        qrSvg.toDataURL?.((dataUrl) => {
          resolve(dataUrl.replace(/^data:image\/png;base64,/, '').trim() || null);
        });
      } catch {
        resolve(null);
      }
    });
    if (svgPng) return svgPng;
  }

  return readCapturedQrPng(qrSvg);
}

function decodeBase64(base64: string): Uint8Array {
  if (typeof globalThis.atob !== 'function') return new Uint8Array(0);
  const binary = globalThis.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function isPng(bytes: Uint8Array): boolean {
  return bytes.length > 8
    && bytes[0] === 0x89
    && bytes[1] === 0x50
    && bytes[2] === 0x4e
    && bytes[3] === 0x47
    && bytes[4] === 0x0d
    && bytes[5] === 0x0a
    && bytes[6] === 0x1a
    && bytes[7] === 0x0a;
}

/**
 * The on-screen QR exports at 224pt x device scale, which exceeds WidgetKit's image
 * area limit for small widgets. WidgetKit then fails to archive the view and leaves
 * the redacted placeholder (a gray square) on the Home Screen, so the PNG must be
 * reduced to the size the widget actually draws.
 */
async function downscaleQrPng(bytes: Uint8Array): Promise<Uint8Array> {
  const side = Math.round(WIDGET_QR_MAX_POINTS * PixelRatio.get());
  const source = new File(Paths.cache, `vcpros-widget-qr-source-${Date.now()}.png`);
  source.write(bytes);
  const context = ImageManipulator.manipulate(source.uri);
  try {
    context.resize({ width: side, height: side });
    const image = await context.renderAsync();
    try {
      const saved = await image.saveAsync({ format: SaveFormat.PNG, base64: true });
      return decodeBase64(saved.base64 ?? '');
    } finally {
      image.release();
    }
  } finally {
    context.release();
    // Clean-up only: Android can drop the cache file before this runs, and a failed delete must
    // not hide the resized QR (or the real error) from the caller.
    try {
      if (source.exists) source.delete();
    } catch {
      // The OS clears the cache directory on its own.
    }
  }
}

/**
 * Writes the rendered QR PNG into the app-group directory shared with the widget
 * extension (home/lock screen widgets and Live Activities) and returns its file URI.
 */
export async function writeWidgetQrImage(qrSvg: QrSvgRef | null, fileName: string): Promise<string> {
  const base64 = await readQrPng(qrSvg);
  if (!base64) throw new Error('The QR code is not ready yet. Wait a moment and try again.');

  const bytes = decodeBase64(base64);
  if (!isPng(bytes)) throw new Error('The QR image could not be prepared.');

  // The size limit is WidgetKit's (iOS). Android widgets draw the exported PNG as is, and Android
  // cannot reload the temporary file the resize needs ("Loading bitmap failed").
  const widgetBytes = Platform.OS === 'ios' ? await downscaleQrPng(bytes) : bytes;
  if (!isPng(widgetBytes)) throw new Error('The QR image could not be prepared.');

  const { widgetsDirectory } = await import('expo-widgets');
  const qrFile = new File(widgetsDirectory, fileName);
  qrFile.write(widgetBytes);
  return qrFile.uri;
}

export async function prepareHomeScreenWidget({
  cardId,
  cardName,
  qrSvg,
  shareUrl,
}: {
  cardId: string;
  cardName: string;
  qrSvg: QrSvgRef | null;
  shareUrl: string;
}): Promise<PrepareWidgetResult> {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return 'unsupported';
  if (Constants.appOwnership === 'expo') return 'requires-native-build';

  const safeCardId = cardId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const [qrImageUri, { default: VCProsCardWidget }] = await Promise.all([
    // A new filename prevents WidgetKit from reusing a stale decoded image
    // after the user switches cards or changes the QR design.
    writeWidgetQrImage(qrSvg, `vcpros-card-qr-${safeCardId}-${Date.now()}.png`),
    import('@/widgets/VCProsCardWidget'),
  ]);
  const widgetProps = {
    cardName: cardName || 'My VC Card',
    openUrl: `vcpros:///cards/${encodeURIComponent(cardId)}?source=widget`,
    qrImageUri,
    shareUrl,
  };
  if (Platform.OS === 'ios') {
    // Make the replacement entry unambiguously active. An entry stamped at the exact current
    // millisecond can be treated as future data while WidgetKit is loading the timeline.
    VCProsCardWidget.updateTimeline([{ date: new Date(Date.now() - 1_000), props: widgetProps }]);
  } else {
    VCProsCardWidget.updateSnapshot(widgetProps);
  }
  return 'ready';
}
