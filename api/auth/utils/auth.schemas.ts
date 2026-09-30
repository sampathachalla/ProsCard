import { z } from 'zod';

export const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

export const forgotPasswordSchema = z.object({ email: z.string().trim().email() });
export const refreshSchema = z.object({ refreshToken: z.string().min(1) });
export const newPasswordSchema = z.object({ password: z.string().min(8).max(128) });
export const oauthRedirectSchema = z.object({
  redirectTo: z.string().trim().min(1).refine((value) => {
    try {
      return ['proscard:', 'exp:', 'exps:', 'http:', 'https:'].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, 'A valid app redirect URL is required.'),
});
