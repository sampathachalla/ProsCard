import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { File } from 'expo-file-system';

import type { QrSvgRef } from './qrExportService';

export type PrepareWidgetResult = 'ready' | 'requires-native-build' | 'unsupported';

function readQrPng(qrSvg: QrSvgRef | null): Promise<string | null> {
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

  const base64 = await readQrPng(qrSvg);
  if (!base64) throw new Error('The QR code is not ready yet. Wait a moment and try again.');

  const bytes = decodeBase64(base64);
  if (bytes.length === 0) throw new Error('The QR image could not be prepared.');

  const [{ widgetsDirectory }, { default: VCProsCardWidget }] = await Promise.all([
    import('expo-widgets'),
    import('@/widgets/VCProsCardWidget'),
  ]);
  const qrFile = new File(widgetsDirectory, 'vcpros-card-qr.png');
  qrFile.write(bytes);
  VCProsCardWidget.updateSnapshot({
    cardName: cardName || 'My VC Card',
    qrImageUri: qrFile.uri,
    shareUrl,
  });
  return 'ready';
}
