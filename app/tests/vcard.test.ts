import { describe, expect, it, vi } from 'vitest';

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

import { buildVCard } from '../utils/vcard';

describe('buildVCard', () => {
  it('builds standard vCard with all core fields', () => {
    const vcard = buildVCard({
      name: 'Sampath Achalla',
      firstName: 'Sampath',
      lastName: 'Achalla',
      title: 'Forward Deployed Engineer',
      company: 'MindPros',
      department: 'Engineering',
      email: 'sampath@mind-pros.com',
      phone: '3128437250',
      website: 'https://mind-pros.com',
      address: 'Baltimore, Maryland',
      note: 'Leading AI and system tools',
      socials: [
        { label: 'LinkedIn', type: 'linkedin', url: 'https://linkedin.com/in/sampath' },
        { label: 'GitHub', type: 'github', url: 'https://github.com/sampath' },
      ],
    });

    expect(vcard).toContain('BEGIN:VCARD');
    expect(vcard).toContain('VERSION:3.0');
    expect(vcard).toContain('FN:Sampath Achalla');
    expect(vcard).toContain('N:Achalla;Sampath;;;');
    expect(vcard).toContain('ORG:MindPros;Engineering');
    expect(vcard).toContain('TITLE:Forward Deployed Engineer');
    expect(vcard).toContain('EMAIL;TYPE=INTERNET,WORK:sampath@mind-pros.com');
    expect(vcard).toContain('TEL;TYPE=CELL,VOICE:3128437250');
    expect(vcard).toContain('URL:https://mind-pros.com');
    expect(vcard).toContain('ADR;TYPE=WORK:;;Baltimore, Maryland;;;;');
    expect(vcard).toContain('X-SOCIALPROFILE;type=linkedin:https://linkedin.com/in/sampath');
    expect(vcard).toContain('X-SOCIALPROFILE;type=github:https://github.com/sampath');
    expect(vcard).toContain('NOTE:Leading AI and system tools\\n--- Links ---\\nLinkedIn: https://linkedin.com/in/sampath\\nGitHub: https://github.com/sampath');
    expect(vcard).toContain('END:VCARD');
  });

  it('embeds photoBase64 if provided', () => {
    const vcard = buildVCard({
      name: 'John Doe',
      photoBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    });

    expect(vcard).toContain('PHOTO;ENCODING=b;TYPE=JPEG:iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
  });

  it('falls back gracefully when optional fields are omitted', () => {
    const vcard = buildVCard({
      name: 'Jane Doe',
    });

    expect(vcard).toContain('BEGIN:VCARD');
    expect(vcard).toContain('FN:Jane Doe');
    expect(vcard).toContain('N:Doe;Jane;;;');
    expect(vcard).toContain('END:VCARD');
    expect(vcard).not.toContain('ORG:');
    expect(vcard).not.toContain('PHOTO;');
  });
});
