import { z } from 'zod';

export const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

const appRedirectUrl = z.string().trim().min(1).refine((value) => {
  try {
    return ['vcpros:', 'exp:', 'exps:', 'http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}, 'A valid app redirect URL is required.');

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
  redirectTo: appRedirectUrl.optional(),
});
export const recoveryCodeSchema = z.object({
  email: z.string().trim().email(),
  code: z.string().trim().regex(/^\d{6,8}$/, 'Enter the verification code from the email.'),
});
export const refreshSchema = z.object({ refreshToken: z.string().min(1) });
export const newPasswordSchema = z.object({ password: z.string().min(8).max(128) });
export const oauthRedirectSchema = z.object({
  redirectTo: appRedirectUrl,
});
