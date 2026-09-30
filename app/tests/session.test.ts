import { beforeEach, describe, expect, it, vi } from 'vitest';

const values = new Map<string, string>();
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async (key: string) => values.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => { values.set(key, value); }),
    removeItem: vi.fn(async (key: string) => { values.delete(key); }),
  },
}));

describe('authenticated session storage', () => {
  beforeEach(() => values.clear());

  it('persists the API session and legacy user view', async () => {
    vi.resetModules();
    const { AUTH_SESSION_KEY, getSession, setSession } = await import('@/services/api/session');
    const session = { user: { id: 'user-1', username: 'user@example.com' }, token: 'access', refreshToken: 'refresh', emailConfirmationRequired: false };
    await setSession(session);
    expect(await getSession()).toEqual(session);
    expect(values.has(AUTH_SESSION_KEY)).toBe(true);
    expect(JSON.parse(values.get('userInfo')!)).toMatchObject({ id: 'user-1', token: 'access' });
  });

  it('clears both generic and user-scoped caches on logout', async () => {
    vi.resetModules();
    const { setSession } = await import('@/services/api/session');
    await setSession({ user: { id: 'user-2', username: 'user@example.com' }, token: 'access', emailConfirmationRequired: false });
    values.set('userCards:user-2', '[]'); values.set('userProfile:user-2', '{}');
    await setSession(null);
    expect(values.has('userCards:user-2')).toBe(false);
    expect(values.has('userProfile:user-2')).toBe(false);
    expect(values.has('authSession')).toBe(false);
  });
});
