import path from 'node:path';
import { z } from 'zod';

export const mediaRequestSchema = z.object({
  kind: z.enum(['profilePhoto', 'coverPhoto', 'companyLogo']),
  fileName: z.string().trim().min(1).max(255).transform((value) => path.basename(value)),
  contentType: z.string().regex(/^(image|application)\/[a-z0-9.+-]+$/i),
  sizeBytes: z.number().int().positive().max(20 * 1024 * 1024).optional(),
});
