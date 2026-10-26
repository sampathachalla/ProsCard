import { Platform } from 'react-native';

export function buildCardShareMessage(cardName: string, shareUrl: string): string {
  const cleanName = cardName?.trim() || 'My';
  return `Connect with ${cleanName} on VC Pros:\n${shareUrl}`;
}

export function buildEmailShareUrl(cardName: string, shareUrl: string): string {
  const cleanName = cardName?.trim() || 'My digital business card';
  const subject = encodeURIComponent(`${cleanName} | VC Pros`);
  const body = encodeURIComponent(`Hi,\n\nHere is my digital business card:\n${shareUrl}`);
  return `mailto:?subject=${subject}&body=${body}`;
}

export function buildWhatsAppShareUrl(cardName: string, shareUrl: string): {
  appUrl: string;
  webUrl: string;
} {
  const text = encodeURIComponent(buildCardShareMessage(cardName, shareUrl));
  return {
    appUrl: `whatsapp://send?text=${text}`,
    webUrl: `https://wa.me/?text=${text}`,
  };
}

export function buildLinkedInShareUrl(shareUrl: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
}

export function buildXShareUrl(cardName: string, shareUrl: string): {
  appUrl: string;
  webUrl: string;
} {
  const text = encodeURIComponent(`Check out ${cardName?.trim() || 'my'} digital business card on VC Pros:`);
  const encodedUrl = encodeURIComponent(shareUrl);
  return {
    appUrl: `twitter://post?message=${encodeURIComponent(`${cardName?.trim() || 'My card'} — ${shareUrl}`)}`,
    webUrl: `https://x.com/intent/tweet?text=${text}&url=${encodedUrl}`,
  };
}

export function buildInstagramShareUrl(): {
  appUrl: string;
  webUrl: string;
} {
  return {
    appUrl: 'instagram://app',
    webUrl: 'https://www.instagram.com/',
  };
}

/**
 * Copies text to the clipboard across Web and React Native without requiring extra native modules.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }

  try {
    // React Native internal Clipboard or global navigator clipboard if available
    const rn = require('react-native');
    if (rn?.Clipboard?.setString) {
      rn.Clipboard.setString(text);
      return true;
    }
  } catch {
    // Ignore
  }

  return false;
}
