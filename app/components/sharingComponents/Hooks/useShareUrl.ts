import { useQuery } from '@tanstack/react-query';
import { getShareUrl } from '../Services/sharingService';
import { queryKeys } from '@/services/api/queryClient';

/** Public share URL for a card's QR code; null while no card is selected. */
export function useShareUrl(cardId: string | null | undefined) {
  const query = useQuery({
    queryKey: queryKeys.share(cardId ?? ''),
    queryFn: () => getShareUrl(cardId as string),
    enabled: Boolean(cardId),
    staleTime: Infinity,
  });
  return { url: query.data ?? '', loading: query.isFetching, error: query.error };
}
