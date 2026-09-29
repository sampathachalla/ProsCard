import { AUTH_TEST_FIXTURES, AUTH_TEST_MODE } from '../Config/authMode';
import type { LoginCredentials, SignupCredentials, StoredUser } from '../types/auth.types';
import { apiRequest } from '@/services/api/client';
import { getSession, setSession } from '@/services/api/session';
import type { AuthSession } from '@/services/api/types';

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

export async function logout(): Promise<void> {
  const session = await getSession();
  try {
    if (!AUTH_TEST_MODE && session?.token) {
      await apiRequest('/auth/logout', { method: 'POST', retryAuth: false });
    }
  } finally {
    await setSession(null);
  }
}
