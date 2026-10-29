import { DEFAULT_QR_CUSTOMIZATION } from '../Config/qrCustomizationDefaults';
import type {
  QrCornerStyle,
  QrCustomization,
  QrExportFormat,
  QrFrameStyle,
  QrLogoSize,
  QrPatternStyle,
} from '../types/share.types';

const PATTERN: QrPatternStyle[] = ['dots', 'rounded', 'square'];
const CORNER: QrCornerStyle[] = ['rounded', 'square', 'circle'];
const LOGO: QrLogoSize[] = ['small', 'medium', 'large'];
const FRAME: QrFrameStyle[] = ['none', 'simple', 'rounded', 'badge'];
const EXPORT: QrExportFormat[] = ['png', 'svg', 'pdf'];

function pickEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

/** Merge persisted / partial values into a safe customization object (avoids runtime crashes in the modal). */
export function normalizeQrCustomization(
  raw?: Partial<QrCustomization> | null,
): QrCustomization {
  const base = { ...DEFAULT_QR_CUSTOMIZATION, ...(raw ?? {}) };
  const caption =
    typeof base.caption === 'string'
      ? base.caption.slice(0, 48)
      : DEFAULT_QR_CUSTOMIZATION.caption;

  return {
    presetId:
      typeof base.presetId === 'string' && base.presetId.trim()
        ? base.presetId.trim()
        : DEFAULT_QR_CUSTOMIZATION.presetId,
    patternStyle: pickEnum(base.patternStyle, PATTERN, DEFAULT_QR_CUSTOMIZATION.patternStyle),
    cornerStyle: pickEnum(base.cornerStyle, CORNER, DEFAULT_QR_CUSTOMIZATION.cornerStyle),
    logoSize: pickEnum(base.logoSize, LOGO, DEFAULT_QR_CUSTOMIZATION.logoSize),
    frameStyle: pickEnum(base.frameStyle, FRAME, DEFAULT_QR_CUSTOMIZATION.frameStyle),
    captionVisible:
      typeof base.captionVisible === 'boolean'
        ? base.captionVisible
        : DEFAULT_QR_CUSTOMIZATION.captionVisible,
    caption,
    exportFormat: pickEnum(base.exportFormat, EXPORT, DEFAULT_QR_CUSTOMIZATION.exportFormat),
  };
}
