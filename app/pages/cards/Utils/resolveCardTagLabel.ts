import type { BusinessCard } from '@/pages/cards/types/card.types';

/** Label shown in home header and full-card header (card tag, not person name). */
export function resolveCardTagLabel(card: Pick<BusinessCard, 'name' | 'category' | 'sectionOverrides'>) {
  return (
    card.sectionOverrides.cardTag?.trim() ||
    card.category?.trim() ||
    card.name?.trim() ||
    'My card'
  );
}
