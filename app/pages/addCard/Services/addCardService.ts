// pages/addCard/Services/addCardService.ts
import { AUTH_TEST_MODE } from '@/pages/auth/Config/authMode';
import { buildDefaultCard, getCardById } from '@/pages/cards/Services/cardsService';
import { createCardDetailTemplate } from '@/pages/cards/Templates/cardDetailTemplate';
import type { BusinessCard, CardSectionFieldId, DynamicCardField } from '@/pages/cards/types/card.types';
import { saveCard } from '@/pages/editView/Services/editViewService';
import { clearPendingMedia, commitPendingMedia } from '@/pages/profile/Services/pendingMedia';
import type { Profile } from '@/pages/profile/types/profile.types';
import { IMAGE_MEDIA_KINDS, PRIMARY_CONTACT_IDS } from '../Config/addCardFields';
import type { AddCardImageField } from '../types/addCard.types';
import { splitName } from '../Utils/addCardName';

/** Profile-backed values copied onto the draft so the form edits one source of truth. */
const PREFILLED_OVERRIDES: CardSectionFieldId[] = [
  'coverPhoto',
  'profilePhoto',
  'logo',
  'accreditations',
  'tagline',
  'bio',
  'bioEnabled',
];

/** A new card pre-filled from the account profile, with Location, Email and Phone always present. */
export function buildAddCardDraft(profile: Profile): BusinessCard {
  const card = buildDefaultCard(profile);
  const sections = createCardDetailTemplate(card, profile);
  const values = new Map(sections.flatMap((section) => section.fields.map((field) => [field.id, field.value] as const)));

  const sectionOverrides: BusinessCard['sectionOverrides'] = { preferredName: card.name, ...splitName(card.name) };
  for (const field of PREFILLED_OVERRIDES) sectionOverrides[field] = values.get(field) ?? '';

  const connectionFields: DynamicCardField[] = (sections.find((section) => section.id === 'connections')?.fields ?? [])
    .filter((field) => PRIMARY_CONTACT_IDS.has(field.id) || field.value.trim())
    .map((field) => ({
      id: field.id,
      title: field.title,
      type: field.type === 'image' || field.type === 'multiline' ? 'text' : field.type,
      value: field.value,
    }));

  return { ...card, sectionOverrides, connectionFields, connectionFieldsCustomized: true };
}

/** Existing card loaded into the add/edit form shape. */
export function buildAddCardDraftFromCard(card: BusinessCard): BusinessCard {
  const preferredName = card.sectionOverrides.preferredName?.trim() || card.name;
  return {
    ...card,
    name: preferredName,
    sectionOverrides: {
      ...card.sectionOverrides,
      preferredName,
      firstName: card.sectionOverrides.firstName ?? splitName(preferredName).firstName,
      lastName: card.sectionOverrides.lastName ?? splitName(preferredName).lastName,
    },
    connectionFields: card.connectionFields.map((field) => ({ ...field })),
    connectionFieldsCustomized: card.connectionFieldsCustomized ?? card.connectionFields.length > 0,
  };
}

export function buildAddCardDraftForEditor(profile: Profile, cardId?: string): BusinessCard {
  if (cardId) {
    const existing = getCardById(cardId);
    if (existing) return buildAddCardDraftFromCard(existing);
  }
  return buildAddCardDraft(profile);
}

/** Uploads a picked image and returns the URL to store on the card. */
export async function uploadCardImage(uri: string, field: AddCardImageField): Promise<string> {
  if (AUTH_TEST_MODE) return uri;
  try {
    return await commitPendingMedia(uri, IMAGE_MEDIA_KINDS[field]);
  } catch (error) {
    clearPendingMedia(uri);
    throw error;
  }
}

export function createCard(card: BusinessCard): Promise<BusinessCard> {
  // Keep the top-level contact columns in sync with the rows the user edited.
  const valueOf = (id: string) => card.connectionFields.find((field) => field.id === id)?.value.trim() ?? '';
  return saveCard({ ...card, email: valueOf('email'), phone: valueOf('phone') });
}
