import { describe, expect, it } from 'vitest';
import { buildAddCardDraftFromCard } from '@/pages/addCard/Utils/addCardDraft';
import { createCardDetailTemplate } from '@/pages/cards/Templates/cardDetailTemplate';
import { CARD_THEME_PRESETS, type BusinessCard } from '@/pages/cards/types/card.types';
import type { Profile } from '@/pages/profile/types/profile.types';
import { resolveCardDisplayMedia } from '@/pages/cards/Utils/resolveCardDisplayMedia';

const profile: Profile = {
  prefix: '', firstName: 'Account', middleName: '', lastName: 'Person', suffix: '',
  preferredName: 'Account Person', accreditations: 'PMP', fullName: 'Account Person',
  title: 'Account Title', department: '', organization: 'Account Company',
  companyLogoUrl: 'https://example.com/account-logo.png', coverPhotoUrl: 'https://example.com/account-cover.png', email: 'account@example.com', phone: '5551234567',
  photoUrl: 'https://example.com/account-photo.png', website: '', social: { linkedin: '', x: '', instagram: '', facebook: '', whatsapp: '', youtube: '', tiktok: '' },
  tagline: 'Account tagline', businessAddress: '', shortBio: 'Account biography',
};

function card(overrides: Partial<BusinessCard> = {}): BusinessCard {
  const theme = { ...CARD_THEME_PRESETS.navy, gradient: [...CARD_THEME_PRESETS.navy.gradient] as [string, string], fontStyle: 'modern' as const };
  return {
    id: 'card-1', name: 'Card Person', title: '', company: '', phone: '', email: '',
    gradient: [...theme.gradient], category: 'business', isPrimary: false, createdAt: '', updatedAt: '',
    sectionLayouts: { identity: 'layout-1', professional: 'layout-1', connections: 'compact' },
    sectionThemes: { identity: theme, professional: theme, connections: theme },
    sectionOverrides: { cardTag: 'Business', title: '', company: '', tagline: '', bio: '' },
    connectionFields: [], connectionFieldsCustomized: false, cardTheme: theme,
    ...overrides,
  };
}

function professionalValue(input: BusinessCard, id: string): string {
  return createCardDetailTemplate(input, profile)
    .find((section) => section.id === 'professional')
    ?.fields.find((field) => field.id === id)?.value ?? '';
}

function identityValue(input: BusinessCard, id: string): string {
  return createCardDetailTemplate(input, profile)
    .find((section) => section.id === 'identity')
    ?.fields.find((field) => field.id === id)?.value ?? '';
}

describe('account and card field precedence', () => {
  it('resolves inherited media before logo-adapted presentation reads the card', () => {
    const resolved = resolveCardDisplayMedia(card(), profile);

    expect(resolved.sectionOverrides.profilePhoto).toBe(profile.photoUrl);
    expect(resolved.sectionOverrides.coverPhoto).toBe(profile.coverPhotoUrl);
    expect(resolved.sectionOverrides.logo).toBe(profile.companyLogoUrl);
  });

  it('does not let account media replace a card-level image', () => {
    const resolved = resolveCardDisplayMedia(card({
      sectionOverrides: {
        profilePhoto: 'https://example.com/card-photo.png',
        logo: 'https://example.com/card-logo.png',
      },
    }), profile);

    expect(resolved.sectionOverrides.profilePhoto).toBe('https://example.com/card-photo.png');
    expect(resolved.sectionOverrides.coverPhoto).toBe(profile.coverPhotoUrl);
    expect(resolved.sectionOverrides.logo).toBe('https://example.com/card-logo.png');
  });

  it('keeps the persisted contrast background beside the logo', () => {
    const identity = createCardDetailTemplate(card({
      sectionOverrides: { logo: 'https://example.com/logo.svg', logoBackdrop: '#ffffff' },
    }), profile).find((section) => section.id === 'identity');

    expect(identity?.fields.find((field) => field.id === 'logoBackdrop')?.value).toBe('#ffffff');
  });

  it('uses account details when card-level values are blank', () => {
    const input = card();
    expect(professionalValue(input, 'title')).toBe('Account Title');
    expect(professionalValue(input, 'company')).toBe('Account Company');
    expect(professionalValue(input, 'tagline')).toBe('Account tagline');
    expect(professionalValue(input, 'bio')).toBe('Account biography');
    expect(identityValue(input, 'coverPhoto')).toBe('https://example.com/account-cover.png');
    expect(identityValue(input, 'profilePhoto')).toBe('https://example.com/account-photo.png');
    expect(identityValue(input, 'logo')).toBe('https://example.com/account-logo.png');

    const draft = buildAddCardDraftFromCard(input, profile);
    expect(draft.title).toBe('Account Title');
    expect(draft.company).toBe('Account Company');
    expect(draft.sectionOverrides.tagline).toBe('Account tagline');
    expect(draft.sectionOverrides.bio).toBe('Account biography');
    expect(draft.sectionOverrides.coverPhoto).toBeUndefined();
    expect(draft.sectionOverrides.profilePhoto).toBeUndefined();
    expect(draft.sectionOverrides.logo).toBeUndefined();
  });

  it('keeps card-level details ahead of account defaults', () => {
    const input = card({
      title: 'Card Title',
      company: 'Card Company',
      sectionOverrides: {
        cardTag: 'Personal',
        tagline: 'Card tagline',
        bio: 'Card biography',
        coverPhoto: 'https://example.com/card-cover.png',
        profilePhoto: 'https://example.com/card-photo.png',
        logo: 'https://example.com/card-logo.png',
      },
    });
    expect(professionalValue(input, 'title')).toBe('Card Title');
    expect(professionalValue(input, 'company')).toBe('Card Company');
    expect(professionalValue(input, 'tagline')).toBe('Card tagline');
    expect(professionalValue(input, 'bio')).toBe('Card biography');
    expect(identityValue(input, 'coverPhoto')).toBe('https://example.com/card-cover.png');
    expect(identityValue(input, 'profilePhoto')).toBe('https://example.com/card-photo.png');
    expect(identityValue(input, 'logo')).toBe('https://example.com/card-logo.png');

    const draft = buildAddCardDraftFromCard(input, profile);
    expect(draft.sectionOverrides.coverPhoto).toBe('https://example.com/card-cover.png');
    expect(draft.sectionOverrides.profilePhoto).toBe('https://example.com/card-photo.png');
    expect(draft.sectionOverrides.logo).toBe('https://example.com/card-logo.png');
  });
});
