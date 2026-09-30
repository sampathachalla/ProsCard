// components/scannerComponents/Hooks/useCardCapture.ts
import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { pickCardFromLibrary, scanCard } from '../Services/cardCaptureService';
import type { CapturedCard } from '../types/scanner.types';

type CaptureMode = 'scan' | 'library';

/** Route params used to hand a captured card to the new-contact screen. */
export function newContactParams(card: CapturedCard) {
  return {
    imageUri: card.uri,
    source: card.source,
    edgeDetected: card.edgeDetected ? '1' : '0',
    ...(card.mimeType ? { mimeType: card.mimeType } : {}),
    ...(card.fileName ? { fileName: card.fileName } : {}),
  };
}

/**
 * Shared business-card capture used by the scanner, the contacts page and the new-contact form.
 * `captureCard` returns the photo; `startContactFromCard` also opens the new-contact form with it.
 */
export function useCardCapture() {
  const router = useRouter();
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

  const openNewContact = useCallback(
    (card: CapturedCard, { replace = false } = {}) => {
      const href = { pathname: '/contacts/new' as const, params: newContactParams(card) };
      if (replace) router.replace(href);
      else router.push(href);
    },
    [router]
  );

  const startContactFromCard = useCallback(
    async (mode: CaptureMode, options?: { replace?: boolean }) => {
      const card = await captureCard(mode);
      if (card) openNewContact(card, options);
      return card;
    },
    [captureCard, openNewContact]
  );

  return { busy, captureCard, openNewContact, startContactFromCard };
}
