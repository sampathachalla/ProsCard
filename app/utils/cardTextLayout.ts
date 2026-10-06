export function getResponsiveTaglineLimit(viewportWidth: number): number {
  const usableWidth = Math.min(720, Math.max(260, viewportWidth - 48));
  return Math.min(120, Math.max(32, Math.floor((usableWidth - 32) / 7)));
}

export function fitTaglineToViewport(tagline: string, _viewportWidth?: number): string {
  const normalized = (tagline || '').trim();
  if (!_viewportWidth) return normalized;
  return normalized.slice(0, getResponsiveTaglineLimit(_viewportWidth)).trimEnd();
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
  return Math.min(100, Math.max(24, Math.floor(usableWidth / 9)));
}

export function fitAccreditationsToViewport(value: string, _viewportWidth?: number): string {
  return (value || '').trim();
}
