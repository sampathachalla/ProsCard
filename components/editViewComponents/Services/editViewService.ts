// components/editViewComponents/Services/editViewService.ts
import { Colors } from '@/constants/Colors';
import { getCardById, saveCard as persistCard } from '@/components/cardsComponents/Services/cardsService';
import { createDefaultCardSectionThemes, DEFAULT_CARD_SECTION_LAYOUTS, DEFAULT_CARD_THEME } from '@/components/cardsComponents/types/card.types';
import type { EditableCard } from '../types/editView.types';

const DEFAULT_CARD: EditableCard = {
  id: '1',
  category: 'Professional',
  name: 'Sampath Kambhampati',
  title: 'Founder & CEO',
  company: 'ProsCard',
  phone: '+1 (555) 010-2030',
  email: 'sampath@proscard.app',
  gradient: [Colors.light.tint, Colors.palette.brandCyan],
  sectionLayouts: { ...DEFAULT_CARD_SECTION_LAYOUTS },
  sectionOverrides: {},
  connectionFields: [],
  connectionFieldsCustomized: false,
  cardTheme: { ...DEFAULT_CARD_THEME },
  sectionThemes: createDefaultCardSectionThemes(),
};

export function getPrimaryCard(): EditableCard {
  return DEFAULT_CARD;
}

export function getEditableCard(cardId?: string): EditableCard {
  const card = cardId ? getCardById(cardId) : undefined;
  if (!card) return getPrimaryCard();

  return {
    id: card.id,
    category: card.category,
    name: card.name,
    title: card.title,
    company: card.company,
    phone: card.phone,
    email: card.email,
    gradient: card.gradient,
    sectionLayouts: { ...card.sectionLayouts },
    sectionOverrides: { ...card.sectionOverrides },
    connectionFields: card.connectionFields.map((field) => ({ ...field })),
    connectionFieldsCustomized: card.connectionFieldsCustomized,
    cardTheme: { ...card.cardTheme, gradient: [...card.cardTheme.gradient] },
    sectionThemes: Object.fromEntries(Object.entries(card.sectionThemes).map(([section, theme]) => [section, { ...theme, gradient: [...theme.gradient] }] )) as EditableCard['sectionThemes'],
  };
}

export function saveCard(card: EditableCard): Promise<EditableCard> {
  return persistCard(card);
}
