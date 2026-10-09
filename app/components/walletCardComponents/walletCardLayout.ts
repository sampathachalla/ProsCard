/**
 * Digital Wallet Pass layout and dimension resolution utilities.
 * Conforms to traditional ISO/IEC 7810 ID-1 wallet / credit card proportions (1.586 : 1).
 *
 * Identity gets a larger share than the full-card 25% band so layout differences
 * (classic / minimal / bold / …) stay visible at wallet size.
 */

export const WALLET_PASS_WIDTH_TO_HEIGHT = 1.586;
/** ~42% identity / ~58% professional — enough room for identity layout structure. */
export const WALLET_IDENTITY_HEIGHT_RATIO = 0.42;
export const WALLET_PROFESSIONAL_HEIGHT_RATIO = 1 - WALLET_IDENTITY_HEIGHT_RATIO;

export const MIN_PASS_WIDTH = 270;
export const MAX_PASS_WIDTH = 370;

export function resolveWalletCardWidth(options: {
  windowWidth: number;
  availableHeight?: number;
  maxWidth?: number;
  minWidth?: number;
  sideSpace?: number;
}): number {
  const {
    windowWidth,
    availableHeight,
    maxWidth = MAX_PASS_WIDTH,
    minWidth = MIN_PASS_WIDTH,
    sideSpace = 36,
  } = options;

  const widthCap = windowWidth - sideSpace;
  const widthByHeight = availableHeight && availableHeight > 0
    ? availableHeight * WALLET_PASS_WIDTH_TO_HEIGHT
    : widthCap;

  return Math.min(maxWidth, Math.max(minWidth, Math.min(widthCap, widthByHeight)));
}

export function getWalletCardDimensions(width: number, availableHeight?: number) {
  const heightCalculated = Math.round(width / WALLET_PASS_WIDTH_TO_HEIGHT);
  const height = availableHeight && availableHeight > 0
    ? Math.min(availableHeight, heightCalculated)
    : heightCalculated;

  const identityHeight = Math.round(height * WALLET_IDENTITY_HEIGHT_RATIO);
  const professionalHeight = height - identityHeight;

  return {
    width,
    height,
    identityHeight,
    professionalHeight,
  };
}
