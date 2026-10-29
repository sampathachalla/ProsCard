import { createCardDetailTemplate } from '@/pages/cards/Templates/cardDetailTemplate';
import type { BusinessCard } from '@/pages/cards/types/card.types';
import type { Profile } from '@/pages/profile/types/profile.types';
import { splitName } from './addCardName';

/** Hydrates blank card fields from the account profile without replacing card-level values. */
export function buildAddCardDraftFromCard(card: BusinessCard, profile: Profile): BusinessCard {
  const sections = createCardDetailTemplate(card, profile);
  const values = new Map(sections.flatMap((section) => section.fields.map((field) => [field.id, field.value] as const)));
  const preferredName = values.get('preferredName')?.trim() || card.name;
  const title = values.get('title')?.trim() || '';
  const company = values.get('company')?.trim() || '';
  const tagline = values.get('tagline') ?? '';
  const bio = values.get('bio') ?? '';
  const accreditations = values.get('accreditations') ?? '';
  const coverPhoto = values.get('coverPhoto') ?? '';
  const profilePhoto = values.get('profilePhoto') ?? '';
  const logo = values.get('logo') ?? '';

  return {
    ...card,
    name: preferredName,
    title,
    company,
    sectionOverrides: {
      ...card.sectionOverrides,
      preferredName,
      firstName: card.sectionOverrides.firstName ?? splitName(preferredName).firstName,
      lastName: card.sectionOverrides.lastName ?? splitName(preferredName).lastName,
      title,
      company,
      tagline,
      bio,
      accreditations,
      coverPhoto: card.sectionOverrides.coverPhoto !== undefined ? card.sectionOverrides.coverPhoto : coverPhoto,
      profilePhoto: card.sectionOverrides.profilePhoto !== undefined ? card.sectionOverrides.profilePhoto : profilePhoto,
      logo: card.sectionOverrides.logo !== undefined ? card.sectionOverrides.logo : logo,
      bioEnabled: card.sectionOverrides.bioEnabled ?? (bio.trim() ? 'true' : 'false'),
    },
    connectionFields: card.connectionFields.map((field) => ({ ...field })),
    connectionFieldsCustomized: card.connectionFieldsCustomized ?? card.connectionFields.length > 0,
  };
}
