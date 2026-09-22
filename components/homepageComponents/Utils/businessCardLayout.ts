const MIN_CARD_HEIGHT = 520;
const MAX_CARD_HEIGHT = 620;
const PAGE_CHROME_HEIGHT = 300;

export function getBusinessCardHeight(width: number, viewportHeight?: number) {
  const widthBasedHeight = width * 1.68;

  if (!viewportHeight) {
    return Math.min(MAX_CARD_HEIGHT, Math.max(MIN_CARD_HEIGHT, widthBasedHeight));
  }

  const availableCardHeight = viewportHeight - PAGE_CHROME_HEIGHT;
  return Math.min(MAX_CARD_HEIGHT, Math.max(MIN_CARD_HEIGHT, availableCardHeight));
}
