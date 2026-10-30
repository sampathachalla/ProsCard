import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSession } from '@/services/api/session';
import type { Contact } from '../types/contact.types';

const RECENT_STORAGE_KEY = 'proscard.recentEventNames';
const CURRENT_STORAGE_KEY = 'proscard.currentBadgeEvent';
const MAX_RECENT = 12;
/** An event used within this window is selected automatically; after it, badge mode asks again. */
export const CURRENT_EVENT_TTL_MS = 8 * 60 * 60 * 1000;

/** The event badge scans are saved under, and when it was last chosen or scanned into. */
export type CurrentEvent = { name: string; lastUsedAt: number };

/** Event names are per account, so a second account on the same phone starts clean. */
async function scopedKey(key: string) {
  const session = await getSession();
  return session?.user.id ? `${key}:${session.user.id}` : key;
}

export function collectEventNamesFromContacts(contacts: Contact[]): string[] {
  const names = new Set<string>();
  for (const contact of contacts) {
    const name = contact.eventName?.trim();
    if (name) names.add(name);
  }
  return [...names].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

function parseNames(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  } catch {
    return [];
  }
}

/** Most recent first. Falls back to the list older builds kept for the whole device. */
export async function loadRecentEventNames(): Promise<string[]> {
  try {
    const scoped = parseNames(await AsyncStorage.getItem(await scopedKey(RECENT_STORAGE_KEY)));
    return scoped.length ? scoped : parseNames(await AsyncStorage.getItem(RECENT_STORAGE_KEY));
  } catch {
    return [];
  }
}

export async function rememberEventName(name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) return;
  const recent = await loadRecentEventNames();
  const next = [trimmed, ...recent.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_RECENT);
  await AsyncStorage.setItem(await scopedKey(RECENT_STORAGE_KEY), JSON.stringify(next));
}

/** The event used in the last 8 hours, or null when badge mode should ask for one. */
export async function loadCurrentEvent(now = Date.now()): Promise<CurrentEvent | null> {
  try {
    const raw = await AsyncStorage.getItem(await scopedKey(CURRENT_STORAGE_KEY));
    const parsed = raw ? (JSON.parse(raw) as Partial<CurrentEvent>) : null;
    const name = typeof parsed?.name === 'string' ? parsed.name.trim() : '';
    const lastUsedAt = typeof parsed?.lastUsedAt === 'number' ? parsed.lastUsedAt : 0;
    if (!name || !isCurrentEventFresh({ name, lastUsedAt }, now)) return null;
    return { name, lastUsedAt };
  } catch {
    return null;
  }
}

/** Makes `name` the current event (chosen, or just scanned into) and adds it to the recent list. */
export async function setCurrentEvent(name: string, now = Date.now()): Promise<CurrentEvent | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;
  await rememberEventName(trimmed);
  const event: CurrentEvent = { name: trimmed, lastUsedAt: now };
  await AsyncStorage.setItem(await scopedKey(CURRENT_STORAGE_KEY), JSON.stringify(event));
  return event;
}

export function isCurrentEventFresh(event: CurrentEvent, now = Date.now()) {
  return now - event.lastUsedAt <= CURRENT_EVENT_TTL_MS;
}

/** Recents first (newest first), then events already on contacts, without case-insensitive duplicates. */
export function mergeEventNameSuggestions(contacts: Contact[], recent: string[]): string[] {
  const merged: string[] = [];
  const seen = new Set<string>();
  for (const name of [...recent, ...collectEventNamesFromContacts(contacts)]) {
    const trimmed = name.trim();
    const key = trimmed.toLowerCase();
    if (!trimmed || seen.has(key)) continue;
    seen.add(key);
    merged.push(trimmed);
  }
  return merged;
}
