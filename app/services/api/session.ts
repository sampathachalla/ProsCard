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
  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(AUTH_SESSION_KEY);
  } catch (error) {
    // Storage unavailable: act signed out for now, but don't cache it so the next call reads again.
    console.warn('Could not read the stored session:', error);
    return null;
  }
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
  // The in-memory session is already right for this run, so a failed write is only logged: at worst
  // the user signs in again after a restart, instead of a sign-in or sign-out failing outright.
  if (session) {
    await Promise.all([
      AsyncStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session)),
      AsyncStorage.setItem('userInfo', JSON.stringify({ ...session.user, token: session.token })),
    ]).catch((error) => console.warn('Could not store the session:', error));
  } else {
    const userId = previousSession?.user.id;
    const scopedKeys = userId ? USER_SCOPED_CACHE_KEYS.map((key) => `${key}:${userId}`) : [];
    await Promise.all([
      AsyncStorage.removeItem(AUTH_SESSION_KEY),
      AsyncStorage.removeItem(LEGACY_USER_KEY),
      ...USER_SCOPED_CACHE_KEYS.map((key) => AsyncStorage.removeItem(key)),
      ...scopedKeys.map((key) => AsyncStorage.removeItem(key)),
    ]).catch((error) => console.warn('Could not clear stored session data:', error));
  }
  // One failing listener must not stop the rest from hearing about the change.
  listeners.forEach((listener) => {
    try {
      listener(session);
    } catch (error) {
      console.warn('A session listener failed:', error);
    }
  });
}

export function subscribeSession(listener: (session: AuthSession | null) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
