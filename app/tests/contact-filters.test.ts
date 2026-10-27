import { describe, expect, it } from 'vitest';
import type { Contact } from '@/pages/contacts/types/contact.types';
import {
  filterContacts,
  isBadgeContact,
  isBusinessCardContact,
  matchesRecentFilter,
  matchesSearchQuery,
} from '@/pages/contacts/Utils/contactFilters';

const base = (overrides: Partial<Contact>): Contact => ({
  id: '1',
  name: 'Alex',
  title: '',
  company: 'Acme',
  phone: '',
  initials: 'A',
  color: '#000',
  ...overrides,
});

describe('contact filters', () => {
  it('classifies badge and card contacts', () => {
    expect(isBadgeContact(base({ captureKind: 'badge', eventName: 'Demo Day' }))).toBe(true);
    expect(isBusinessCardContact(base({ captureKind: 'business_card', cardImageUrl: 'img' }))).toBe(true);
    expect(isBusinessCardContact(base({ sourceCardId: '00000000-0000-4000-8000-000000000001' }))).toBe(true);
  });

  it('filters recent contacts by createdAt', () => {
    const recent = base({ createdAt: new Date().toISOString() });
    const old = base({ id: '2', createdAt: '2020-01-01T00:00:00.000Z' });
    expect(matchesRecentFilter(recent, '7d')).toBe(true);
    expect(matchesRecentFilter(old, '7d')).toBe(false);
  });

  it('searches event names', () => {
    const contact = base({ eventName: 'SaaStr 2026' });
    expect(matchesSearchQuery(contact, 'saastr')).toBe(true);
    expect(matchesSearchQuery(contact, 'missing')).toBe(false);
  });

  it('combines badge source filter and event filter', () => {
    const list = [
      base({ id: '1', name: 'Zoe', captureKind: 'badge', eventName: 'Expo A' }),
      base({ id: '2', name: 'Amy', captureKind: 'badge', eventName: 'Expo B' }),
      base({ id: '3', name: 'Ben', captureKind: 'business_card', cardImageUrl: 'img' }),
    ];
    const badges = filterContacts(list, {
      query: '',
      sort: 'name',
      source: 'badges',
      recent: 'all',
      eventName: 'Expo A',
    });
    expect(badges.map((c) => c.name)).toEqual(['Zoe']);
  });
});
