import { Alert, Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
// The top-level saveToLibraryAsync is a throwing stub since SDK 58; the legacy entry keeps
// the write-only (add-photos) permission flow.
import * as MediaLibrary from 'expo-media-library/legacy';
import * as Sharing from 'expo-sharing';
import type { QrExportFormat } from '../types/share.types';

export interface QrSvgRef {
  toDataURL?: (callback: (dataUrl: string) => void) => void;
  capturePngUri?: () => Promise<string | null>;
}

function extractBase64Png(qrSvg: QrSvgRef | null): Promise<string | null> {
  return new Promise((resolve) => {
    if (!qrSvg || typeof qrSvg.toDataURL !== 'function') {
      resolve(null);
      return;
    }
    try {
      qrSvg.toDataURL((dataUrl: string) => {
        const cleaned = dataUrl.replace(/^data:image\/png;base64,/, '').trim();
        resolve(cleaned || null);
      });
    } catch {
      resolve(null);
    }
  });
}

async function resolveQrPngFileUri(
  qrSvg: QrSvgRef | null,
  fileName: string,
): Promise<string | null> {
  if (qrSvg?.capturePngUri) {
    const captured = await qrSvg.capturePngUri();
    if (captured) return captured;
  }

  const base64Png = await extractBase64Png(qrSvg);
  if (!base64Png) return null;

  const bytes = decodeBase64ToBytes(base64Png);
  if (bytes.length === 0) return null;

  const file = new File(Paths.cache, fileName);
  file.write(bytes);
  return file.uri;
}

async function resolveQrPngBase64(qrSvg: QrSvgRef | null, fileName: string): Promise<string | null> {
  const uri = await resolveQrPngFileUri(qrSvg, fileName);
  if (!uri) return null;
  try {
    return (await new File(uri).base64()).trim() || null;
  } catch {
    return extractBase64Png(qrSvg);
  }
}

function decodeBase64ToBytes(base64: string): Uint8Array {
  if (typeof globalThis.atob === 'function') {
    const binary = globalThis.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
  return new Uint8Array(0);
}

/**
 * Exports the active QR code SVG as a PNG file and saves it to the device photo library.
 * Falls back to the native share sheet only when direct photo-library saving is unavailable.
 */
export async function saveOrShareQrCodePng({
  qrSvg,
  cardName,
  shareUrl,
  dialogTitle = 'Save QR Code to Photos',
  format = 'png',
}: {
  qrSvg: QrSvgRef | null;
  cardName: string;
  shareUrl: string;
  dialogTitle?: string;
  format?: QrExportFormat;
}): Promise<void> {
  const safeSlug = (cardName || 'vcpros-card').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  const fileName = `${safeSlug}-qr.${format}`;

  try {
    let fileUri: string | null = null;
    if (format === 'png') {
      fileUri = await resolveQrPngFileUri(qrSvg, fileName);
    } else {
      const pngBase64 = await resolveQrPngBase64(qrSvg, `${safeSlug}-qr-source.png`);
      if (pngBase64 && format === 'svg') {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200"><image width="1200" height="1200" href="data:image/png;base64,${pngBase64}"/></svg>`;
        const file = new File(Paths.cache, fileName);
        file.write(svg);
        fileUri = file.uri;
      } else if (pngBase64 && format === 'pdf') {
        const Print = await import('expo-print');
        const result = await Print.printToFileAsync({
          html: `<html><body style="margin:0;display:flex;align-items:center;justify-content:center"><img style="width:90%;height:auto" src="data:image/png;base64,${pngBase64}" /></body></html>`,
          base64: false,
        });
        fileUri = result.uri;
      }
    }
    if (!fileUri) {
      Alert.alert(
        'QR code not ready',
        'Wait for your QR code to finish loading on screen, then try again.',
      );
      return;
    }

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const link = document.createElement('a');
      link.href = fileUri;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    if (format === 'png') {
      const permission = await MediaLibrary.requestPermissionsAsync(true);
      if (permission.granted) {
        await MediaLibrary.saveToLibraryAsync(fileUri);
        Alert.alert('QR code saved', 'The QR code image is now in your Photos library.');
        return;
      }

      if (!permission.canAskAgain) {
        Alert.alert('Photos permission required', 'Allow VC Pros to save images in Settings, then try again.');
        return;
      }
    }

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: format === 'pdf' ? 'application/pdf' : format === 'svg' ? 'image/svg+xml' : 'image/png',
        dialogTitle,
        UTI: format === 'pdf' ? 'com.adobe.pdf' : format === 'svg' ? 'public.svg-image' : 'public.png',
      });
      return;
    }

    Alert.alert('Could not save QR code', 'Photo access was denied and sharing is unavailable on this device.');
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Try again in a moment.';
    Alert.alert('Could not save QR code', msg);
  }
}
