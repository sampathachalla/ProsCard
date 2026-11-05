import { z } from 'zod';
import { CARD_TEXT_LIMITS } from '../../shared/card-text-limits.js';

const overrideLimits: Record<string, number> = {
  displayName: CARD_TEXT_LIMITS.displayName,
  preferredName: CARD_TEXT_LIMITS.professionalName,
  name: CARD_TEXT_LIMITS.professionalName,
  firstName: CARD_TEXT_LIMITS.namePart,
  middleName: CARD_TEXT_LIMITS.namePart,
  lastName: CARD_TEXT_LIMITS.namePart,
  title: CARD_TEXT_LIMITS.title,
  company: CARD_TEXT_LIMITS.company,
  accreditations: CARD_TEXT_LIMITS.accreditations,
  tagline: CARD_TEXT_LIMITS.tagline,
  bio: CARD_TEXT_LIMITS.bio,
};

const sectionOverridesSchema = z.record(z.string(), z.string()).superRefine((overrides, context) => {
  for (const [key, limit] of Object.entries(overrideLimits)) {
    const value = overrides[key];
    if (value && value.trim().length > limit) {
      context.addIssue({
        code: 'too_big',
        maximum: limit,
        origin: 'string',
        inclusive: true,
        path: [key],
        message: `${key} must be ${limit} characters or less.`,
      });
    }
  }
});

const cardFields = {
  displayName: z.string().trim().max(CARD_TEXT_LIMITS.displayName).optional(),
  displayNameCustomized: z.boolean().optional(),
  category: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(CARD_TEXT_LIMITS.professionalName),
  title: z.string().trim().max(CARD_TEXT_LIMITS.title),
  company: z.string().trim().max(CARD_TEXT_LIMITS.company),
  phone: z.string().trim().max(100),
  email: z.union([z.literal(''), z.string().email()]),
  gradient: z.tuple([z.string(), z.string()]),
  sectionLayouts: z.record(z.string(), z.string()),
  sectionThemes: z.record(z.string(), z.unknown()),
  sectionOverrides: sectionOverridesSchema,
  connectionFields: z.array(z.record(z.string(), z.unknown())),
  connectionFieldsCustomized: z.boolean(),
  cardTheme: z.record(z.string(), z.unknown()),
  customThemes: z.array(z.record(z.string(), z.unknown())).optional(),
  appliedTheme: z.record(z.string(), z.unknown()).nullable().optional(),
};

export const cardSchema = z.object({
  ...cardFields,
  title: cardFields.title.default(''),
  company: cardFields.company.default(''),
  phone: cardFields.phone.default(''),
  email: cardFields.email.default(''),
});
// Built from the fields without defaults: zod 4 applies a default even inside .optional(), so a partial
// update would otherwise blank every field it did not send when merged over the saved card.
export const cardPatchSchema = z
  .record(z.string(), z.unknown())
  .refine((value) => Object.keys(value).length > 0, 'At least one card field is required.')
  .pipe(z.object(cardFields).partial());
