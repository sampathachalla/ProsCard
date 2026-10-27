import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Contact } from '../types/contact.types';

const STORAGE_KEY = 'proscard.recentEventNames';
const MAX_RECENT = 12;

export function collectEventNamesFromContacts(contacts: Contact[]): string[] {
  const names = new Set<string>();
  for (const contact of contacts) {
    const name = contact.eventName?.trim();
    if (name) names.add(name);
  }
  return [...names].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

export async function loadRecentEventNames(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  } catch {
    return [];
  }
}

export async function rememberEventName(name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) return;
  const recent = await loadRecentEventNames();
  const next = [trimmed, ...recent.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_RECENT);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function mergeEventNameSuggestions(contacts: Contact[], recent: string[]): string[] {
  const merged = new Set<string>();
  for (const name of recent) merged.add(name.trim());
  for (const name of collectEventNamesFromContacts(contacts)) merged.add(name);
  return [...merged].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}
