import {
  IDENTITY_SECTION_HEIGHT_RATIO,
  PROFESSIONAL_SECTION_HEIGHT_RATIO,
} from '../cardSectionLayout';
import type { CardSectionId } from '../types/card.types';

/** ISO/IEC 7810 ID-1 width ÷ height — same proportions as Apple Wallet passes. */
export const WALLET_PASS_WIDTH_TO_HEIGHT = 1.586;

/** @deprecated Use `WALLET_PASS_WIDTH_TO_HEIGHT`; height = width / ratio. */
export const WALLET_PASS_HEIGHT_RATIO = 1 / WALLET_PASS_WIDTH_TO_HEIGHT;

const MIN_PASS_WIDTH = 260;
const MAX_PASS_WIDTH = 380;

export const WALLET_SECTIONS: readonly [CardSectionId, CardSectionId] = [
  'identity',
  'professional',
];

export const WALLET_SECTION_HEIGHT_RATIOS = {
  identity: IDENTITY_SECTION_HEIGHT_RATIO,
  professional: PROFESSIONAL_SECTION_HEIGHT_RATIO,
};

export function getWalletCardDimensions(cardWidth: number) {
  const width = cardWidth;
  const height = width / WALLET_PASS_WIDTH_TO_HEIGHT;
  return { width, height };
}

export function getWalletSectionHeights(cardHeight: number) {
  return {
    identity: cardHeight * WALLET_SECTION_HEIGHT_RATIOS.identity,
    professional: cardHeight * WALLET_SECTION_HEIGHT_RATIOS.professional,
  };
}

/** Pick pass width so height fits the vertical budget at ID-1 aspect ratio. */
export function resolveWalletCardWidth(options: {
  windowWidth: number;
  availableHeight: number;
  maxWidth?: number;
  minWidth?: number;
  horizontalPadding?: number;
}) {
  const {
    windowWidth,
    availableHeight,
    maxWidth = MAX_PASS_WIDTH,
    minWidth = MIN_PASS_WIDTH,
    horizontalPadding = 40,
  } = options;

  const heightBudget = Math.max(0, availableHeight);
  const widthCap = windowWidth - horizontalPadding;
  const widthFromHeight =
    heightBudget > 0 ? heightBudget * WALLET_PASS_WIDTH_TO_HEIGHT : widthCap;

  let width = Math.min(maxWidth, widthCap, widthFromHeight);

  if (width < minWidth && widthFromHeight >= minWidth) {
    width = Math.min(maxWidth, widthCap, Math.max(minWidth, widthFromHeight));
  }

  if (heightBudget > 0 && width / WALLET_PASS_WIDTH_TO_HEIGHT > heightBudget) {
    width = Math.max(MIN_PASS_WIDTH, heightBudget * WALLET_PASS_WIDTH_TO_HEIGHT);
  }

  return width;
}
