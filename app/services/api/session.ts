import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseStoredJson } from '@/utils/safeJson';
import type { AuthSession } from './types';

export const AUTH_SESSION_KEY = 'authSession';
const LEGACY_USER_KEY = 'userInfo';
const USER_SCOPED_CACHE_KEYS = ['userProfile', 'primaryCard', 'userCards', 'hasCompletedOnboarding'];

let memorySession: AuthSession | null | undefined;
const listeners = new Set<(session: AuthSession | null) => void>();

export async function getSession(): Promise<AuthSession | null> {
  if (memorySession !== undefined) return memorySession;
  const raw = await AsyncStorage.getItem(AUTH_SESSION_KEY);
  const session = parseStoredJson<AuthSession>(raw);
  // A corrupted session would fail every launch; drop it so the user just signs in again.
  const valid = session && typeof session === 'object' && session.user ? session : null;
  if (raw && !valid) {
    await AsyncStorage.removeItem(AUTH_SESSION_KEY).catch(() => undefined);
  }
  memorySession = valid;
  return memorySession;
}

export async function setSession(session: AuthSession | null): Promise<void> {
  const previousSession = memorySession;
  memorySession = session;
  if (session) {
    await Promise.all([
      AsyncStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session)),
      AsyncStorage.setItem('userInfo', JSON.stringify({ ...session.user, token: session.token })),
    ]);
  } else {
    const userId = previousSession?.user.id;
    const scopedKeys = userId ? USER_SCOPED_CACHE_KEYS.map((key) => `${key}:${userId}`) : [];
    await Promise.all([
      AsyncStorage.removeItem(AUTH_SESSION_KEY),
      AsyncStorage.removeItem(LEGACY_USER_KEY),
      ...USER_SCOPED_CACHE_KEYS.map((key) => AsyncStorage.removeItem(key)),
      ...scopedKeys.map((key) => AsyncStorage.removeItem(key)),
    ]);
  }
  listeners.forEach((listener) => listener(session));
}

export function subscribeSession(listener: (session: AuthSession | null) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
