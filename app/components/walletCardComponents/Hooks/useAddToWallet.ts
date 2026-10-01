// components/walletCardComponents/Hooks/useAddToWallet.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, type AppStateStatus } from 'react-native';
import { ApiError } from '@/services/api/client';
import { addCardToWallet, getWalletStatus, walletForPlatform, walletLabel, type WalletStatus } from '../Services/walletPassService';

/** Wallet registers the pass with the API a moment after "Add" is tapped, so check a few times. */
const CHECK_DELAYS_MS = [0, 1500, 3000, 5000, 8000];
/** Stop waiting for the user to come back from Safari after this long. */
const WAIT_LIMIT_MS = 5 * 60 * 1000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Shared "Add to Wallet" action for the card page and the homepage card sheet.
 * On iPhone the pass opens in Safari, outside the app, so the app cannot see the user tap "Add". Wallet
 * tells the API when the pass lands on the device; when the user returns to ProsCard the app checks
 * that and confirms "Added to Apple Wallet".
 */
export function useAddToWallet() {
  const [adding, setAdding] = useState(false);
  const busy = useRef(false);
  const stopWaiting = useRef<(() => void) | null>(null);

  useEffect(() => () => stopWaiting.current?.(), []);

  /** Runs `onReturn` the next time the app comes back to the foreground. */
  const whenUserReturns = (onReturn: () => void) => {
    stopWaiting.current?.();
    let wentAway = false;
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state !== 'active') {
        wentAway = true;
        return;
      }
      if (!wentAway) return;
      stop();
      onReturn();
    });
    const timer = setTimeout(() => stop(), WAIT_LIMIT_MS);
    const stop = () => {
      subscription.remove();
      clearTimeout(timer);
      stopWaiting.current = null;
    };
    stopWaiting.current = stop;
  };

  const confirmAdded = async (cardId: string, before: WalletStatus, cardName?: string) => {
    for (const delay of CHECK_DELAYS_MS) {
      await sleep(delay);
      const now = await getWalletStatus(cardId).catch(() => null);
      if (now?.apple.inWallet && now.apple.addedAt !== before.apple.addedAt) {
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
      await addCardToWallet(cardId);
      if (before?.apple.enabled) whenUserReturns(() => { void confirmAdded(cardId, before, cardName); });
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
