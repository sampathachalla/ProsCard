import { AUTH_TEST_FIXTURES, AUTH_TEST_MODE } from '../Config/authMode';
import type { LoginCredentials, SignupCredentials, StoredUser } from '../types/auth.types';
import { apiRequest } from '@/services/api/client';
import { getSession, setSession } from '@/services/api/session';
import type { AuthSession } from '@/services/api/types';
import { queryClient } from '@/services/api/queryClient';
import { clearCardState } from '@/components/cardsComponents/Services/cardsService';
import { clearMediaCache } from '@/components/profileComponents/Services/mediaCache';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

function toStoredUser(session: AuthSession): StoredUser {
  return {
    ...session.user,
    token: session.token,
    refreshToken: session.refreshToken,
    emailConfirmationRequired: session.emailConfirmationRequired,
  };
}

async function authenticate(endpoint: '/auth/login' | '/auth/signup', body: object): Promise<StoredUser> {
  const session = await apiRequest<AuthSession>(endpoint, {
    method: 'POST', authenticated: false, body,
  });
  await setSession(session);
  return toStoredUser(session);
}

async function mockAuthentication(email: string): Promise<StoredUser> {
  await new Promise((resolve) => setTimeout(resolve, 350));
  const session: AuthSession = {
    user: { ...AUTH_TEST_FIXTURES.user, username: email.trim() || AUTH_TEST_FIXTURES.user.username },
    token: 'local-test-token', refreshToken: 'local-test-refresh-token',
    emailConfirmationRequired: false,
  };
  await setSession(session);
  return toStoredUser(session);
}

export async function login(credentials: LoginCredentials): Promise<StoredUser> {
  return AUTH_TEST_MODE ? mockAuthentication(credentials.email) : authenticate('/auth/login', credentials);
}

export async function signup(credentials: SignupCredentials): Promise<StoredUser> {
  return AUTH_TEST_MODE
    ? mockAuthentication(credentials.email)
    : authenticate('/auth/signup', { email: credentials.email, password: credentials.password });
}

function oauthTokens(callbackUrl: string): { accessToken: string; refreshToken?: string } {
  const fragment = callbackUrl.includes('#') ? callbackUrl.slice(callbackUrl.indexOf('#') + 1) : '';
  const query = callbackUrl.includes('?') ? callbackUrl.slice(callbackUrl.indexOf('?') + 1).split('#')[0] : '';
  const parameters = new URLSearchParams(fragment || query);
  const error = parameters.get('error_description') || parameters.get('error');
  if (error) throw new Error(decodeURIComponent(error.replace(/\+/g, ' ')));
  const accessToken = parameters.get('access_token');
  if (!accessToken) throw new Error('Google sign-in completed without an access token. Please try again.');
  return { accessToken, refreshToken: parameters.get('refresh_token') ?? undefined };
}

export async function signInWithGoogle(): Promise<StoredUser | null> {
  if (AUTH_TEST_MODE) return mockAuthentication(AUTH_TEST_FIXTURES.user.username);
  const redirectTo = Linking.createURL('auth/callback');
  const { url } = await apiRequest<{ url: string }>('/auth/google', {
    method: 'POST', authenticated: false, body: { redirectTo },
  });
  const result = await WebBrowser.openAuthSessionAsync(url, redirectTo);
  if (result.type !== 'success' || !result.url) return null;
  const { accessToken, refreshToken } = oauthTokens(result.url);
  return establishRecoverySession(accessToken, refreshToken);
}

/** Completes Google sign-in from the redirect URL when the app lands on it directly. */
export async function completeGoogleRedirect(callbackUrl: string): Promise<StoredUser> {
  const { accessToken, refreshToken } = oauthTokens(callbackUrl);
  return establishRecoverySession(accessToken, refreshToken);
}

export async function requestPasswordReset(email: string): Promise<void> {
  if (AUTH_TEST_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    return;
  }
  await apiRequest('/auth/forgot-password', {
    method: 'POST', authenticated: false, body: { email: email.trim() },
  });
}

export async function resetPassword(password: string): Promise<void> {
  await apiRequest('/auth/reset-password', { method: 'POST', body: { password } });
}

export async function establishRecoverySession(accessToken: string, refreshToken?: string): Promise<StoredUser> {
  const response = await apiRequest<{ user: { id: string; username: string } }>('/auth/me', {
    method: 'GET', authenticated: false, accessToken,
  });
  const session: AuthSession = {
    user: response.user, token: accessToken, refreshToken, emailConfirmationRequired: false,
  };
  await setSession(session);
  return toStoredUser(session);
}

async function clearLocalSession(): Promise<void> {
  await setSession(null);
  await clearMediaCache();
  clearCardState();
  queryClient.clear();
}

export async function logout(): Promise<void> {
  const session = await getSession();
  try {
    if (!AUTH_TEST_MODE && session?.token) {
      await apiRequest('/auth/logout', { method: 'POST', retryAuth: false });
    }
  } finally {
    await clearLocalSession();
  }
}

/** Permanently deletes the account on the backend, then clears everything stored on this device. */
export async function deleteAccount(): Promise<void> {
  if (!AUTH_TEST_MODE) {
    await apiRequest('/account', { method: 'DELETE' });
  }
  await clearLocalSession();
}
