import AsyncStorage from '@react-native-async-storage/async-storage';

import { QR_CUSTOMIZATION_STORAGE_KEY } from '../Config/qrCustomizationDefaults';
import type { QrCustomization } from '../types/share.types';
import { normalizeQrCustomization } from '../Utils/normalizeQrCustomization';

type Listener = (cardId: string, customization: QrCustomization) => void;

const listeners = new Set<Listener>();

export async function readQrCustomization(cardId: string): Promise<QrCustomization> {
  if (!cardId) return normalizeQrCustomization();
  const raw = await AsyncStorage.getItem(QR_CUSTOMIZATION_STORAGE_KEY);
  const saved = raw ? (JSON.parse(raw) as Record<string, Partial<QrCustomization>>) : {};
  return normalizeQrCustomization(saved[cardId]);
}

export function publishQrCustomization(cardId: string, customization: QrCustomization) {
  if (!cardId) return;
  listeners.forEach((listener) => listener(cardId, customization));
}

export function subscribeQrCustomization(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
