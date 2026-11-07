/**
 * Server-side copy of the card-safe text budgets used by the mobile app.
 * The API cannot import app source at runtime, so keep these values aligned
 * with app/utils/cardTextLayout.ts.
 */
export const CARD_TEXT_LIMITS = {
  displayName: 48,
  professionalName: 32,
  namePart: 24,
  title: 32,
  company: 32,
  accreditations: 24,
  tagline: 48,
  bio: 180,
  prefix: 12,
  suffix: 12,
  cardTag: 24,
} as const;

export const CONTACT_TEXT_LIMITS = {
  name: 48,
  title: 32,
  company: 32,
  eventName: 48,
  phone: 32,
  email: 80,
  website: 96,
  address: 120,
  notes: 500,
} as const;

