/** Matches SharedCardPage column max width — share URL renders inside this box. */
export const SHARE_CARD_MAX_CONTENT_WIDTH = 520;

/**
 * Copy budgets are based on the narrowest professional layout at the minimum
 * supported card width. Keep every editor and fallback source aligned with
 * these values so switching layouts cannot introduce horizontal overflow.
 */
export const CARD_TEXT_LIMITS = {
  displayName: 48,
  professionalName: 32,
  namePart: 24,
  title: 32,
  company: 32,
  accreditations: 24,
  tagline: 48,
  bio: 180,
} as const;

/** Dense contact rows and wallet-pass fields have less horizontal room than forms. */
export const CONTACT_TEXT_LIMITS = {
  name: 48,
  title: 32,
  company: 32,
  eventName: 48,
  phone: 32,
  email: 80,
  website: 96,
  address: 120,
  notes: 500,
} as const;

export function fitCardText(value: string, maxLength: number): string {
  return (value || '').trim().slice(0, maxLength);
}

export function getEffectiveCardContentWidth(viewportWidth: number): number {
  return Math.min(Math.max(280, viewportWidth), SHARE_CARD_MAX_CONTENT_WIDTH);
}

export function getResponsiveTaglineLimit(_viewportWidth?: number): number {
  return CARD_TEXT_LIMITS.tagline;
}

export function fitTaglineToViewport(tagline: string, _viewportWidth?: number): string {
  return fitCardText(tagline, CARD_TEXT_LIMITS.tagline);
}

/** Tagline font size for up to two lines inside the share card column (web-safe, no adjustsFontSizeToFit). */
export function getProfessionalTaglineFontSize(
  availableWidth: number,
  characterCount: number,
  compact: boolean,
): number {
  const width = Math.max(180, availableWidth);
  const chars = Math.max(1, characterCount);
  const lines = 2;
  const charsPerLine = Math.ceil(chars / lines);
  // Italic bold runs wider than body copy on web.
  const widthLimited = Math.floor(width / (charsPerLine * 0.62));
  const min = compact ? 13 : 14;
  const max = compact ? 16 : 18;
  return Math.max(min, Math.min(max, widthLimited));
}

/**
 * Keeps the professional tagline prominent without relying on font shrinking.
 * Shorter copy receives more visual weight while every viewport retains a
 * readable minimum size.
 */
export function getResponsiveTaglineFontSize(viewportWidth: number, characterCount: number): number {
  const usableWidth = Math.max(228, Math.min(688, viewportWidth - 32));
  const charactersPerLine = Math.max(1, Math.ceil(characterCount / 2));
  // Italic display text is wider than regular body copy. This factor targets
  // two balanced lines instead of allowing a short orphaned second line.
  const widthLimitedSize = Math.floor(usableWidth / (charactersPerLine * 0.78));
  return Math.max(20, Math.min(30, widthLimitedSize));
}

export function getResponsiveSingleLineFontSize(
  availableWidth: number,
  characterCount: number,
  minimum: number,
  maximum: number,
  averageGlyphWidth = 0.52,
): number {
  const widthLimitedSize = Math.floor(Math.max(1, availableWidth) / (Math.max(1, characterCount) * averageGlyphWidth));
  return Math.max(minimum, Math.min(maximum, widthLimitedSize));
}

export function getResponsiveAccreditationLimit(viewportWidth: number): number {
  const usableWidth = Math.min(720, Math.max(260, viewportWidth - 48));
  return Math.min(CARD_TEXT_LIMITS.accreditations, Math.max(16, Math.floor(usableWidth / 9)));
}

export function fitAccreditationsToViewport(value: string, _viewportWidth?: number): string {
  return fitCardText(value, CARD_TEXT_LIMITS.accreditations);
}
