// app/share/[slug].tsx
import { useEffect } from 'react';
import { ActivityIndicator, Platform, ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CreditCard } from 'lucide-react-native';
import { CardDetailView } from '@/components/cardsComponents/Components/CardDetailView';
import { normalizeCard } from '@/components/cardsComponents/Services/cardsService';
import { normalizeProfile } from '@/components/profileComponents/Services/profileService';
import { getSharedCardView } from '@/components/sharingComponents/Services/sharingService';
import { Text } from '@/components/uiComponents/Text';

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
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
    refetchOnWindowFocus: 'always',
    retry: 1,
    staleTime: 0,
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
    return (
      <View className="flex-1 items-center justify-center bg-background px-8 dark:bg-dark-background">
        <CreditCard color="#94a3b8" size={44} strokeWidth={1.6} />
        <Text variant="heading" className="mt-4 text-center">Card unavailable</Text>
        <Text variant="muted" className="mt-2 text-center">
          This ProsCard link has expired or was turned off by its owner.
        </Text>
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
        <CardDetailView card={view.data.card} fullBleed profile={view.data.profile} />
        <Text variant="muted" className="mt-6 text-center text-xs">Shared with ProsCard</Text>
      </View>
    </ScrollView>
  );
}
