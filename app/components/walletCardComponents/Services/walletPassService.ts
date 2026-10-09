// components/walletCardComponents/Services/walletPassService.ts
import { Linking, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { apiRequest } from '@/services/api/client';
import { AUTH_TEST_MODE } from '@/components/authComponents/Config/authMode';
import {
  isNativeWalletPassPresenterAvailable,
  presentWalletPassAsync,
} from '@/modules/wallet-pass-presenter';

export type WalletKind = 'apple' | 'google';

/** iPhone → Apple Wallet, Android → Google Wallet; none on web. */
export function walletForPlatform(): WalletKind | null {
  if (Platform.OS === 'ios') return 'apple';
  if (Platform.OS === 'android') return 'google';
  return null;
}

export function walletLabel(kind: WalletKind | null = walletForPlatform()): string {
  return kind === 'google' ? 'Add to Google Wallet' : kind === 'apple' ? 'Add to Apple Wallet' : 'Add to Wallet';
}

export type WalletStatus = { apple: { enabled: boolean; inWallet: boolean; addedAt: string | null } };

/** Whether the card's Apple pass is in a Wallet; Wallet reports this to the API when the pass is added or removed. */
export async function getWalletStatus(cardId: string): Promise<WalletStatus> {
  return apiRequest<WalletStatus>(`/wallet/cards/${encodeURIComponent(cardId)}/status`);
}

/**
 * Adds a card to the phone's wallet. The API builds the pass from the card exactly as My Cards shows it
 * (photo, logo, name, title, company, colours, share QR):
 *  - Apple: a short-lived link to a signed .pkpass; an in-app Safari sheet shows Apple Wallet.
 *  - Google: a "Save to Google Wallet" link that opens Google's add screen.
 */
export async function addCardToWallet(cardId: string): Promise<void> {
  const kind = walletForPlatform();
  if (!kind) throw new Error('Open ProsCard on your iPhone or Android phone to add this card to your wallet.');
  if (AUTH_TEST_MODE) throw new Error('Wallet passes need the backend; turn off auth test mode.');
  const { url } = await apiRequest<{ url: string }>(`/wallet/cards/${encodeURIComponent(cardId)}/${kind}`, { method: 'POST' });
  if (kind === 'apple') {
    if (isNativeWalletPassPresenterAvailable()) {
      await presentWalletPassAsync(url);
      return;
    }
    // A raw Linking.openURL leaves the user on Safari's blank .pkpass download page after Add.
    // Expo Go cannot load the native PassKit presenter, so keep an explicit Done fallback there.
    await WebBrowser.openBrowserAsync(url, {
      dismissButtonStyle: 'done',
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    });
    return;
  }
  await Linking.openURL(url);
}
