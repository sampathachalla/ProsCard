// components/cardsComponents/Hooks/useCards.ts
import { useEffect, useState } from 'react';
import type { BusinessCard } from '../types/card.types';
import { getCards, hydrateCards, subscribeCards } from '../Services/cardsService';

export function useCards() {
  const [cards, setCards] = useState<BusinessCard[]>(() => [...getCards()]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    hydrateCards()
      .then((hydrated) => setCards([...hydrated]))
      .catch((reason) => setError(reason instanceof Error ? reason : new Error('Could not load cards.')))
      .finally(() => setLoading(false));

    const unsubscribe = subscribeCards((updatedCards) => {
      setCards([...updatedCards]);
    });

    return unsubscribe;
  }, []);

  return { cards, loading, error, refresh: hydrateCards };
}
