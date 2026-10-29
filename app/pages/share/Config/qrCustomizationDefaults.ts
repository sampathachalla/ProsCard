import type { QrCustomization, QrCustomizationPreset } from '../types/share.types';

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
