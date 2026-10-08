const MIN_CARD_HEIGHT = 340;
const MAX_CARD_HEIGHT = 680;
const HOME_CARD_ASPECT_RATIO = 1.68;
const HOME_CARD_MAX_EXPANDED_ASPECT_RATIO = 2;
const MULTI_CARD_SIDE_SPACE = 28;
const SINGLE_CARD_SIDE_SPACE = 28;

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
