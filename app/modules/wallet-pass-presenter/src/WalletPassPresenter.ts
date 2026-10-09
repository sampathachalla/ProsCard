import { requireOptionalNativeModule } from 'expo';

export type WalletPassPresentationResult = {
  added: boolean;
};

type WalletPassPresenterModule = {
  presentAsync(url: string): Promise<WalletPassPresentationResult>;
};

const nativeModule = requireOptionalNativeModule<WalletPassPresenterModule>('WalletPassPresenter');

/** False in Expo Go, Android, and web; true in a ProsCard iOS development or production build. */
export function isNativeWalletPassPresenterAvailable(): boolean {
  return nativeModule != null;
}

/** Downloads and presents a signed pass with Apple's native PKAddPassesViewController. */
export async function presentWalletPassAsync(url: string): Promise<WalletPassPresentationResult> {
  if (!nativeModule) throw new Error('The native Apple Wallet presenter is unavailable in this build.');
  return nativeModule.presentAsync(url);
}
