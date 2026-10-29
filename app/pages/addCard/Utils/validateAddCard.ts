// pages/addCard/Utils/validateAddCard.ts
import type { BusinessCard } from '@/pages/cards/types/card.types';
import { validateCard } from '@/pages/editView/Utils/validateCard';
import { requiredCardConnectionStatus } from '@/pages/profile/Services/profileConnections';

/** Same rules as the card editor's create flow: tag, required details, then enough contact methods. */
export function validateAddCard(card: BusinessCard): { title: string; message: string } | null {
  if (!card.sectionOverrides.cardTag?.trim()) {
    return { title: 'Select a card tag', message: 'Choose Business, Personal, Networking, or Portfolio.' };
  }
  const error = validateCard(card);
  if (error) return { title: 'Check your details', message: error };

  const connections = requiredCardConnectionStatus(card.connectionFields);
  if (!connections.complete) {
    return {
      title: 'Add required contact details',
      message: !connections.hasEmail
        ? 'Add an email address and at least one website or social link.'
        : 'Add at least one website or social link.',
    };
  }
  return null;
}
