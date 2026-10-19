// components/walletCardComponents/Hooks/useAddToWallet.ts
import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { ApiError } from '@/services/api/client';
import { addCardToWallet, getWalletStatus, usesNativeAppleWalletPresenter, walletForPlatform, walletLabel, type WalletStatus } from '../Services/walletPassService';

/** Browser fallback has no completion callback, so check Wallet registration a few times. */
const CHECK_DELAYS_MS = [0, 1500, 3000, 5000, 8000];
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Shared "Add to Wallet" action for the card page and the homepage card sheet.
 * Production iOS builds use the native PassKit presenter and receive a direct completion result.
 * Expo Go falls back to an in-app browser and confirms the result through Wallet registration.
 */
export function useAddToWallet() {
  const [adding, setAdding] = useState(false);
  const busy = useRef(false);

  const confirmAdded = async (
    cardId: string,
    before: WalletStatus,
    cardName?: string,
    signal?: { cancelled: boolean },
  ) => {
    for (const delay of CHECK_DELAYS_MS) {
      await sleep(delay);
      if (signal?.cancelled) return false;
      const now = await getWalletStatus(cardId).catch(() => null);
      if (now?.apple.inWallet && now.apple.addedAt !== before.apple.addedAt) {
        // The in-app Safari sheet has no native "pass added" callback. The Wallet web-service
        // registration is that signal, so close the sheet as soon as the API observes it.
        await WebBrowser.dismissBrowser().catch(() => undefined);
        Alert.alert('Added to Apple Wallet', `${cardName ? `${cardName}'s card` : 'Your card'} is now in Wallet. Open the Wallet app to show it or share its QR code.`);
        return true;
      }
    }
    // Not registered: the user cancelled, or the card was already there and only updated.
    if (before.apple.inWallet) {
      Alert.alert('Apple Wallet', 'This card is already in your Wallet. If you tapped Update, it now shows your latest details.');
      return true;
    }
    Alert.alert(
      'Could not confirm Wallet addition',
      'Apple Wallet did not confirm the pass in time. Check the Wallet app, or try adding the card again.',
    );
    return false;
  };

  const addToWallet = useCallback(async (cardId: string | undefined, cardName?: string) => {
    if (!cardId || busy.current) return;
    busy.current = true;
    setAdding(true);
    const confirmationSignal = { cancelled: false };
    try {
      const wallet = walletForPlatform();
      // Snapshot before opening, so a pass that was already in Wallet is not mistaken for a new add.
      const before = wallet === 'apple' ? await getWalletStatus(cardId).catch(() => null) : null;
      // Start observing before the browser fallback opens. This allows Wallet's
      // registration callback to dismiss the browser and return to VC Pros.
      const observeWhilePresented = wallet === 'apple' && !usesNativeAppleWalletPresenter();
      const confirmation = before?.apple.enabled && observeWhilePresented
        ? confirmAdded(cardId, before, cardName, confirmationSignal)
        : null;
      const outcome = await addCardToWallet(cardId);
      // The native presenter tells us when the user cancelled. Do not keep a
      // blocking spinner alive for a registration that will never arrive.
      if (outcome === 'cancelled') {
        confirmationSignal.cancelled = true;
        return;
      }
      if (outcome === 'added') {
        confirmationSignal.cancelled = true;
        Alert.alert(
          'Added to Apple Wallet',
          `${cardName ? `${cardName}'s card` : 'Your card'} is now in Wallet. Open the Wallet app to show it or share its QR code.`,
        );
        return;
      }
      if (confirmation) await confirmation;
    } catch (reason) {
      confirmationSignal.cancelled = true;
      const wallet = walletForPlatform() === 'google' ? 'Google Wallet' : 'Apple Wallet';
      const message = reason instanceof ApiError && reason.status === 503
        ? `${wallet} isn’t set up on the server yet. Add the wallet credentials to the API to enable it.`
        : reason instanceof Error ? reason.message : 'Could not create the wallet pass. Please try again.';
      Alert.alert(walletLabel(), message);
    } finally {
      confirmationSignal.cancelled = true;
      busy.current = false;
      setAdding(false);
    }
  }, []);

  return { adding, addToWallet, label: walletLabel() };
}
