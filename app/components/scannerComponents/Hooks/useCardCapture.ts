// components/scannerComponents/Hooks/useCardCapture.ts
import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { pickCardFromLibrary, scanCard } from '../Services/cardCaptureService';
import type { CapturedCard } from '../types/scanner.types';

export type CaptureMode = 'scan' | 'library';

/** Shared business-card capture used by the scanner and the contact review screen. */
export function useCardCapture() {
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  const captureCard = useCallback(async (mode: CaptureMode): Promise<CapturedCard | null> => {
    if (busyRef.current) return null;
    busyRef.current = true;
    setBusy(true);
    try {
      return await (mode === 'scan' ? scanCard() : pickCardFromLibrary());
    } catch (reason) {
      Alert.alert('Scan failed', reason instanceof Error ? reason.message : 'Could not capture the card. Please try again.');
      return null;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, []);

  return { busy, captureCard };
}
