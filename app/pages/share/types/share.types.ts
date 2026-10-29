import type { LucideIcon } from 'lucide-react-native';
import type { ShareActionId } from '../Config/shareActionIds';

export type { ShareActionId } from '../Config/shareActionIds';

export interface ShareActionItemConfig {
  id: ShareActionId;
  label: string;
  icon: LucideIcon;
  iconColor: string;
  /** Limits the row to these platforms; shown everywhere when omitted. */
  platforms?: ('ios' | 'android' | 'web')[];
}

export interface QrCustomizationPreset {
  id: string;
  label: string;
  foregroundColor: string;
  backgroundColor: string;
  accentColor: string;
}

export type QrPatternStyle = 'dots' | 'rounded' | 'square';
export type QrCornerStyle = 'rounded' | 'square' | 'circle';
export type QrLogoSize = 'small' | 'medium' | 'large';
export type QrFrameStyle = 'none' | 'simple' | 'rounded' | 'badge';
export type QrExportFormat = 'png' | 'svg' | 'pdf';

export interface QrCustomization {
  presetId: string;
  patternStyle: QrPatternStyle;
  cornerStyle: QrCornerStyle;
  logoSize: QrLogoSize;
  frameStyle: QrFrameStyle;
  captionVisible: boolean;
  caption: string;
  exportFormat: QrExportFormat;
}

export type ShareGuideModalKind =
  | 'wallet'
  | 'lockscreen'
  | 'homescreen'
  | 'liveactivity'
  | 'namedrop'
  | null;
