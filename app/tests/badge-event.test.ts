import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Contact } from '@/pages/contacts/types/contact.types';

const values = new Map<string, string>();
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async (key: string) => values.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => { values.set(key, value); }),
    removeItem: vi.fn(async (key: string) => { values.delete(key); }),
  },
}));

async function load(userId = 'user-1') {
  values.set('authSession', JSON.stringify({ user: { id: userId, username: 'u@example.com' }, token: 't' }));
  vi.resetModules();
  return import('@/pages/contacts/Services/eventNamesService');
}

describe('current badge event', () => {
  beforeEach(() => values.clear());

  it('selects the event used in the last 8 hours, for the signed-in account only', async () => {
    const events = await load('user-1');
    const now = Date.UTC(2026, 9, 29, 9);
    await events.setCurrentEvent('  SaaStr Annual 2026 ', now);
    expect(await events.loadCurrentEvent(now + 7 * 60 * 60 * 1000)).toEqual({ name: 'SaaStr Annual 2026', lastUsedAt: now });

    const other = await load('user-2');
    expect(await other.loadCurrentEvent(now)).toBeNull();
  });

  it('asks again once 8 hours pass without using the event', async () => {
    const events = await load();
    const now = Date.UTC(2026, 9, 29, 9);
    await events.setCurrentEvent('Web Summit', now);
    expect(await events.loadCurrentEvent(now + 8 * 60 * 60 * 1000 + 1)).toBeNull();
  });

  it('scanning into the event restarts the 8 hours', async () => {
    const events = await load();
    const morning = Date.UTC(2026, 9, 29, 9);
    await events.setCurrentEvent('Web Summit', morning);
    await events.setCurrentEvent('Web Summit', morning + 6 * 60 * 60 * 1000);
    expect(await events.loadCurrentEvent(morning + 12 * 60 * 60 * 1000)).toMatchObject({ name: 'Web Summit' });
  });

  it('lists previous events newest first', async () => {
    const events = await load();
    await events.setCurrentEvent('Web Summit');
    await events.setCurrentEvent('Local Meetup');
    expect(await events.loadRecentEventNames()).toEqual(['Local Meetup', 'Web Summit']);
  });

  it('reads the recent list older builds kept for the whole device', async () => {
    values.set('proscard.recentEventNames', JSON.stringify(['Old Expo']));
    const events = await load();
    values.set('proscard.recentEventNames', JSON.stringify(['Old Expo']));
    expect(await events.loadRecentEventNames()).toEqual(['Old Expo']);
  });

  it('suggests recents first, then contact events, without duplicates', async () => {
    const events = await load();
    const contacts = [{ eventName: 'Alpha Conf' }, { eventName: 'web summit' }] as Contact[];
    expect(events.mergeEventNameSuggestions(contacts, ['Web Summit', 'Zeta Expo'])).toEqual([
      'Web Summit', 'Zeta Expo', 'Alpha Conf',
    ]);
  });
});
