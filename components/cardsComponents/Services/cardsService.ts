// components/cardsComponents/Services/cardsService.ts
import { Colors } from '@/constants/Colors';
import type { BusinessCard } from '../types/card.types';

export const CARDS: BusinessCard[] = [
  {
    id: '1',
    category: 'Professional',
    name: 'Sampath Kambhampati',
    title: 'Founder & CEO',
    company: 'ProsCard',
    phone: '+1 (555) 010-2030',
    email: 'sampath@proscard.app',
    gradient: [Colors.light.tint, Colors.palette.brandCyan],
  },
  {
    id: '2',
    category: 'Personal',
    name: 'Sampath Kambhampati',
    title: 'Product Designer',
    company: 'MindPros Studio',
    phone: '+1 (555) 010-2030',
    email: 'sampath@mindpros.studio',
    gradient: [Colors.palette.surfaceDark, Colors.palette.midnightBase],
  },
  {
    id: '3',
    category: 'Business',
    name: 'Sampath Kambhampati',
    title: 'Full Stack Engineer',
    company: 'MindPros AI',
    phone: '+1 (555) 010-2030',
    email: 'sampath@mindpros.ai',
    gradient: ['#4f46e5', '#7c3aed'],
  },
  {
    id: '4',
    category: 'Networking',
    name: 'Sampath Kambhampati',
    title: 'Angel Investor',
    company: 'MindPros Ventures',
    phone: '+1 (555) 010-2030',
    email: 'sampath@mindpros.vc',
    gradient: ['#0f766e', '#059669'],
  },
];

export function getCards(): BusinessCard[] {
  return CARDS;
}

export function getCardById(cardId: string): BusinessCard | undefined {
  return CARDS.find((card) => card.id === cardId);
}
