// components/cardsComponents/Hooks/useCards.ts
import { useState } from 'react';
import type { BusinessCard } from '../types/card.types';
import { getCards } from '../Services/cardsService';

export function useCards() {
  const [cards] = useState<BusinessCard[]>(getCards());
  return { cards };
}
