import { useQuery } from '@tanstack/react-query';
import { fetchCardById, getCardById } from '../Services/cardsService';
import { queryKeys } from '@/services/api/queryClient';

export function useCard(cardId: string) {
  return useQuery({
    queryKey: queryKeys.card(cardId),
    queryFn: () => fetchCardById(cardId),
    initialData: () => getCardById(cardId),
    initialDataUpdatedAt: 0,
    enabled: Boolean(cardId),
  });
}
