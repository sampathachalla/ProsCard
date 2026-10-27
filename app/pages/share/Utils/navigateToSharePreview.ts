import { Linking, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { AUTH_TEST_MODE } from '@/pages/auth/Config/authMode';
import { getShareSlug, shareUrlForSlug } from '@/pages/share/Services/sharingService';

/** Opens the public share page in the device browser (Safari / Chrome), not in-app navigation. */
export async function navigateToSharePreview(cardId: string): Promise<void> {
  if (AUTH_TEST_MODE) {
    throw new Error('Share preview requires the live backend (turn off test mode).');
  }

  const slug = await getShareSlug(cardId);
  // A version query prevents an existing mobile-browser session from restoring a stale page snapshot.
  const url = `${shareUrlForSlug(slug)}?updated=${Date.now()}`;

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
  }

  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    throw new Error('This device cannot open the share link.');
  }

  await WebBrowser.openBrowserAsync(url, {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    enableBarCollapsing: true,
  });
}
