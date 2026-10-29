import type { BusinessCard } from '@/pages/cards/types/card.types';
import type { Profile } from '@/pages/profile/types/profile.types';

function cardValue(value: string | undefined, fallback: string | undefined): string {
  return value?.trim() || fallback?.trim() || '';
}

/**
 * Resolves media for presentation without persisting account defaults onto the card.
 * Card media always wins; otherwise each image independently inherits from the account.
 */
export function resolveCardDisplayMedia(card: BusinessCard, profile: Profile): BusinessCard {
  return {
    ...card,
    sectionOverrides: {
      ...card.sectionOverrides,
      coverPhoto: cardValue(card.sectionOverrides.coverPhoto, profile.coverPhotoUrl),
      profilePhoto: cardValue(card.sectionOverrides.profilePhoto, profile.photoUrl),
      logo: cardValue(card.sectionOverrides.logo, profile.companyLogoUrl),
    },
  };
}
