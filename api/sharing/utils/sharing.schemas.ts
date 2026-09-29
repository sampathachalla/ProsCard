import{z}from'zod';export const createShareSchema=z.object({expiresAt:z.string().datetime().nullable().optional()});
