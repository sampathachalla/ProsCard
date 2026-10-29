import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { File } from 'expo-file-system';

import type { QrSvgRef } from './qrExportService';

export type PrepareWidgetResult = 'ready' | 'requires-native-build' | 'unsupported';

async function readQrPng(qrSvg: QrSvgRef | null): Promise<string | null> {
  if (qrSvg?.capturePngUri) {
    const uri = await qrSvg.capturePngUri();
    if (uri) {
      try {
        const file = new File(uri);
        const base64 = await file.base64();
        return base64.trim() || null;
      } catch {
        return null;
      }
    }
  }

  return new Promise((resolve) => {
    if (!qrSvg?.toDataURL) {
      resolve(null);
      return;
    }
    try {
      qrSvg.toDataURL((dataUrl) => {
        resolve(dataUrl.replace(/^data:image\/png;base64,/, '').trim() || null);
      });
    } catch {
      resolve(null);
    }
  });
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

/**
 * Writes the rendered QR PNG into the app-group directory shared with the widget
 * extension (home/lock screen widgets and Live Activities) and returns its file URI.
 */
export async function writeWidgetQrImage(qrSvg: QrSvgRef | null, fileName: string): Promise<string> {
  const base64 = await readQrPng(qrSvg);
  if (!base64) throw new Error('The QR code is not ready yet. Wait a moment and try again.');

  const bytes = decodeBase64(base64);
  if (bytes.length === 0) throw new Error('The QR image could not be prepared.');

  const { widgetsDirectory } = await import('expo-widgets');
  const qrFile = new File(widgetsDirectory, fileName);
  qrFile.write(bytes);
  return qrFile.uri;
}

export async function prepareHomeScreenWidget({
  cardName,
  qrSvg,
  shareUrl,
}: {
  cardName: string;
  qrSvg: QrSvgRef | null;
  shareUrl: string;
}): Promise<PrepareWidgetResult> {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return 'unsupported';
  if (Constants.appOwnership === 'expo') return 'requires-native-build';

  const [qrImageUri, { default: VCProsCardWidget }] = await Promise.all([
    writeWidgetQrImage(qrSvg, 'vcpros-card-qr.png'),
    import('@/widgets/VCProsCardWidget'),
  ]);
  VCProsCardWidget.updateSnapshot({
    cardName: cardName || 'My VC Card',
    qrImageUri,
    shareUrl,
  });
  return 'ready';
}
