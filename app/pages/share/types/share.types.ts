import type { LucideIcon } from 'lucide-react-native';

export type ShareActionId =
  | 'share_card'
  | 'copy_link'
  | 'add_to_wallet'
  | 'add_qr_lockscreen'
  | 'add_qr_homescreen'
  | 'share_email'
  | 'share_namedrop'
  | 'share_linkedin'
  | 'share_whatsapp'
  | 'share_instagram'
  | 'share_x'
  | 'save_qr_photos'
  | 'customize_qr';

export interface ShareActionItemConfig {
  id: ShareActionId;
  label: string;
  icon: LucideIcon;
  iconColor: string;
}

export interface QrCustomizationPreset {
  id: string;
  label: string;
  foregroundColor: string;
  backgroundColor: string;
  accentColor: string;
}

export type ShareGuideModalKind =
  | 'wallet'
  | 'lockscreen'
  | 'homescreen'
  | 'namedrop'
  | null;
