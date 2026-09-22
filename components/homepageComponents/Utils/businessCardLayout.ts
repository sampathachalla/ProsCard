const MIN_CARD_HEIGHT = 340;
const MAX_CARD_HEIGHT = 620;
const MULTI_CARD_SIDE_SPACE = 64;
const SINGLE_CARD_SIDE_SPACE = 40;

export function getBusinessCardWidth(
  viewportWidth: number,
  cardCount: number,
  availableHeight?: number,
) {
  const sideSpace = cardCount > 1 ? MULTI_CARD_SIDE_SPACE : SINGLE_CARD_SIDE_SPACE;
  const widthBasedOnViewport = Math.min(340, Math.max(270, viewportWidth - sideSpace));

  if (!availableHeight) return widthBasedOnViewport;

  const widthBasedOnHeight = Math.max(180, (availableHeight - 16) / 1.68);
  return Math.min(widthBasedOnViewport, widthBasedOnHeight);
}

export function getBusinessCardHeight(width: number, availableHeight?: number) {
  const widthBasedHeight = width * 1.68;

  if (!availableHeight) {
    return Math.min(MAX_CARD_HEIGHT, Math.max(MIN_CARD_HEIGHT, widthBasedHeight));
  }

  const verticalPadding = 16;
  const constrainedHeight = Math.max(0, availableHeight - verticalPadding);

  return Math.max(0, Math.min(MAX_CARD_HEIGHT, widthBasedHeight, constrainedHeight));
}

export function getCardShowcaseHeight(
  viewportWidth: number,
  availableHeight: number,
  cardCount: number,
) {
  const cardWidth = getBusinessCardWidth(viewportWidth, cardCount);
  return Math.min(availableHeight, getBusinessCardHeight(cardWidth, availableHeight) + 16);
}
