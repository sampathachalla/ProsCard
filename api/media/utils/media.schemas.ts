import path from 'node:path';
import { z } from 'zod';

export const mediaRequestSchema = z.object({
  kind: z.enum(['profilePhoto', 'coverPhoto', 'companyLogo']),
  scope: z.enum(['profile', 'card']).default('profile'),
  cardId: z.string().uuid().optional(),
  fileName: z.string().trim().min(1).max(255).transform((value) => path.basename(value)),
  contentType: z.string().regex(/^(image|application)\/[a-z0-9.+-]+$/i),
  sizeBytes: z.number().int().positive().max(20 * 1024 * 1024).optional(),
}).superRefine((value, context) => {
  if (value.scope === 'card' && !value.cardId) {
    context.addIssue({ code: 'custom', path: ['cardId'], message: 'cardId is required for card media.' });
  }
  if (value.scope === 'profile' && value.cardId) {
    context.addIssue({ code: 'custom', path: ['cardId'], message: 'cardId is only valid for card media.' });
  }
});
