import type { BusinessCard } from '@/pages/cards/types/card.types';
import { QR_CUSTOMIZATION_PRESETS } from '../Config/qrCustomizationDefaults';
import type { QrCustomization, QrCustomizationPreset } from '../types/share.types';

export function resolveQrPreset(
  card: BusinessCard,
  customization: QrCustomization,
): QrCustomizationPreset {
  if (card.appliedTheme) {
    return {
      id: 'card-theme',
      label: 'Card theme',
      foregroundColor: card.appliedTheme.textColor,
      backgroundColor: card.appliedTheme.surfaceColor,
      accentColor: card.appliedTheme.accentColor,
    };
  }

  return (
    QR_CUSTOMIZATION_PRESETS.find((preset) => preset.id === customization.presetId) ??
    QR_CUSTOMIZATION_PRESETS[0]
  );
}
