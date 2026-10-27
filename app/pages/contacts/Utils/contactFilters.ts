import type { Contact, ContactCaptureKind } from '../types/contact.types';

export type ContactSortId = 'newest' | 'oldest' | 'name' | 'company';
export type ContactSourceFilter = 'all' | 'cards' | 'badges' | 'manual';
export type ContactRecentFilter = 'all' | '7d' | '30d';

export const CONTACT_SORT_OPTIONS: { id: ContactSortId; label: string }[] = [
  { id: 'newest', label: 'Newest first' },
  { id: 'oldest', label: 'Oldest first' },
  { id: 'name', label: 'Name (A–Z)' },
  { id: 'company', label: 'Company (A–Z)' },
];

/** Normalizes capture kind for contacts saved before badge scanning existed. */
export function resolveCaptureKind(contact: Contact): ContactCaptureKind {
  if (contact.captureKind) return contact.captureKind;
  if (contact.sourceCardId) return 'qr';
  if (contact.eventName?.trim()) return 'badge';
  if (contact.cardImageUrl?.trim()) return 'business_card';
  return 'manual';
}

export function isBadgeContact(contact: Contact): boolean {
  return resolveCaptureKind(contact) === 'badge';
}

export function isBusinessCardContact(contact: Contact): boolean {
  const kind = resolveCaptureKind(contact);
  return kind === 'business_card' || kind === 'qr';
}

/** @deprecated Use isBusinessCardContact; kept for tests. */
export function isScannedContact(contact: Contact): boolean {
  return Boolean(contact.cardImageUrl?.trim());
}

function contactCreatedMs(contact: Contact): number {
  if (!contact.createdAt) return 0;
  const ms = Date.parse(contact.createdAt);
  return Number.isFinite(ms) ? ms : 0;
}

export function matchesRecentFilter(contact: Contact, recent: ContactRecentFilter): boolean {
  if (recent === 'all') return true;
  const created = contactCreatedMs(contact);
  if (!created) return false;
  const days = recent === '7d' ? 7 : 30;
  return Date.now() - created <= days * 86_400_000;
}

export function matchesSourceFilter(contact: Contact, source: ContactSourceFilter): boolean {
  if (source === 'all') return true;
  if (source === 'badges') return isBadgeContact(contact);
  if (source === 'cards') return isBusinessCardContact(contact);
  return resolveCaptureKind(contact) === 'manual';
}

export function matchesEventFilter(contact: Contact, eventName: string): boolean {
  const filter = eventName.trim().toLowerCase();
  if (!filter) return true;
  return (contact.eventName ?? '').trim().toLowerCase() === filter;
}

export function matchesSearchQuery(contact: Contact, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    contact.name.toLowerCase().includes(q) ||
    contact.company.toLowerCase().includes(q) ||
    contact.title.toLowerCase().includes(q) ||
    (contact.email ?? '').toLowerCase().includes(q) ||
    (contact.phone ?? '').toLowerCase().includes(q) ||
    (contact.eventName ?? '').toLowerCase().includes(q) ||
    (contact.notes ?? '').toLowerCase().includes(q)
  );
}

export function sortContacts(contacts: Contact[], sort: ContactSortId): Contact[] {
  const list = [...contacts];
  switch (sort) {
    case 'oldest':
      return list.sort((a, b) => contactCreatedMs(a) - contactCreatedMs(b) || a.name.localeCompare(b.name));
    case 'name':
      return list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    case 'company':
      return list.sort(
        (a, b) =>
          a.company.localeCompare(b.company, undefined, { sensitivity: 'base' }) ||
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
      );
    case 'newest':
    default:
      return list.sort((a, b) => contactCreatedMs(b) - contactCreatedMs(a) || a.name.localeCompare(b.name));
  }
}

export function filterContacts(
  contacts: Contact[],
  options: {
    query: string;
    sort: ContactSortId;
    source: ContactSourceFilter;
    recent: ContactRecentFilter;
    eventName?: string;
  },
): Contact[] {
  const filtered = contacts.filter(
    (contact) =>
      matchesSearchQuery(contact, options.query) &&
      matchesSourceFilter(contact, options.source) &&
      matchesRecentFilter(contact, options.recent) &&
      matchesEventFilter(contact, options.eventName ?? ''),
  );
  return sortContacts(filtered, options.sort);
}

export function hasActiveContactFilters(options: {
  query: string;
  sort: ContactSortId;
  source: ContactSourceFilter;
  recent: ContactRecentFilter;
  eventName?: string;
}): boolean {
  return (
    options.query.trim().length > 0 ||
    options.sort !== 'newest' ||
    options.source !== 'all' ||
    options.recent !== 'all' ||
    Boolean(options.eventName?.trim())
  );
}
