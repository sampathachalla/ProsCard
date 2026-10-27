import { describe, expect, it } from 'vitest';
import type { Contact } from '@/pages/contacts/types/contact.types';
import {
  buildContactsCsv,
  buildFilterSummary,
  resolveExportContacts,
} from '@/pages/contacts/Utils/contactExport';

const contact = (overrides: Partial<Contact>): Contact => ({
  id: '1',
  name: 'Alex',
  title: 'CEO',
  company: 'Acme',
  phone: '+1 555',
  initials: 'A',
  color: '#000',
  ...overrides,
});

describe('contact export', () => {
  it('escapes csv cells with commas and quotes', () => {
    const csv = buildContactsCsv([
      contact({ name: 'Pat "Pro"', company: 'Mind, Pros', eventName: 'Expo 2026' }),
    ]);
    expect(csv).toContain('"Pat ""Pro"""');
    expect(csv).toContain('"Mind, Pros"');
    expect(csv).toContain('Expo 2026');
  });

  it('resolves export scopes', () => {
    const all = [
      contact({ id: '1' }),
      contact({ id: '2', name: 'Bob' }),
      contact({ id: '3', name: 'Cara' }),
    ];
    const filtered = [all[0]!, all[2]!];
    const selected = new Set(['2']);
    expect(resolveExportContacts('filtered', { all, filtered, selectedIds: selected })).toHaveLength(2);
    expect(resolveExportContacts('all', { all, filtered, selectedIds: selected })).toHaveLength(3);
    expect(resolveExportContacts('selected', { all, filtered, selectedIds: selected }).map((c) => c.name)).toEqual([
      'Bob',
    ]);
  });

  it('summarizes active filters for export header', () => {
    const summary = buildFilterSummary({
      query: 'saas',
      eventName: 'Demo Day',
      source: 'badges',
      recent: '7d',
      filtersActive: true,
    });
    expect(summary).toContain('Demo Day');
    expect(summary).toContain('saas');
  });
});
