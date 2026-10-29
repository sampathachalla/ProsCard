import {
  AtSign,
  Camera,
  Copy,
  Download,
  LayoutGrid,
  Link2,
  Lock,
  Mail,
  MessageCircle,
  PanelTop,
  Palette,
  Share2,
  Smartphone,
  Wallet,
} from 'lucide-react-native';
import type { QrCustomization, QrCustomizationPreset, ShareActionItemConfig } from '../types/share.types';

/**
 * Row sequence from the Share Page wireframe:
 * 1. Share card
 * 2. Copy link
 * 3. Add card to wallet
 * 4. Add QR to lockscreen
 * 5. Add QR to homescreen
 * 6. Save QR to Photos
 * 7. Customize QR code
 * 8. Share via email
 * 9. Share with NameDrop
 * 10. Share via linkedin
 * 11. Share via whatsapp
 * 12. Share via insta
 * 13. Share via X
 */
export const SHARE_PAGE_ACTIONS: ShareActionItemConfig[] = [
  {
    id: 'share_card',
    label: 'Share card',
    icon: Share2,
    iconColor: '#38bdf8',
  },
  {
    id: 'copy_link',
    label: 'Copy link',
    icon: Copy,
    iconColor: '#38bdf8',
  },
  {
    id: 'add_to_wallet',
    label: 'Add card to wallet',
    icon: Wallet,
    iconColor: '#60a5fa',
  },
  {
    id: 'add_qr_lockscreen',
    label: 'Add QR to lockscreen',
    icon: Lock,
    iconColor: '#38bdf8',
  },
  {
    id: 'add_qr_homescreen',
    label: 'Add QR to homescreen',
    icon: LayoutGrid,
    iconColor: '#38bdf8',
  },
  {
    id: 'show_live_activity',
    label: 'Show in Dynamic Island',
    icon: PanelTop,
    iconColor: '#38bdf8',
    platforms: ['ios'],
  },
  {
    id: 'save_qr_photos',
    label: 'Save QR to Photos',
    icon: Download,
    iconColor: '#38bdf8',
  },
  {
    id: 'customize_qr',
    label: 'Customize QR code',
    icon: Palette,
    iconColor: '#818cf8',
  },
  {
    id: 'share_email',
    label: 'Share via email',
    icon: Mail,
    iconColor: '#60a5fa',
  },
  {
    id: 'share_namedrop',
    label: 'Share with NameDrop',
    icon: Smartphone,
    iconColor: '#38bdf8',
  },
  {
    id: 'share_linkedin',
    label: 'Share via LinkedIn',
    icon: Link2,
    iconColor: '#0a66c2',
  },
  {
    id: 'share_whatsapp',
    label: 'Share via WhatsApp',
    icon: MessageCircle,
    iconColor: '#25d366',
  },
  {
    id: 'share_instagram',
    label: 'Share via Instagram',
    icon: Camera,
    iconColor: '#e1306c',
  },
  {
    id: 'share_x',
    label: 'Share via X',
    icon: AtSign,
    iconColor: '#38bdf8',
  },
];

export const QR_CUSTOMIZATION_PRESETS: QrCustomizationPreset[] = [
  {
    id: 'signature-dark',
    label: 'Signature Dark',
    foregroundColor: '#ffffff',
    backgroundColor: '#111827',
    accentColor: '#38bdf8',
  },
  {
    id: 'classic-light',
    label: 'Clean Light',
    foregroundColor: '#0f172a',
    backgroundColor: '#ffffff',
    accentColor: '#2563eb',
  },
  {
    id: 'vcpros-blue',
    label: 'VC Pros Blue',
    foregroundColor: '#ffffff',
    backgroundColor: '#0f172a',
    accentColor: '#38bdf8',
  },
  {
    id: 'cyber-cyan',
    label: 'Cyber Cyan',
    foregroundColor: '#38bdf8',
    backgroundColor: '#090d16',
    accentColor: '#ffffff',
  },
  {
    id: 'emerald-pro',
    label: 'Emerald Pro',
    foregroundColor: '#ffffff',
    backgroundColor: '#064e3b',
    accentColor: '#34d399',
  },
];

export const QR_PRESET_STORAGE_KEY = 'vcpros.share.qrPresetId.v2';
export const QR_CUSTOMIZATION_STORAGE_KEY = 'vcpros.share.qrCustomizationByCard.v1';

export const DEFAULT_QR_CUSTOMIZATION: QrCustomization = {
  presetId: QR_CUSTOMIZATION_PRESETS[0].id,
  patternStyle: 'dots',
  cornerStyle: 'rounded',
  logoSize: 'medium',
  frameStyle: 'rounded',
  captionVisible: true,
  caption: 'Scan to share card',
  exportFormat: 'png',
};
