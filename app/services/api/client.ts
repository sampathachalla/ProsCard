import { requireApiUrl } from './config';
import { getSession, setSession } from './session';
import type { ApiErrorPayload, AuthSession } from './types';

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  authenticated?: boolean;
  retryAuth?: boolean;
  accessToken?: string;
  /** Milliseconds before the request is abandoned; defaults to DEFAULT_TIMEOUT_MS. */
  timeoutMs?: number;
};

/** Long enough for slow mobile networks, short enough that a dead connection never leaves a screen spinning. */
const DEFAULT_TIMEOUT_MS = 30_000;

export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly payload: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

let refreshPromise: Promise<AuthSession | null> | null = null;

/** Status used for requests that never reached the server (offline, timeout, server down). */
export const NETWORK_ERROR_STATUS = 0;

/**
 * fetch with a timeout. Connection failures and timeouts become an ApiError with a readable message
 * instead of the platform's raw text (e.g. "fetch failed: UnexpectedException ... Promise.swift").
 */
async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  // Still honour a caller's own cancellation.
  const callerSignal = init.signal;
  const forwardAbort = () => controller.abort();
  callerSignal?.addEventListener?.('abort', forwardAbort);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (callerSignal?.aborted) throw error;
    const message = timedOut
      ? 'The server took too long to respond. Check your connection and try again.'
      : 'Can’t reach the server. Check your internet connection and try again.';
    throw new ApiError(message, NETWORK_ERROR_STATUS, error);
  } finally {
    clearTimeout(timer);
    callerSignal?.removeEventListener?.('abort', forwardAbort);
  }
}

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const contentType = response.headers.get('content-type') ?? '';
  let text: string;
  try {
    text = await response.text();
  } catch (error) {
    // The connection dropped while the reply was arriving.
    throw new ApiError('The connection was interrupted. Check your internet connection and try again.', NETWORK_ERROR_STATUS, error);
  }
  if (!contentType.includes('application/json')) return text;
  try {
    return text ? JSON.parse(text) : undefined;
  } catch {
    // A proxy error page or a cut-off reply: keep the text so the error message can still be built.
    return text;
  }
}

async function refreshSession(): Promise<AuthSession | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const current = await getSession();
    if (!current?.refreshToken) return null;
    let response: Response;
    try {
      response = await fetchWithTimeout(`${requireApiUrl()}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: current.refreshToken }),
      });
    } catch {
      // Offline: keep the session so the user is not signed out by a dropped connection.
      return null;
    }
    if (!response.ok) {
      await setSession(null);
      return null;
    }
    const refreshed = await parseResponse(response);
    if (!refreshed || typeof refreshed !== 'object' || !(refreshed as AuthSession).user) return null;
    await setSession(refreshed as AuthSession);
    return refreshed as AuthSession;
  })().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, authenticated = true, retryAuth = true, accessToken, headers, timeoutMs, ...requestOptions } = options;
  const session = authenticated ? await getSession() : null;
  const response = await fetchWithTimeout(`${requireApiUrl()}${path}`, {
    ...requestOptions,
    headers: {
      Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(accessToken || session?.token ? { Authorization: `Bearer ${accessToken || session?.token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  }, timeoutMs);

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
