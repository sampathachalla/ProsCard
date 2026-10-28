import type { Profile } from '@/pages/profile/types/profile.types';
import type { AddCardTextFieldId } from '../types/addCard.types';

export type AccountScopedCardField = AddCardTextFieldId | 'bio';

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
  }
}
