import { z } from 'zod';

export const cardSchema = z.object({
  category: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(200),
  title: z.string().trim().max(200).default(''),
  company: z.string().trim().max(200).default(''),
  phone: z.string().trim().max(100).default(''),
  email: z.union([z.literal(''), z.string().email()]).default(''),
  gradient: z.tuple([z.string(), z.string()]),
  sectionLayouts: z.record(z.string(), z.string()),
  sectionThemes: z.record(z.string(), z.unknown()),
  sectionOverrides: z.record(z.string(), z.string()),
  connectionFields: z.array(z.record(z.string(), z.unknown())),
  connectionFieldsCustomized: z.boolean(),
  cardTheme: z.record(z.string(), z.unknown()),
  customThemes: z.array(z.record(z.string(), z.unknown())).optional(),
});
export const cardPatchSchema = z
  .record(z.string(), z.unknown())
  .refine((value) => Object.keys(value).length > 0, 'At least one card field is required.')
  .pipe(cardSchema.partial());
