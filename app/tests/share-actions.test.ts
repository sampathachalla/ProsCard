import { describe, expect, it, vi } from 'vitest';
import { Platform } from 'react-native';

const { saveToLibraryAsync, requestPermissionsAsync, shareAsync } = vi.hoisted(() => ({
  saveToLibraryAsync: vi.fn().mockResolvedValue(undefined),
  requestPermissionsAsync: vi.fn().mockResolvedValue({ granted: true, canAskAgain: true }),
  shareAsync: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('expo-media-library/legacy', () => ({
  requestPermissionsAsync,
  saveToLibraryAsync,
}));

vi.mock('expo-sharing', () => ({
  isAvailableAsync: vi.fn().mockResolvedValue(true),
  shareAsync,
}));

vi.mock('expo-clipboard', () => ({ setStringAsync: vi.fn().mockResolvedValue(undefined) }));
vi.mock('lucide-react-native', () => {
  const Dummy = () => null;
  return {
    AtSign: Dummy,
    Camera: Dummy,
    Check: Dummy,
    ChevronDown: Dummy,
    ChevronRight: Dummy,
    ChevronUp: Dummy,
    Copy: Dummy,
    Download: Dummy,
    Globe: Dummy,
    LayoutGrid: Dummy,
    Link2: Dummy,
    Lock: Dummy,
    Mail: Dummy,
    MessageCircle: Dummy,
    Palette: Dummy,
    PanelTop: Dummy,
    Share2: Dummy,
    Smartphone: Dummy,
    Wallet: Dummy,
  };
});

vi.mock('expo-file-system', () => {
  class File {
    uri: string;
    constructor(...parts: ({ uri: string } | string)[]) {
      this.uri = parts.map((part) => (typeof part === 'string' ? part : part.uri)).join('/');
    }
    write() {}
  }
  return { File, Paths: { cache: { uri: 'file:///cache' } } };
});

import { SHARE_ACTION_IDS } from '@/pages/share/Config/shareActionIds';
import {
  SHARE_VIA_SOCIAL_ACTION,
  SOCIAL_SHARE_ACTION_IDS,
} from '@/pages/share/Config/shareActionsConfig';
import { saveOrShareQrCodePng } from '@/pages/share/Services/qrExportService';
import {
  buildEmailShareUrl,
  buildInstagramShareUrl,
  buildLinkedInShareUrl,
  buildWhatsAppShareUrl,
  buildXShareUrl,
} from '@/pages/share/Utils/shareFormatters';

describe('share-page shipping contract', () => {
  it('exposes all 14 unique actions in the approved order', () => {
    expect(SHARE_ACTION_IDS).toEqual([
      'share_card',
      'copy_link',
      'add_to_wallet',
      'add_qr_lockscreen',
      'add_qr_homescreen',
      'save_qr_photos',
      'customize_qr',
      'show_live_activity',
      'share_email',
      'share_namedrop',
      'share_linkedin',
      'share_whatsapp',
      'share_instagram',
      'share_x',
    ]);
    expect(new Set(SHARE_ACTION_IDS).size).toBe(14);
  });

  it('builds valid destinations for every dedicated share channel', () => {
    const cardUrl = 'https://vcpros.example/share/card-1';
    expect(buildEmailShareUrl('Sampath', cardUrl)).toMatch(/^mailto:\?subject=/);
    expect(buildLinkedInShareUrl(cardUrl)).toContain(encodeURIComponent(cardUrl));
    expect(buildWhatsAppShareUrl('Sampath', cardUrl).appUrl).toMatch(/^whatsapp:\/\//);
    expect(buildInstagramShareUrl().appUrl).toBe('instagram://app');
    expect(buildXShareUrl('Sampath', cardUrl).webUrl).toContain('x.com/intent/tweet');
  });

  it('saves a rendered QR PNG directly into Photos when permission is granted', async () => {
    const originalOs = Platform.OS;
    Platform.OS = 'ios';
    const png = globalThis.btoa('png-bytes');

    await saveOrShareQrCodePng({
      qrSvg: {
        capturePngUri: async () => 'file:///cache/sampath-qr.png',
        toDataURL: (callback) => callback(`data:image/png;base64,${png}`),
      },
      cardName: 'Sampath',
      shareUrl: 'https://vcpros.example/share/card-1',
    });

    expect(requestPermissionsAsync).toHaveBeenCalledWith(true);
    expect(saveToLibraryAsync).toHaveBeenCalledWith(expect.stringContaining('sampath-qr.png'));
    expect(shareAsync).not.toHaveBeenCalled();
    Platform.OS = originalOs;
  });

  it('groups social sharing channels under the dropdown contract', () => {
    expect(SHARE_VIA_SOCIAL_ACTION.id).toBe('share_social');
    expect(SHARE_VIA_SOCIAL_ACTION.label).toBe('Share via social');
    expect(SOCIAL_SHARE_ACTION_IDS).toEqual([
      'share_linkedin',
      'share_whatsapp',
      'share_instagram',
      'share_x',
    ]);
  });
});
