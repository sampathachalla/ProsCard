import { requireApiUrl } from './config';
import { getSession, setSession } from './session';
import type { ApiErrorPayload, AuthSession } from './types';

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  authenticated?: boolean;
  retryAuth?: boolean;
};

export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly payload: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

let refreshPromise: Promise<AuthSession | null> | null = null;

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) return response.text();
  return response.json();
}

async function refreshSession(): Promise<AuthSession | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const current = await getSession();
    if (!current?.refreshToken) return null;
    const response = await fetch(`${requireApiUrl()}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: current.refreshToken }),
    });
    if (!response.ok) {
      await setSession(null);
      return null;
    }
    const refreshed = await response.json() as AuthSession;
    await setSession(refreshed);
    return refreshed;
  })().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, authenticated = true, retryAuth = true, headers, ...requestOptions } = options;
  const session = authenticated ? await getSession() : null;
  const response = await fetch(`${requireApiUrl()}${path}`, {
    ...requestOptions,
    headers: {
      Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 401 && authenticated && retryAuth && await refreshSession()) {
    return apiRequest<T>(path, { ...options, retryAuth: false });
  }

  const payload = await parseResponse(response);
  if (!response.ok) {
    const message = payload && typeof payload === 'object'
      ? (payload as ApiErrorPayload).message
      : undefined;
    throw new ApiError(message || `Request failed (${response.status}).`, response.status, payload);
  }
  return payload as T;
}
