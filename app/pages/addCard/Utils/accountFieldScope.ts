import type { Profile } from '@/pages/profile/types/profile.types';
import type { BusinessCard } from '@/pages/cards/types/card.types';
import type { AddCardImageField, AddCardTextFieldId } from '../types/addCard.types';
import { splitName } from './addCardName';

export type AccountScopedCardField = AddCardTextFieldId | 'bio' | AddCardImageField;

/** Mirrors a card-detail edit into the matching account default. */
export function applyCardFieldToProfile(
  profile: Profile,
  field: AccountScopedCardField,
  value: string,
): Profile {
  switch (field) {
    case 'name':
      return { ...profile, preferredName: value };
    case 'company':
      return { ...profile, organization: value };
    case 'bio':
      return { ...profile, shortBio: value };
    case 'tagline':
      return { ...profile, tagline: value };
    case 'accreditations':
      return { ...profile, accreditations: value };
    case 'title':
      return { ...profile, title: value };
    case 'coverPhoto':
      return { ...profile, coverPhotoUrl: value };
    case 'profilePhoto':
      return { ...profile, photoUrl: value };
    case 'logo':
      return { ...profile, companyLogoUrl: value };
  }
}

/** Applies an account-scoped value to an existing card so all of the user's cards stay in sync. */
export function applyAccountFieldToCard(
  card: BusinessCard,
  field: AccountScopedCardField,
  value: string,
): BusinessCard {
  switch (field) {
    case 'name':
      return {
        ...card,
        name: value,
        sectionOverrides: {
          ...card.sectionOverrides,
          preferredName: value,
          ...splitName(value),
        },
      };
    case 'title':
      return { ...card, title: value, sectionOverrides: { ...card.sectionOverrides, title: value } };
    case 'company':
      return { ...card, company: value, sectionOverrides: { ...card.sectionOverrides, company: value } };
    case 'accreditations':
    case 'tagline':
    case 'bio':
      return { ...card, sectionOverrides: { ...card.sectionOverrides, [field]: value } };
    case 'coverPhoto':
    case 'profilePhoto':
    case 'logo':
      return { ...card, sectionOverrides: { ...card.sectionOverrides, [field]: value } };
  }
}
