import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

import { writeWidgetQrImage } from './homeScreenWidgetService';
import type { QrSvgRef } from './qrExportService';

export type StartLiveActivityResult = 'started' | 'updated' | 'requires-native-build' | 'unsupported';

/** Set when the user turns the Live Activity off, so the app does not switch it back on by itself. */
const LIVE_ACTIVITY_STOPPED_KEY = 'cardLiveActivityStopped';

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
  await AsyncStorage.removeItem(LIVE_ACTIVITY_STOPPED_KEY).catch(() => undefined);
  return running.length > 0 ? 'updated' : 'started';
}

/**
 * Starts the Live Activity when the app opens, unless one is already showing or the user turned it off.
 * Replacing a running one here would drop the QR the user added from the Share page.
 */
export async function ensureCardLiveActivity(
  input: Parameters<typeof startCardLiveActivity>[0],
): Promise<StartLiveActivityResult | null> {
  if (!isLiveActivityPlatform()) return null;
  if (await AsyncStorage.getItem(LIVE_ACTIVITY_STOPPED_KEY)) return null;
  if (await isCardLiveActivityRunning()) return null;
  return startCardLiveActivity(input);
}

export async function stopCardLiveActivity(): Promise<void> {
  if (!isLiveActivityPlatform()) return;
  await AsyncStorage.setItem(LIVE_ACTIVITY_STOPPED_KEY, 'true').catch(() => undefined);
  await endCardLiveActivity();
}

/** Clears the Lock Screen without recording a choice, e.g. on logout, so a stranger never sees this card. */
export async function endCardLiveActivity(): Promise<void> {
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
