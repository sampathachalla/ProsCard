export type CardSectionSpacing = {
  gap: number;
  horizontal: number;
  tightVertical: number;
  vertical: number;
};

/** Responsive 8-point spacing scale shared by card sections.
 * Compact phones keep enough breathing room without sacrificing content;
 * tablets and wide previews gain space gradually rather than using fixed gaps.
 */
export function getCardSectionSpacing(
  viewportWidth: number,
): CardSectionSpacing {
  if (viewportWidth <= 360) {
    return { gap: 6, horizontal: 12, tightVertical: 6, vertical: 8 };
  }

  if (viewportWidth < 768) {
    return { gap: 8, horizontal: 16, tightVertical: 8, vertical: 10 };
  }

  return { gap: 12, horizontal: 20, tightVertical: 10, vertical: 12 };
}
