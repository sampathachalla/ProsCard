import { describe, expect, it } from 'vitest';
import type { Profile } from '@/pages/profile/types/profile.types';
import { applyCardFieldToProfile } from '@/pages/addCard/Utils/accountFieldScope';

const profile = {
  preferredName: '',
  title: '',
  organization: '',
  accreditations: '',
  tagline: '',
  shortBio: '',
} as Profile;

describe('card detail account scope', () => {
  it.each([
    ['name', 'preferredName'],
    ['title', 'title'],
    ['company', 'organization'],
    ['accreditations', 'accreditations'],
    ['tagline', 'tagline'],
    ['bio', 'shortBio'],
  ] as const)('maps %s to the account %s field', (cardField, profileField) => {
    const updated = applyCardFieldToProfile(profile, cardField, 'Updated value');
    expect(updated[profileField]).toBe('Updated value');
  });

  it('does not mutate the existing profile', () => {
    const updated = applyCardFieldToProfile(profile, 'company', 'MindPros');
    expect(updated).not.toBe(profile);
    expect(profile.organization).toBe('');
  });
});
