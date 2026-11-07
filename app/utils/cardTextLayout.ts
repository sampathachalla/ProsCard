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
  prefix: 12,
  suffix: 12,
  cardTag: 24,
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

// Marks, joiners, variation selectors, skin tones and emoji tag characters that
// continue the previous character rather than starting a new one.
const GRAPHEME_EXTEND = /^(?:\p{M}|[\u200D\uFE0E\uFE0F\u{1F3FB}-\u{1F3FF}\u{E0020}-\u{E007F}])$/u;
const REGIONAL_INDICATOR = /^[\u{1F1E6}-\u{1F1FF}]$/u;

/** Splits text into user-visible characters so clipping never cuts an emoji or accent in half. */
export function splitGraphemes(value: string): string[] {
  const clusters: string[] = [];
  let previous = '';
  let regionalRun = 0;
  for (const codePoint of Array.from(value || '')) {
    const last = clusters.length - 1;
    const joinsPrevious =
      last >= 0 &&
      (GRAPHEME_EXTEND.test(codePoint) ||
        previous === '\u200D' ||
        (REGIONAL_INDICATOR.test(codePoint) && regionalRun % 2 === 1));
    if (joinsPrevious) clusters[last] += codePoint;
    else clusters.push(codePoint);
    regionalRun = REGIONAL_INDICATOR.test(codePoint) ? regionalRun + 1 : 0;
    previous = codePoint;
  }
  return clusters;
}

const TRAILING_SEPARATORS = /[\s,;:|/•·\-–—&+]+$/u;

/**
 * Trims text to a card-safe budget. `maxLength` counts UTF-16 units, the same as
 * TextInput `maxLength` and the API's zod limits. Clipping keeps whole characters,
 * prefers ending on a word boundary, and drops dangling separators.
 */
export function fitCardText(value: string, maxLength: number): string {
  const text = (value || '').trim();
  if (text.length <= maxLength) return text;
  if (maxLength <= 0) return '';

  let clipped = '';
  for (const cluster of splitGraphemes(text)) {
    if (clipped.length + cluster.length > maxLength) break;
    clipped += cluster;
  }

  const nextCharacter = text.charAt(clipped.length);
  const cutMidWord = nextCharacter !== '' && !/\s/.test(nextCharacter);
  if (cutMidWord) {
    const lastSpace = clipped.search(/\s\S*$/);
    // Only back up to a space when it keeps most of the budget; a single long
    // word is clipped hard instead of disappearing.
    if (lastSpace >= Math.ceil(maxLength * 0.6)) clipped = clipped.slice(0, lastSpace);
  }
  return clipped.replace(TRAILING_SEPARATORS, '').trim() || clipped.trim();
}

export type ProfessionalNameParts = {
  prefix?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  suffix?: string;
};

/**
 * Builds the single-line professional name within the shared budget. Instead of
 * cutting mid-word it first shortens the middle name to an initial, then drops
 * the suffix, then the prefix, and only clips as a last resort.
 */
export function fitProfessionalName(
  parts: ProfessionalNameParts,
  maxLength: number = CARD_TEXT_LIMITS.professionalName,
): string {
  const clean = (value?: string) => (value || '').trim().replace(/\s+/g, ' ');
  const prefix = fitCardText(clean(parts.prefix), CARD_TEXT_LIMITS.prefix);
  const suffix = fitCardText(clean(parts.suffix), CARD_TEXT_LIMITS.suffix);
  const first = clean(parts.firstName);
  const middle = clean(parts.middleName);
  const last = clean(parts.lastName);
  const middleInitial = middle ? `${splitGraphemes(middle)[0]}.` : '';
  const join = (...values: string[]) => values.filter(Boolean).join(' ');

  const candidates = [
    join(prefix, first, middle, last, suffix),
    join(prefix, first, middleInitial, last, suffix),
    join(prefix, first, middleInitial, last),
    join(first, middleInitial, last),
    join(first, last),
  ];
  const fitting = candidates.find((candidate) => candidate.length > 0 && candidate.length <= maxLength);
  return fitting ?? fitCardText(candidates[candidates.length - 1] || candidates[0], maxLength);
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
