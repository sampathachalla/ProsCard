// components/editViewComponents/Utils/validateCard.ts
import type { EditableCard } from '../types/editView.types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCard(card: EditableCard): string | null {
  if (!card.name.trim()) return 'Name is required.';
  if (!card.title.trim()) return 'Job title is required.';
  if (!card.company.trim()) return 'Company is required.';
  if (card.email.trim() && !EMAIL_PATTERN.test(card.email.trim())) {
    return 'Enter a valid email address.';
  }
  return null;
}
