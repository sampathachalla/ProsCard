// components/editViewComponents/Services/editViewService.ts
import { Colors } from '@/constants/Colors';
import type { EditableCard } from '../types/editView.types';

const DEFAULT_CARD: EditableCard = {
  id: '1',
  name: 'Sampath Kambhampati',
  title: 'Founder & CEO',
  company: 'ProsCard',
  phone: '+1 (555) 010-2030',
  email: 'sampath@proscard.app',
  gradient: [Colors.light.tint, Colors.palette.brandCyan],
};

export function getPrimaryCard(): EditableCard {
  return DEFAULT_CARD;
}

export function saveCard(card: EditableCard): Promise<EditableCard> {
  // Placeholder until a real cards backend exists.
  return Promise.resolve(card);
}
