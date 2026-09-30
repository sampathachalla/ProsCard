import { QueryClient } from '@tanstack/react-query';

export const queryKeys = {
  profile: ['profile'] as const,
  onboarding: ['onboarding'] as const,
  cards: ['cards'] as const,
  card: (id: string) => ['cards', id] as const,
  share: (cardId: string) => ['share', cardId] as const,
  contacts: ['contacts'] as const,
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: true },
    mutations: { retry: 0 },
  },
});
