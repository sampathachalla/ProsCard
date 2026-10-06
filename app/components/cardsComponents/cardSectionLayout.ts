/** Section 1 (identity) height as a fraction of the card or viewport. */
export const IDENTITY_SECTION_HEIGHT_RATIO = 0.3;

export const PROFESSIONAL_SECTION_HEIGHT_RATIO = 1 - IDENTITY_SECTION_HEIGHT_RATIO;

export function identitySectionHeight(viewportHeight: number) {
  return Math.round(viewportHeight * IDENTITY_SECTION_HEIGHT_RATIO);
}

export function professionalSectionHeight(viewportHeight: number) {
  return Math.round(viewportHeight * PROFESSIONAL_SECTION_HEIGHT_RATIO);
}
