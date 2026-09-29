import { z } from 'zod';

export const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

export const forgotPasswordSchema = z.object({ email: z.string().trim().email() });
export const refreshSchema = z.object({ refreshToken: z.string().min(1) });
export const newPasswordSchema = z.object({ password: z.string().min(8).max(128) });
