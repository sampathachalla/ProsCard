/**
 * Authentication runtime switch.
 *
 * Keep this enabled during UI development. Test mode pre-fills the auth forms,
 * returns a local mock user, and never calls or writes to the backend.
 *
 * For backend integration, set this to false. No form or hook changes are
 * required; the auth service will use the production API adapter instead.
 */
export const AUTH_TEST_MODE = process.env.EXPO_PUBLIC_AUTH_TEST_MODE === 'true';

export const AUTH_TEST_FIXTURES = {
  login: {
    email: 'test@proscard.app',
    password: 'ProsCard123!',
  },
  signup: {
    email: 'new.user@proscard.app',
    password: 'ProsCard123!',
    confirmPassword: 'ProsCard123!',
  },
  user: {
    id: 'test-user-001',
    username: 'test@proscard.app',
  },
} as const;

export function getLoginInitialFields() {
  return AUTH_TEST_MODE
    ? { ...AUTH_TEST_FIXTURES.login }
    : { email: '', password: '' };
}

export function getSignupInitialFields() {
  return AUTH_TEST_MODE
    ? { ...AUTH_TEST_FIXTURES.signup }
    : { email: '', password: '', confirmPassword: '' };
}
