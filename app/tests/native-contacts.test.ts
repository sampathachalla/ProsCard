import { describe, expect, it, vi } from 'vitest';
import { Platform } from 'react-native';

vi.mock('expo-contacts', () => ({
  Contact: {
    presentCreateForm: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock('expo-contacts/legacy', () => ({
  ContactTypes: { Person: 'person' },
  presentFormAsync: vi.fn().mockResolvedValue(true),
}));

vi.mock('expo-file-system', () => {
  class File {
    uri: string;
    constructor(...parts: ({ uri: string } | string)[]) {
      this.uri = parts.map((p) => (typeof p === 'string' ? p : p.uri)).join('/');
    }
    async write() {}
  }
  return { File, Paths: { cache: { uri: 'file:///cache' } } };
});

vi.mock('expo-sharing', () => ({
  isAvailableAsync: vi.fn().mockResolvedValue(true),
  shareAsync: vi.fn().mockResolvedValue(undefined),
}));

import { Contact } from 'expo-contacts';
import * as LegacyContacts from 'expo-contacts/legacy';
import { saveDirectlyToNativeContacts } from '../utils/nativeContacts';

describe('saveDirectlyToNativeContacts', () => {
  it('directly opens Contact.presentCreateForm with prefilled record on iOS/Android without asking for contact access permissions', async () => {
    const originalOs = Platform.OS;
    Platform.OS = 'ios';

    const success = await saveDirectlyToNativeContacts({
      name: 'Joshua Isaacs',
      title: 'Plumbing & Mechanical Inspector',
      company: 'Howard County Government',
      phone: '410-313-1846',
      email: 'joisaacs@howardcountymd.gov',
      address: '7125 Riverwood Drive, Suite D2, Columbia, Maryland 21046',
    });

    expect(Contact.presentCreateForm).toHaveBeenCalledWith(
      expect.objectContaining({
        givenName: 'Joshua',
        familyName: 'Isaacs',
        jobTitle: 'Plumbing & Mechanical Inspector',
        company: 'Howard County Government',
        phones: [{ label: 'work', number: '410-313-1846' }],
        emails: [{ label: 'work', address: 'joisaacs@howardcountymd.gov' }],
      })
    );
    expect(success).toBe(true);

    Platform.OS = originalOs;
  });

  it('uses the legacy new-contact form when Expo Go cannot provide the modern native form', async () => {
    const originalOs = Platform.OS;
    Platform.OS = 'ios';
    vi.mocked(Contact.presentCreateForm).mockRejectedValueOnce(new Error('Native method unavailable'));

    const success = await saveDirectlyToNativeContacts({
      name: 'Joshua Isaacs',
      phone: '410-313-1846',
      email: 'joisaacs@howardcountymd.gov',
    });

    expect(LegacyContacts.presentFormAsync).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        firstName: 'Joshua',
        lastName: 'Isaacs',
        phoneNumbers: [{ label: 'work', number: '410-313-1846' }],
      }),
      { isNew: true },
    );
    expect(success).toBe(true);

    Platform.OS = originalOs;
  });
});
