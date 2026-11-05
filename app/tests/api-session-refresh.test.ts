import { beforeEach, describe, expect, it, vi } from 'vitest';

const storage = new Map<string, string>();
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async (key: string) => storage.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => { storage.set(key, value); }),
    removeItem: vi.fn(async (key: string) => { storage.delete(key); }),
  },
}));
vi.mock('@/services/api/config', () => ({ requireApiUrl: () => 'https://api.test/api/v1' }));

const json = (status: number, body: unknown = {}) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json' },
});

/** The first call is the API rejecting an expired token; the second is the refresh attempt. */
async function requestWithExpiredToken(refreshStatus: number) {
  vi.resetModules();
  const { apiRequest } = await import('@/services/api/client');
  const { getSession, setSession } = await import('@/services/api/session');
  await setSession({ user: { id: 'u', username: 'u@test' }, token: 'old', refreshToken: 'r', emailConfirmationRequired: false });
  vi.stubGlobal('fetch', vi.fn()
    .mockResolvedValueOnce(json(401, { message: 'Expired' }))
    .mockResolvedValueOnce(json(refreshStatus, { message: 'Refresh failed' })));
  await expect(apiRequest('/cards')).rejects.toThrow('Expired');
  return getSession();
}

describe('refreshing an expired session', () => {
  beforeEach(() => { storage.clear(); });

  it('signs out when the refresh token is rejected', async () => {
    expect(await requestWithExpiredToken(401)).toBeNull();
  });

  it.each([429, 500, 502, 503])('keeps the user signed in through a temporary %i', async (status) => {
    expect((await requestWithExpiredToken(status))?.user.id).toBe('u');
  });
});
