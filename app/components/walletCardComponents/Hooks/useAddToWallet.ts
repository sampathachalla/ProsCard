// components/walletCardComponents/Hooks/useAddToWallet.ts
import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { ApiError } from '@/services/api/client';
import { addCardToWallet, getWalletStatus, walletForPlatform, walletLabel, type WalletStatus } from '../Services/walletPassService';

/** Wallet registers the pass with the API a moment after "Add" is tapped, so check a few times. */
const CHECK_DELAYS_MS = [0, 1500, 3000, 5000, 8000];
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Shared "Add to Wallet" action for the card page and the homepage card sheet.
 * On iPhone the pass opens in an in-app Safari sheet. When the sheet closes, Wallet tells the API
 * whether the pass landed on the device and ProsCard confirms the result.
 */
export function useAddToWallet() {
  const [adding, setAdding] = useState(false);
  const busy = useRef(false);

  const confirmAdded = async (cardId: string, before: WalletStatus, cardName?: string) => {
    for (const delay of CHECK_DELAYS_MS) {
      await sleep(delay);
      const now = await getWalletStatus(cardId).catch(() => null);
      if (now?.apple.inWallet && now.apple.addedAt !== before.apple.addedAt) {
        // The in-app Safari sheet has no native "pass added" callback. The Wallet web-service
        // registration is that signal, so close the sheet as soon as the API observes it.
        await WebBrowser.dismissBrowser().catch(() => undefined);
        Alert.alert('Added to Apple Wallet', `${cardName ? `${cardName}'s card` : 'Your card'} is now in Wallet. Open the Wallet app to show it or share its QR code.`);
        return;
      }
    }
    // Not registered: the user cancelled, or the card was already there and only updated.
    if (before.apple.inWallet) {
      Alert.alert('Apple Wallet', 'This card is already in your Wallet. If you tapped Update, it now shows your latest details.');
    }
  };

  const addToWallet = useCallback(async (cardId: string | undefined, cardName?: string) => {
    if (!cardId || busy.current) return;
    busy.current = true;
    setAdding(true);
    try {
      const wallet = walletForPlatform();
      // Snapshot before opening, so a pass that was already in Wallet is not mistaken for a new add.
      const before = wallet === 'apple' ? await getWalletStatus(cardId).catch(() => null) : null;
      // Start observing before opening the sheet; once Apple registers the pass, the observer
      // dismisses the sheet and returns the user to ProsCard automatically.
      const walletFlow = addCardToWallet(cardId);
      const confirmation = before?.apple.enabled ? confirmAdded(cardId, before, cardName) : null;
      await walletFlow;
      if (confirmation) await confirmation;
    } catch (reason) {
      const wallet = walletForPlatform() === 'google' ? 'Google Wallet' : 'Apple Wallet';
      const message = reason instanceof ApiError && reason.status === 503
        ? `${wallet} isn’t set up on the server yet. Add the wallet credentials to the API to enable it.`
        : reason instanceof Error ? reason.message : 'Could not create the wallet pass. Please try again.';
      Alert.alert(walletLabel(), message);
    } finally {
      busy.current = false;
      setAdding(false);
    }
  }, []);

  return { adding, addToWallet, label: walletLabel() };
}
