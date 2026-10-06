/** Section 1 (identity) height as a fraction of the card or viewport. */
export const IDENTITY_SECTION_HEIGHT_RATIO = 0.3;

/** Section 2 height in the scrollable full-card and edit views. */
export const PROFESSIONAL_FULL_CARD_SECTION_HEIGHT_RATIO = 0.25;

/** Fixed proportions for the four-section preview shown on the homepage. */
export const HOMEPAGE_CARD_SECTION_HEIGHT_RATIOS = {
  identity: 0.3,
  professional: 0.25,
  bio: 0.18,
  connections: 0.27,
} as const;

/** Wallet shows only Sections 1 and 2, so Section 2 fills the remaining pass height there. */
export const PROFESSIONAL_SECTION_HEIGHT_RATIO = 1 - IDENTITY_SECTION_HEIGHT_RATIO;

export function identitySectionHeight(viewportHeight: number) {
  return Math.round(viewportHeight * IDENTITY_SECTION_HEIGHT_RATIO);
}

export function professionalSectionHeight(viewportHeight: number) {
  return Math.round(viewportHeight * PROFESSIONAL_FULL_CARD_SECTION_HEIGHT_RATIO);
}
