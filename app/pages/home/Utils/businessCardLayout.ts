const MIN_CARD_HEIGHT = 340;
const MAX_CARD_HEIGHT = 900;
const HOME_CARD_ASPECT_RATIO = 1.68;
// Homepage cards stretch taller than a conventional ratio so the preview can
// fill the showcase (no empty band above/below) while keeping sections readable.
const HOME_CARD_MAX_EXPANDED_ASPECT_RATIO = 2.6;
const MULTI_CARD_SIDE_SPACE = 28;
const SINGLE_CARD_SIDE_SPACE = 28;
/** Popl-style home preview: ~88% of screen width, ~1.6× height (width:height ≈ 1:1.6). */
export const HOME_PREVIEW_WIDTH_FRACTION = 0.88;
export const HOME_PREVIEW_ASPECT_RATIO = 1.6;
export const HOME_PREVIEW_MIN_WIDTH = 280;
export const HOME_PREVIEW_MAX_WIDTH = 372;
/** Small gap above/below the card inside the showcase. */
export const HOME_PREVIEW_VERTICAL_MARGIN = 12;

export type HomePreviewCardSize = {
  width: number;
  height: number;
};

/** Size for the home carousel preview card (Popl-style hero proportions, centered). */
export function getHomePreviewCardDimensions(
  viewportWidth: number,
  availableHeight: number,
  cardCount = 1,
): HomePreviewCardSize {
  let width =
    cardCount > 1
      ? Math.min(HOME_PREVIEW_MAX_WIDTH, Math.max(HOME_PREVIEW_MIN_WIDTH, viewportWidth - MULTI_CARD_SIDE_SPACE))
      : Math.round(
          Math.min(
            HOME_PREVIEW_MAX_WIDTH,
            Math.max(HOME_PREVIEW_MIN_WIDTH, viewportWidth * HOME_PREVIEW_WIDTH_FRACTION),
          ),
        );

  const maxHeight = Math.max(0, Math.min(availableHeight, MAX_CARD_HEIGHT) - HOME_PREVIEW_VERTICAL_MARGIN);
  let height = Math.round(Math.min(width * HOME_PREVIEW_ASPECT_RATIO, maxHeight));

  if (height < width * HOME_PREVIEW_ASPECT_RATIO) {
    width = Math.round(
      Math.max(HOME_PREVIEW_MIN_WIDTH, Math.min(width, height / HOME_PREVIEW_ASPECT_RATIO)),
    );
    height = Math.round(Math.min(width * HOME_PREVIEW_ASPECT_RATIO, maxHeight));
  }

  return { width, height };
}

export function getBusinessCardWidth(
  viewportWidth: number,
  cardCount: number,
  availableHeight?: number,
) {
  const sideSpace = cardCount > 1 ? MULTI_CARD_SIDE_SPACE : SINGLE_CARD_SIDE_SPACE;
  const widthBasedOnViewport = Math.min(372, Math.max(270, viewportWidth - sideSpace));

  if (!availableHeight) return widthBasedOnViewport;

  const widthBasedOnHeight = Math.max(180, availableHeight / HOME_CARD_ASPECT_RATIO);
  return Math.min(widthBasedOnViewport, widthBasedOnHeight);
}

export function getBusinessCardHeight(width: number, availableHeight?: number) {
  const widthBasedHeight = width * HOME_CARD_ASPECT_RATIO;

  if (!availableHeight) {
    return Math.min(MAX_CARD_HEIGHT, Math.max(MIN_CARD_HEIGHT, widthBasedHeight));
  }

  const constrainedHeight = Math.max(0, availableHeight);
  const expandedHeight = width * HOME_CARD_MAX_EXPANDED_ASPECT_RATIO;

  return Math.max(0, Math.min(MAX_CARD_HEIGHT, expandedHeight, constrainedHeight));
}

export function getCardShowcaseHeight(
  viewportWidth: number,
  availableHeight: number,
  cardCount: number,
) {
  const cardWidth = getBusinessCardWidth(viewportWidth, cardCount);
  return Math.min(availableHeight, getBusinessCardHeight(cardWidth, availableHeight) + 16);
}
