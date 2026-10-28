import { describe, expect, it } from 'vitest';
import { buildAddCardDraftFromCard } from '@/pages/addCard/Utils/addCardDraft';
import { createCardDetailTemplate } from '@/pages/cards/Templates/cardDetailTemplate';
import { CARD_THEME_PRESETS, type BusinessCard } from '@/pages/cards/types/card.types';
import type { Profile } from '@/pages/profile/types/profile.types';

const profile: Profile = {
  prefix: '', firstName: 'Account', middleName: '', lastName: 'Person', suffix: '',
  preferredName: 'Account Person', accreditations: 'PMP', fullName: 'Account Person',
  title: 'Account Title', department: '', organization: 'Account Company',
  companyLogoUrl: '', coverPhotoUrl: '', email: 'account@example.com', phone: '5551234567',
  photoUrl: '', website: '', social: { linkedin: '', x: '', instagram: '', facebook: '', whatsapp: '', youtube: '', tiktok: '' },
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

describe('account and card field precedence', () => {
  it('uses account details when card-level values are blank', () => {
    const input = card();
    expect(professionalValue(input, 'title')).toBe('Account Title');
    expect(professionalValue(input, 'company')).toBe('Account Company');
    expect(professionalValue(input, 'tagline')).toBe('Account tagline');
    expect(professionalValue(input, 'bio')).toBe('Account biography');

    const draft = buildAddCardDraftFromCard(input, profile);
    expect(draft.title).toBe('Account Title');
    expect(draft.company).toBe('Account Company');
    expect(draft.sectionOverrides.tagline).toBe('Account tagline');
    expect(draft.sectionOverrides.bio).toBe('Account biography');
  });

  it('keeps card-level details ahead of account defaults', () => {
    const input = card({
      title: 'Card Title',
      company: 'Card Company',
      sectionOverrides: { cardTag: 'Personal', tagline: 'Card tagline', bio: 'Card biography' },
    });
    expect(professionalValue(input, 'title')).toBe('Card Title');
    expect(professionalValue(input, 'company')).toBe('Card Company');
    expect(professionalValue(input, 'tagline')).toBe('Card tagline');
    expect(professionalValue(input, 'bio')).toBe('Card biography');
  });
});
