// pages/addCard/Services/addCardService.ts
import { AUTH_TEST_MODE } from '@/pages/auth/Config/authMode';
import { buildDefaultCard, getCardById } from '@/pages/cards/Services/cardsService';
import { createCardDetailTemplate } from '@/pages/cards/Templates/cardDetailTemplate';
import type { BusinessCard, CardSectionFieldId } from '@/pages/cards/types/card.types';
import { saveCard } from '@/pages/editView/Services/editViewService';
import { clearPendingMedia, commitPendingMedia } from '@/pages/profile/Services/pendingMedia';
import type { Profile } from '@/pages/profile/types/profile.types';
import type { MediaScope } from '@/services/api/types';
import { IMAGE_MEDIA_KINDS } from '../Config/addCardFields';
import type { AddCardImageField } from '../types/addCard.types';
import { buildAddCardDraftFromCard, defaultConnectionFields } from '../Utils/addCardDraft';
import { splitName } from '../Utils/addCardName';

export { buildAddCardDraftFromCard } from '../Utils/addCardDraft';

/** Profile-backed values copied onto the draft so the form edits one source of truth. */
const PREFILLED_OVERRIDES: CardSectionFieldId[] = [
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

  const connectionFields = defaultConnectionFields(sections);

  return { ...card, sectionOverrides, connectionFields, connectionFieldsCustomized: true };
}

export function buildAddCardDraftForEditor(profile: Profile, cardId?: string): BusinessCard {
  if (cardId) {
    const existing = getCardById(cardId);
    if (existing) return buildAddCardDraftFromCard(existing, profile);
  }
  return buildAddCardDraft(profile);
}

/** Uploads a picked image and returns the URL to store on the card. */
export async function uploadCardImage(
  uri: string,
  field: AddCardImageField,
  options?: { scope?: MediaScope; cardId?: string },
): Promise<string> {
  if (AUTH_TEST_MODE) return uri;
  // Card editors keep the picked file local until the user chooses its scope.
  // The account and card saves then create independent media attachments.
  if (options?.scope === 'card') return uri;
  try {
    return await commitPendingMedia(
      uri,
      IMAGE_MEDIA_KINDS[field],
      options?.scope ?? 'profile',
      options?.cardId,
    );
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
