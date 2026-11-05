import { z } from 'zod';

const cardFields = {
  displayName: z.string().trim().max(100).optional(),
  displayNameCustomized: z.boolean().optional(),
  category: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(200),
  title: z.string().trim().max(200),
  company: z.string().trim().max(200),
  phone: z.string().trim().max(100),
  email: z.union([z.literal(''), z.string().email()]),
  gradient: z.tuple([z.string(), z.string()]),
  sectionLayouts: z.record(z.string(), z.string()),
  sectionThemes: z.record(z.string(), z.unknown()),
  sectionOverrides: z.record(z.string(), z.string()),
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
