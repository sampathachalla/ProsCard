import { AUTH_TEST_FIXTURES, AUTH_TEST_MODE } from '../Config/authMode';
import type { LoginCredentials, SignupCredentials, StoredUser } from '../types/auth.types';
import { apiRequest } from '@/services/api/client';
import { clearUserCache, getSession, setSession } from '@/services/api/session';
import type { AuthSession } from '@/services/api/types';
import { queryClient, queryKeys } from '@/services/api/queryClient';
import { clearCardState } from '@/pages/cards/Services/cardsService';
import { clearMediaCache } from '@/pages/profile/Services/mediaCache';
import { setHasCompletedOnboarding } from '@/pages/onboarding/Services/onboardingService';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_OAUTH_CALLBACK = 'vcpros://auth/callback';

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

/** Test login represents an existing user, so it must always bypass onboarding. */
async function startTestLogin(email: string): Promise<StoredUser> {
  const user = await mockAuthentication(email);
  await setHasCompletedOnboarding();
  return user;
}

export async function login(credentials: LoginCredentials): Promise<StoredUser> {
  return AUTH_TEST_MODE ? startTestLogin(credentials.email) : authenticate('/auth/login', credentials);
}

/**
 * Test mode only: signs in the local test user as a brand-new account. Whatever earlier test runs saved
 * on this device for that user is cleared first, so onboarding opens empty at step 1 every time.
 */
async function startTestSignup(email: string): Promise<StoredUser> {
  await clearUserCache(AUTH_TEST_FIXTURES.user.id);
  clearCardState();
  queryClient.clear();
  const user = await mockAuthentication(email);
  // A test sign-up always represents a new account, even when the fixture user was used before.
  // Keep the route guard from reusing a previously completed onboarding result.
  await clearUserCache(user.id);
  queryClient.setQueryData(queryKeys.onboarding, false);
  return user;
}

export async function signup(credentials: SignupCredentials): Promise<StoredUser> {
  if (AUTH_TEST_MODE) return startTestSignup(credentials.email);
  return authenticate('/auth/signup', { email: credentials.email, password: credentials.password });
}

/** URLSearchParams has already decoded once; a stray "%" in the message must not throw a URIError. */
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function oauthTokens(callbackUrl: string): { accessToken: string; refreshToken?: string } {
  const fragment = callbackUrl.includes('#') ? callbackUrl.slice(callbackUrl.indexOf('#') + 1) : '';
  const query = callbackUrl.includes('?') ? callbackUrl.slice(callbackUrl.indexOf('?') + 1).split('#')[0] : '';
  const parameters = new URLSearchParams(fragment || query);
  const error = parameters.get('error_description') || parameters.get('error');
  if (error) throw new Error(safeDecode(error.replace(/\+/g, ' ')));
  const accessToken = parameters.get('access_token');
  if (!accessToken) throw new Error('Google sign-in completed without an access token. Please try again.');
  return { accessToken, refreshToken: parameters.get('refresh_token') ?? undefined };
}

/** Keep OAuth independent of the selected API host (local, tunnel, or OCI).
 * OAuth needs the stable scheme owned by the installed VC Pros app. Expo Go's exp:// URL is
 * session-specific and is not supported for local OAuth/OIDC callbacks.
 */
function googleRedirectUrl(): string {
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    throw new Error(
      'Google login and signup require the VC Pros development build. Run `npm run ios`, then open VC Pros instead of Expo Go.',
    );
  }
  // Keep this exact value in Supabase Authentication > URL Configuration. Building it through
  // Linking can produce a localhost/dev-client URL in some development environments, which sends
  // the browser to a server that does not exist on the phone after Google completes authentication.
  return GOOGLE_OAUTH_CALLBACK;
}

export async function signInWithGoogle(action: 'login' | 'signup' = 'login'): Promise<StoredUser | null> {
  if (AUTH_TEST_MODE) {
    // Google sign-up starts a fresh test account like email sign-up; Google login keeps the existing one.
    return action === 'signup'
      ? startTestSignup(AUTH_TEST_FIXTURES.user.username)
      : startTestLogin(AUTH_TEST_FIXTURES.user.username);
  }
  const redirectTo = googleRedirectUrl();
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
  const redirectTo = Linking.createURL('auth/reset-password');
  await apiRequest('/auth/forgot-password', {
    method: 'POST', authenticated: false, body: { email: email.trim(), redirectTo },
  });
}

export async function verifyPasswordResetCode(email: string, code: string): Promise<StoredUser> {
  const session = await apiRequest<AuthSession>('/auth/verify-recovery-code', {
    method: 'POST',
    authenticated: false,
    body: { email: email.trim(), code: code.trim() },
  });
  await setSession(session);
  return toStoredUser(session);
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

/** Signs out on this device. Each step is independent, so one failing cleanup never leaves the user half signed in. */
async function clearLocalSession(): Promise<void> {
  await setSession(null).catch((error) => console.warn('Could not clear the stored session:', error));
  await clearMediaCache().catch((error) => console.warn('Could not clear the media cache:', error));
  try {
    clearCardState();
    queryClient.clear();
  } catch (error) {
    console.warn('Could not reset in-memory app state:', error);
  }
}

export async function logout(): Promise<void> {
  try {
    const session = await getSession();
    if (!AUTH_TEST_MODE && session?.token) {
      await apiRequest('/auth/logout', { method: 'POST', retryAuth: false });
    }
  } catch (error) {
    // Offline or server error: the server session simply expires on its own. Logging out on this
    // device must still succeed, otherwise the user is stuck on a screen with no session.
    console.warn('Server logout failed; signing out locally:', error);
  }
  await clearLocalSession();
}

/** Permanently deletes the account on the backend, then clears everything stored on this device. */
export async function deleteAccount(): Promise<void> {
  if (!AUTH_TEST_MODE) {
    await apiRequest('/account', { method: 'DELETE' });
  }
  await clearLocalSession();
}
