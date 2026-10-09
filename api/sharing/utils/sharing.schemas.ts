import { z } from 'zod';

export const createShareSchema = z.object({
  expiresAt: z
    .string()
    .datetime()
    .nullable()
    .optional()
    .refine(
      (value) => value == null || new Date(value).getTime() > Date.now(),
      'Share expiry must be a future date and time.',
    ),
});
