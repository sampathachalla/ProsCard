import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_API_BASE_URL, AUTH_TEST_FIXTURES, AUTH_TEST_MODE } from '../Config/authMode';
import type { LoginCredentials, SignupCredentials, StoredUser } from '../types/auth.types';

type AuthEndpoint = '/auth/login' | '/auth/signup';

function requireBackendUrl(): string {
  if (!AUTH_API_BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_URL is required when authentication test mode is disabled.');
  }
  return AUTH_API_BASE_URL;
}

function normalizeBackendUser(payload: unknown): StoredUser {
  if (!payload || typeof payload !== 'object') {
    throw new Error('The authentication server returned an invalid response.');
  }

  const response = payload as Record<string, unknown>;
  const source = response.user && typeof response.user === 'object'
    ? response.user as Record<string, unknown>
    : response;
  const id = source.id;
  const username = source.username ?? source.email;
  const token = response.token ?? source.token;

  if ((typeof id !== 'string' && typeof id !== 'number') || typeof username !== 'string') {
    throw new Error('The authentication server response is missing the user identity.');
  }

  return {
    id: String(id),
    username,
    ...(typeof token === 'string' ? { token } : {}),
  };
}

async function requestBackend(endpoint: AuthEndpoint, body: LoginCredentials | SignupCredentials): Promise<StoredUser> {
  const response = await fetch(`${requireBackendUrl()}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = payload && typeof payload === 'object' && typeof (payload as Record<string, unknown>).message === 'string'
      ? String((payload as Record<string, unknown>).message)
      : 'Authentication failed. Please try again.';
    throw new Error(message);
  }

  const user = normalizeBackendUser(payload);
  await AsyncStorage.setItem('userInfo', JSON.stringify(user));
  return user;
}

async function mockAuthentication(email: string): Promise<StoredUser> {
  await new Promise((resolve) => setTimeout(resolve, 350));
  return {
    ...AUTH_TEST_FIXTURES.user,
    username: email.trim() || AUTH_TEST_FIXTURES.user.username,
  };
}

export async function login(credentials: LoginCredentials): Promise<StoredUser> {
  if (AUTH_TEST_MODE) return mockAuthentication(credentials.email);
  return requestBackend('/auth/login', credentials);
}

export async function signup(credentials: SignupCredentials): Promise<StoredUser> {
  if (AUTH_TEST_MODE) return mockAuthentication(credentials.email);
  return requestBackend('/auth/signup', {
    email: credentials.email,
    password: credentials.password,
  });
}

export async function requestPasswordReset(email: string): Promise<void> {
  const trimmed = email.trim();

  if (AUTH_TEST_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    return;
  }

  const response = await fetch(`${requireBackendUrl()}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: trimmed }),
  });

  if (!response.ok) throw new Error('Could not request a password reset. Please try again.');
}
