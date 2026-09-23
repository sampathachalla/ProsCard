// components/editViewComponents/Utils/validateCard.ts
import type { EditableCard } from '../types/editView.types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+]?\d[\d\s().-]{5,20}$/;
const URL_PATTERN = /^https?:\/\/.+/i;

export function validateCard(card: EditableCard): string | null {
  if (!card.name.trim()) return 'Name is required.';
  if (!card.title.trim()) return 'Job title is required.';
  if (!card.company.trim()) return 'Company is required.';
  if (card.email.trim() && !EMAIL_PATTERN.test(card.email.trim())) {
    return 'Enter a valid email address.';
  }
  for (const field of card.connectionFields) {
    if (!field.title.trim()) return 'Every contact field needs a title.';
    if (!field.value.trim()) continue;
    if (field.type === 'email' && !EMAIL_PATTERN.test(field.value.trim())) return `${field.title} must be a valid email address.`;
    if (field.type === 'phone' && !PHONE_PATTERN.test(field.value.trim())) return `${field.title} must be a valid phone number.`;
    if (field.type === 'url' && !URL_PATTERN.test(field.value.trim())) return `${field.title} must start with http:// or https://.`;
  }
  return null;
}
