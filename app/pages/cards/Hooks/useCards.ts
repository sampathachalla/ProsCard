import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { BusinessCard } from '../types/card.types';
import { cardsAreOffline, getCards, hydrateCards, subscribeCards } from '../Services/cardsService';
import { queryClient, queryKeys } from '@/services/api/queryClient';

export function useCards() {
  const query = useQuery({
    queryKey: queryKeys.cards,
    queryFn: async () => [...await hydrateCards()],
    initialData: () => [...getCards()],
    // In-memory cards are only a placeholder; always fetch from the backend on mount.
    initialDataUpdatedAt: 0,
  });

  useEffect(() => subscribeCards((cards) => {
    queryClient.setQueryData<BusinessCard[]>(queryKeys.cards, [...cards]);
  }), []);

  return {
    cards: query.data,
    loading: query.isLoading || query.isFetching && query.data.length === 0,
    refreshing: query.isFetching,
    /** Cached query data is already usable when this screen remounts after visiting Profile. */
    initialFetchComplete: query.isFetched,
    /** True once cards are available and the current foreground refresh has settled. */
    fetched: query.isFetched && !query.isFetching,
    offline: cardsAreOffline(),
    error: query.error instanceof Error ? query.error : null,
    refresh: query.refetch,
  };
}
