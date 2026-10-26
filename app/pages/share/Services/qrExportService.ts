import { Alert, Platform, Share } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export interface QrSvgRef {
  toDataURL?: (callback: (dataUrl: string) => void) => void;
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
 * Exports the active QR code SVG as a PNG file and triggers the native share / save-to-photos sheet.
 */
export async function saveOrShareQrCodePng({
  qrSvg,
  cardName,
  shareUrl,
  dialogTitle = 'Save QR Code to Photos',
}: {
  qrSvg: QrSvgRef | null;
  cardName: string;
  shareUrl: string;
  dialogTitle?: string;
}): Promise<void> {
  const safeSlug = (cardName || 'vcpros-card').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  const fileName = `${safeSlug}-qr.png`;
  const base64Png = await extractBase64Png(qrSvg);

  if (Platform.OS === 'web' && typeof document !== 'undefined' && base64Png) {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64Png}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  if (base64Png) {
    try {
      const bytes = decodeBase64ToBytes(base64Png);
      if (bytes.length > 0) {
        const file = new File(Paths.cache, fileName);
        file.write(bytes);
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(file.uri, {
            mimeType: 'image/png',
            dialogTitle,
            UTI: 'public.png',
          });
          return;
        }
      }
    } catch {
      // Fallback to sharing URL below
    }
  }

  try {
    await Share.share({
      message: `${cardName || 'VC Pros'} QR link: ${shareUrl}`,
      url: Platform.OS === 'ios' ? shareUrl : undefined,
      title: dialogTitle,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Try again in a moment.';
    Alert.alert('Could not save QR code', msg);
  }
}
