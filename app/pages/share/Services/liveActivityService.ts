import { Platform } from 'react-native';
import Constants from 'expo-constants';

import { writeWidgetQrImage } from './homeScreenWidgetService';
import type { QrSvgRef } from './qrExportService';

export type StartLiveActivityResult = 'started' | 'updated' | 'requires-native-build' | 'unsupported';

function isLiveActivityPlatform(): boolean {
  return Platform.OS === 'ios' && Constants.appOwnership !== 'expo';
}

async function loadFactory() {
  const { default: VCProsCardLiveActivity } = await import('@/widgets/VCProsCardLiveActivity');
  return VCProsCardLiveActivity;
}

/**
 * Shows the card QR as a Live Activity (Lock Screen banner + Dynamic Island).
 * Only one card is shown at a time. A running activity is replaced rather than
 * updated because its tap-through URL is fixed when the activity starts.
 */
export async function startCardLiveActivity({
  cardName,
  qrSvg,
  shareUrl,
}: {
  cardName: string;
  qrSvg: QrSvgRef | null;
  shareUrl: string;
}): Promise<StartLiveActivityResult> {
  if (Platform.OS !== 'ios') return 'unsupported';
  if (Constants.appOwnership === 'expo') return 'requires-native-build';

  const [qrImageUri, factory] = await Promise.all([
    qrSvg ? writeWidgetQrImage(qrSvg, 'vcpros-live-activity-qr.png') : Promise.resolve(undefined),
    loadFactory(),
  ]);
  const props = { cardName: cardName || 'My VC Card', qrImageUri };

  const running = factory.getInstances();
  await Promise.all(running.map((activity) => activity.end('immediate')));

  factory.start(props, shareUrl);
  return running.length > 0 ? 'updated' : 'started';
}

export async function stopCardLiveActivity(): Promise<void> {
  if (!isLiveActivityPlatform()) return;
  const factory = await loadFactory();
  await Promise.all(factory.getInstances().map((activity) => activity.end('immediate')));
}

export async function isCardLiveActivityRunning(): Promise<boolean> {
  if (!isLiveActivityPlatform()) return false;
  try {
    const factory = await loadFactory();
    return factory.getInstances().length > 0;
  } catch {
    return false;
  }
}
