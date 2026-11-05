import { describe, expect, it } from 'vitest';
import type { Profile } from '@/pages/profile/types/profile.types';
import { applyAccountFieldToCard, applyCardFieldToProfile } from '@/pages/addCard/Utils/accountFieldScope';
import type { BusinessCard } from '@/pages/cards/types/card.types';

const profile = {
  preferredName: '',
  title: '',
  organization: '',
  accreditations: '',
  tagline: '',
  shortBio: '',
  coverPhotoUrl: '',
  photoUrl: '',
  companyLogoUrl: '',
} as Profile;

describe('card detail account scope', () => {
  it.each([
    ['name', 'preferredName'],
    ['title', 'title'],
    ['company', 'organization'],
    ['accreditations', 'accreditations'],
    ['tagline', 'tagline'],
    ['bio', 'shortBio'],
    ['coverPhoto', 'coverPhotoUrl'],
    ['profilePhoto', 'photoUrl'],
    ['logo', 'companyLogoUrl'],
  ] as const)('maps %s to the account %s field', (cardField, profileField) => {
    const updated = applyCardFieldToProfile(profile, cardField, 'Updated value');
    expect(updated[profileField]).toBe('Updated value');
  });

  it('does not mutate the existing profile', () => {
    const updated = applyCardFieldToProfile(profile, 'company', 'MindPros');
    expect(updated).not.toBe(profile);
    expect(profile.organization).toBe('');
  });

  it('can persist a selected logo and its company name as one account update', () => {
    const updated = [
      { field: 'logo' as const, value: 'simple-icons:google' },
      { field: 'company' as const, value: 'Google' },
    ].reduce(
      (current, change) => applyCardFieldToProfile(current, change.field, change.value),
      profile,
    );

    expect(updated.companyLogoUrl).toBe('simple-icons:google');
    expect(updated.organization).toBe('Google');
  });

  it.each([
    ['accreditations', 'MBA, PMP'],
    ['tagline', 'Building trusted products'],
    ['bio', 'Product leader and mentor'],
    ['company', 'MindPros'],
    ['title', 'Director'],
    ['logo', 'simple-icons:google'],
  ] as const)('applies account-scoped %s changes to every card payload', (field, value) => {
    const card = {
      name: 'Sampath',
      title: 'Engineer',
      company: 'Old Company',
      sectionOverrides: {},
    } as BusinessCard;

    const updated = applyAccountFieldToCard(card, field, value);

    if (field === 'title' || field === 'company') expect(updated[field]).toBe(value);
    expect(updated.sectionOverrides[field]).toBe(value);
    expect(card.sectionOverrides[field]).toBeUndefined();
  });
});
