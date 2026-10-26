// pages/addCard/Utils/validateAddCard.ts
import type { BusinessCard } from '@/pages/cards/types/card.types';
import { validateCard } from '@/pages/editView/Utils/validateCard';
import { connectionCounts, MINIMUM_CARD_CONNECTION_FIELDS } from '@/pages/profile/Services/profileConnections';

/** Same rules as the card editor's create flow: tag, required details, then enough contact methods. */
export function validateAddCard(card: BusinessCard): { title: string; message: string } | null {
  if (!card.sectionOverrides.cardTag?.trim()) {
    return { title: 'Select a card tag', message: 'Choose Business, Personal, Networking, or Portfolio.' };
  }
  const error = validateCard(card);
  if (error) return { title: 'Check your details', message: error };

  const missing = MINIMUM_CARD_CONNECTION_FIELDS - connectionCounts(card.connectionFields).total;
  if (missing > 0) {
    return {
      title: 'Add more contact methods',
      message: `A card needs at least ${MINIMUM_CARD_CONNECTION_FIELDS} contact methods. Add ${missing} more.`,
    };
  }
  return null;
}
