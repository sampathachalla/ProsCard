// components/cardsComponents/Services/cardsService.ts
import { Colors } from '@/constants/Colors';
import type { BusinessCard } from '../types/card.types';

export const CARDS: BusinessCard[] = [
  {
    id: '1',
    name: 'Sampath Kambhampati',
    title: 'Founder & CEO',
    company: 'ProsCard',
    phone: '+1 (555) 010-2030',
    email: 'sampath@proscard.app',
    gradient: [Colors.light.tint, Colors.palette.brandCyan],
  },
  {
    id: '2',
    name: 'Sampath Kambhampati',
    title: 'Product Designer',
    company: 'MindPros Studio',
    phone: '+1 (555) 010-2030',
    email: 'sampath@mindpros.studio',
    gradient: [Colors.palette.surfaceDark, Colors.palette.midnightBase],
  },
];

export function getCards(): BusinessCard[] {
  return CARDS;
}
