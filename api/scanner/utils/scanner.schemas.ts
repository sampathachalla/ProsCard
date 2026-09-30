import { z } from 'zod';

/** ~6 MB of image data once decoded; the app downsizes photos well below this before sending. */
const MAX_BASE64_LENGTH = 8 * 1024 * 1024;

export const readCardRequestSchema = z.object({
  image: z.string().min(1).max(MAX_BASE64_LENGTH).regex(/^[A-Za-z0-9+/=\s]+$/, 'image must be base64 encoded.'),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']).default('image/jpeg'),
});

const text = z.string().trim().max(500).catch('');

export const cardBoundsSchema = z.object({
  x: z.number(), y: z.number(), width: z.number(), height: z.number(),
});

/** Shape the model must return; `.catch` keeps a partially wrong answer usable instead of failing. */
export const cardReadingSchema = z.object({
  isBusinessCard: z.boolean().catch(false),
  cardBounds: cardBoundsSchema.nullable().catch(null),
  /** Clockwise degrees to make the text upright. 0 and 180 are reliable; sideways (90/270) guesses often are not. */
  rotation: z.union([z.literal(0), z.literal(90), z.literal(180), z.literal(270)]).catch(0),
  contact: z.object({
    name: text, title: text, company: text, phone: text, email: text, website: text, address: text, notes: text,
  }),
});

export type ReadCardRequest = z.infer<typeof readCardRequestSchema>;
export type CardBounds = z.infer<typeof cardBoundsSchema>;
export type CardReading = z.infer<typeof cardReadingSchema>;
