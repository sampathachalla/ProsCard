import { AUTH_TEST_FIXTURES, AUTH_TEST_MODE } from '../Config/authMode';
import type { LoginCredentials, SignupCredentials, StoredUser } from '../types/auth.types';
import { apiRequest } from '@/services/api/client';
import { getSession, setSession } from '@/services/api/session';
import type { AuthSession } from '@/services/api/types';
import { queryClient } from '@/services/api/queryClient';
import { clearCardState } from '@/components/cardsComponents/Services/cardsService';

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
