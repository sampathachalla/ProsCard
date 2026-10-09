import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '../../src/errors.js';
import { log } from '../../src/logger.js';

/** Map Supabase auth failures to stable client messages; keep vendor text in logs only. */
function authError(error: { status?: number; message?: string }, fallbackStatus: number, fallbackMessage: string) {
  log('warn', 'supabase_auth_error', {
    status: error.status,
    message: error.message,
  });
  const status = error.status && error.status >= 400 && error.status < 600 ? error.status : fallbackStatus;
  // Prefer our copy for common cases; never forward raw vendor strings that may include internals.
  if (status === 400 || status === 401 || status === 422) {
    return new HttpError(status === 422 ? 400 : status, fallbackMessage);
  }
  return new HttpError(status >= 500 ? 502 : status, fallbackMessage);
}

export class AuthRepository {
  constructor(private readonly supabase: SupabaseClient, private readonly resetRedirectUrl?: string) {}

  async signup(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({ email, password });
    if (error) throw authError(error, 400, 'Could not create the account. Check the email and password and try again.');
    if (!data.user) throw new HttpError(502, 'Sign-up did not return a user. Please try again.');
    return { user: data.user, session: data.session };
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw authError(error, 401, 'Invalid email or password.');
    if (!data.user) throw new HttpError(502, 'Sign-in did not return a user. Please try again.');
    if (!data.session) throw new HttpError(401, 'Invalid email or password.');
    return { user: data.user, session: data.session };
  }

  async googleOAuthUrl(redirectTo: string) {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) throw authError(error, 400, 'Could not start Google sign-in.');
    if (!data.url) throw new HttpError(502, 'Google sign-in is temporarily unavailable.');
    return data.url;
  }

  async requestPasswordReset(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(
      email,
      this.resetRedirectUrl ? { redirectTo: this.resetRedirectUrl } : undefined,
    );
    if (error) throw authError(error, 400, 'Could not start password reset.');
  }

  async refresh(refreshToken: string) {
    const { data, error } = await this.supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (error) throw authError(error, 401, 'Refresh token is invalid or expired.');
    if (!data.user || !data.session) throw new HttpError(401, 'Refresh token is invalid or expired.');
    return { user: data.user, session: data.session };
  }

  async logout(accessToken: string) {
    const { error } = await this.supabase.auth.admin.signOut(accessToken, 'global');
    if (error) throw authError(error, 401, 'Could not sign out.');
  }

  async updatePassword(userId: string, password: string) {
    const { error } = await this.supabase.auth.admin.updateUserById(userId, { password });
    if (error) throw authError(error, 400, 'Could not update the password.');
  }
}
