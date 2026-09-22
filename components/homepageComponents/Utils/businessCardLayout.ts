const MIN_CARD_HEIGHT = 520;
const MAX_CARD_HEIGHT = 620;
const PAGE_CHROME_HEIGHT = 300;
const MULTI_CARD_SIDE_SPACE = 64;
const SINGLE_CARD_SIDE_SPACE = 40;

export function getBusinessCardWidth(viewportWidth: number, cardCount: number) {
  const sideSpace = cardCount > 1 ? MULTI_CARD_SIDE_SPACE : SINGLE_CARD_SIDE_SPACE;
  return Math.min(340, Math.max(270, viewportWidth - sideSpace));
}

export function getBusinessCardHeight(width: number, viewportHeight?: number) {
  const widthBasedHeight = width * 1.68;

  if (!viewportHeight) {
    return Math.min(MAX_CARD_HEIGHT, Math.max(MIN_CARD_HEIGHT, widthBasedHeight));
  }

  const availableCardHeight = viewportHeight - PAGE_CHROME_HEIGHT;
  return Math.min(MAX_CARD_HEIGHT, Math.max(MIN_CARD_HEIGHT, availableCardHeight));
}

export function getCardShowcaseHeight(
  viewportWidth: number,
  viewportHeight: number,
  cardCount: number,
) {
  const cardWidth = getBusinessCardWidth(viewportWidth, cardCount);
  return getBusinessCardHeight(cardWidth, viewportHeight) + 16;
}
