import { createCardDetailTemplate, type CardDetailSection } from '@/pages/cards/Templates/cardDetailTemplate';
import type { BusinessCard, DynamicCardField } from '@/pages/cards/types/card.types';
import type { Profile } from '@/pages/profile/types/profile.types';
import { PRIMARY_CONTACT_IDS } from '../Config/addCardFields';
import { splitName } from './addCardName';

/**
 * Contact rows for a card that has none of its own yet: Location, Email and Phone always, plus every
 * other method the account already has (website, socials). Values come from the card first, then the
 * account, so they start as the account's and can be changed per card.
 */
export function defaultConnectionFields(sections: CardDetailSection[]): DynamicCardField[] {
  return (sections.find((section) => section.id === 'connections')?.fields ?? [])
    .filter((field) => PRIMARY_CONTACT_IDS.has(field.id) || field.value.trim())
    .map((field) => ({
      id: field.id,
      title: field.title,
      type: field.type === 'image' || field.type === 'multiline' ? 'text' : field.type,
      value: field.value,
    }));
}

/**
 * A card's own rows, plus any always-present row (Location, Email, Phone) it is missing, filled from the
 * card or account. Rows the card has, including ones the user cleared, are left as they are.
 */
function withPrimaryConnectionFields(fields: DynamicCardField[], defaults: DynamicCardField[]) {
  const present = new Set(fields.map((field) => field.id));
  const missing = defaults.filter((field) => PRIMARY_CONTACT_IDS.has(field.id) && !present.has(field.id));
  return [...missing, ...fields.map((field) => ({ ...field }))];
}

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
      bioEnabled: card.sectionOverrides.bioEnabled ?? (bio.trim() ? 'true' : 'false'),
    },
    // A card that never got its own contact rows (e.g. the one made in onboarding) shows the account's;
    // copy them in so the editor starts from what the card shows and they can be changed per card.
    ...(hasOwnConnections(card)
      ? {
          connectionFields: withPrimaryConnectionFields(card.connectionFields, accountConnectionFields(card, profile)),
          connectionFieldsCustomized: true,
        }
      : { connectionFields: defaultConnectionFields(sections), connectionFieldsCustomized: true }),
  };
}

const hasOwnConnections = (card: BusinessCard) =>
  Boolean(card.connectionFieldsCustomized) || card.connectionFields.length > 0;

/** The rows the account would give this card, ignoring any rows the card already has of its own. */
const accountConnectionFields = (card: BusinessCard, profile: Profile) =>
  defaultConnectionFields(
    createCardDetailTemplate({ ...card, connectionFields: [], connectionFieldsCustomized: false }, profile),
  );
