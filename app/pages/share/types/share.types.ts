import type { LucideIcon } from 'lucide-react-native';
import type { ShareActionId } from '../Config/shareActionIds';

export type { ShareActionId } from '../Config/shareActionIds';

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
