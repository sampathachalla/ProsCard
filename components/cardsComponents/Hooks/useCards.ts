// components/cardsComponents/Hooks/useCards.ts
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import type { BusinessCard } from '../types/card.types';
import { getCards, hydrateCards, subscribeCards } from '../Services/cardsService';

export function useCards() {
  const [cards, setCards] = useState<BusinessCard[]>(() => [...getCards()]);

  useEffect(() => {
    hydrateCards().then((hydrated) => {
      setCards([...hydrated]);
    });

    const unsubscribe = subscribeCards((updatedCards) => {
      setCards([...updatedCards]);
    });

    return unsubscribe;
  }, []);

  useFocusEffect(
    useCallback(() => {
      setCards([...getCards()]);
    }, [])
  );

  return { cards };
}
