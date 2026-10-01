// components/walletCardComponents/Hooks/useAddToWallet.ts
import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { ApiError } from '@/services/api/client';
import { addCardToWallet, walletForPlatform, walletLabel } from '../Services/walletPassService';

/** Shared "Add to Wallet" action for the card page and the homepage card sheet. */
export function useAddToWallet() {
  const [adding, setAdding] = useState(false);
  const busy = useRef(false);

  const addToWallet = useCallback(async (cardId: string | undefined) => {
    if (!cardId || busy.current) return;
    busy.current = true;
    setAdding(true);
    try {
      await addCardToWallet(cardId);
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
