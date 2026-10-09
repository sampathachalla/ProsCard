// app/share/[slug].tsx
import { useEffect } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CreditCard, WifiOff } from 'lucide-react-native';
import { CardDetailView } from '@/components/cardsComponents/Components/CardDetailView';
import { normalizeCard } from '@/components/cardsComponents/Services/cardsService';
import { normalizeProfile } from '@/components/profileComponents/Services/profileService';
import { getSharedCardView, vcardUrlForSlug } from '@/components/sharingComponents/Services/sharingService';
import { Text } from '@/components/uiComponents/Text';
import { ApiError } from '@/services/api/client';

/**
 * Public page behind a card's QR code / share link. Anyone can open it without an account; it renders
 * the card with the same components the app uses, so it always matches the owner's latest design.
 */
export default function SharedCardPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const view = useQuery({
    queryKey: ['sharedCard', slug],
    queryFn: async () => {
      const result = await getSharedCardView(slug);
      return { card: normalizeCard(result.card), profile: normalizeProfile(result.profile) };
    },
    enabled: Boolean(slug),
    // Keep the first paint fast after a QR scan; avoid refetching (and re-signing images) on every focus.
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 5 * 60_000,
  });

  const cardName = view.data?.card.name;
  useEffect(() => {
    if (Platform.OS === 'web' && cardName && typeof document !== 'undefined') {
      document.title = `${cardName} | ProsCard`;
    }
  }, [cardName]);

  if (view.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-dark-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (!view.data) {
    // Only a 404 means the link is gone; anything else (offline, timeout, server error) can be retried.
    const linkGone = view.error instanceof ApiError && view.error.status === 404;
    return (
      <View className="flex-1 items-center justify-center bg-background px-8 dark:bg-dark-background">
        {linkGone ? (
          <CreditCard color="#94a3b8" size={44} strokeWidth={1.6} />
        ) : (
          <WifiOff color="#94a3b8" size={44} strokeWidth={1.6} />
        )}
        <Text variant="heading" className="mt-4 text-center">
          {linkGone ? 'Card unavailable' : 'Couldn’t load this card'}
        </Text>
        <Text variant="muted" className="mt-2 text-center">
          {linkGone
            ? 'This ProsCard link has expired or was turned off by its owner.'
            : view.error instanceof Error
              ? view.error.message
              : 'Something went wrong. Please try again.'}
        </Text>
        {linkGone ? null : (
          <Pressable
            accessibilityRole="button"
            disabled={view.isFetching}
            onPress={() => void view.refetch()}
            className="mt-6 min-h-11 items-center justify-center rounded-xl bg-primary px-6 active:opacity-80 dark:bg-dark-primary"
          >
            <Text variant="none" className="text-sm font-bold text-white">
              {view.isFetching ? 'Loading…' : 'Try again'}
            </Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background dark:bg-dark-background"
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 24) + 16 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Phone-width column so the card keeps its proportions on desktop browsers too. */}
      <View style={{ width: '100%', maxWidth: 520, alignSelf: 'center' }}>
        <CardDetailView
          card={view.data.card}
          fullBleed
          profile={view.data.profile}
          vcardDownloadUrl={vcardUrlForSlug(slug)}
        />
        <Text variant="muted" className="mt-6 text-center text-xs">Shared with ProsCard</Text>
      </View>
    </ScrollView>
  );
}
