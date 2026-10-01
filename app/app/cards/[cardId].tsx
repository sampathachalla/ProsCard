import { useState } from 'react';
import { Alert, Linking, Platform, ScrollView, Share, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { GenerateMetadataFunction } from 'expo-router/server';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { CardDetailView } from '@/components/cardsComponents/Components/CardDetailView';
import { getCardById } from '@/components/cardsComponents/Services/cardsService';
import { useCard } from '@/components/cardsComponents/Hooks/useCard';
import { CardTapGesture } from '@/components/gestures';
import { Text } from '@/components/uiComponents/Text';
import { QRCodeModal } from '@/components/uiComponents/QRCodeModal';
import { useShareUrl } from '@/components/sharingComponents/Hooks/useShareUrl';
import { useAddToWallet } from '@/components/walletCardComponents/Hooks/useAddToWallet';
import { getShareUrl } from '@/components/sharingComponents/Services/sharingService';
import { queryClient, queryKeys } from '@/services/api/queryClient';
import { useProfileSnapshot } from '@/components/profileComponents/Hooks/useProfileSnapshot';
import {
  FLOATING_TOOL_DEFINITIONS,
  FloatingToolsButton,
  type FloatingToolAction,
} from '@/components/toolsButton';

export const generateMetadata: GenerateMetadataFunction = async (_request, params) => {
  const cardId = Array.isArray(params.cardId) ? params.cardId[0] : params.cardId;
  const card = getCardById(cardId ?? '');

  if (!card) {
    return {
      title: 'Card not found | ProsCard',
      description: 'This ProsCard is no longer available.',
    };
  }

  const description = `${card.name}, ${card.title} at ${card.company}. View and scan this digital business card.`;

  return {
    title: `${card.name} | ProsCard`,
    description,
    openGraph: {
      title: `${card.name} | ProsCard`,
      description,
      type: 'profile',
    },
  };
};

export default function CardDetailPage() {
  const { cardId } = useLocalSearchParams<{ cardId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cardQuery = useCard(cardId);
  const card = cardQuery.data;
  const { profile } = useProfileSnapshot();
  const [showQr, setShowQr] = useState(false);
  const { addToWallet } = useAddToWallet();

  const share = useShareUrl(showQr ? cardId : null);

  const goBackToCaller = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/homepage');
  };

  if (!card && cardQuery.isLoading) {
    return <SafeAreaView className="flex-1 items-center justify-center bg-background dark:bg-dark-background"><Text>Loading card…</Text></SafeAreaView>;
  }
  if (!card) {
    return (
      <SafeAreaView className="flex-1 bg-background dark:bg-dark-background" edges={['top', 'bottom', 'left', 'right']}>
        <CardTapGesture containerClassName="flex-1" onDoubleTap={goBackToCaller}>
          <View className="flex-1 items-center justify-center px-8">
            <Text variant="heading" className="text-center">
              Card not found
            </Text>
            <Text variant="muted" className="mt-2 text-center">
              {cardQuery.error instanceof Error ? cardQuery.error.message : 'This card is no longer available.'} Double-tap to go back.
            </Text>
          </View>
        </CardTapGesture>
      </SafeAreaView>
    );
  }

  const toolActions: FloatingToolAction[] = FLOATING_TOOL_DEFINITIONS.map((tool) => ({
    ...tool,
    onSelect: async () => {
      const url = tool.id === 'copy' || tool.id === 'open'
        ? await queryClient.fetchQuery({ queryKey: queryKeys.share(card.id), queryFn: () => getShareUrl(card.id), staleTime: Infinity }).catch((reason) => {
            Alert.alert('Share link unavailable', reason instanceof Error ? reason.message : 'Try again.');
            return '';
          })
        : '';
      if ((tool.id === 'copy' || tool.id === 'open') && !url) return;

      switch (tool.id) {
        case 'copy':
          if (Platform.OS === 'web' && navigator.clipboard) {
            await navigator.clipboard.writeText(url);
            Alert.alert('Link copied', 'The card URL was copied to your clipboard.');
          } else {
            await Share.share({ message: url, title: `${card.name} | ProsCard`, url });
          }
          break;
        case 'wallet':
          await addToWallet(card.id);
          break;
        case 'edit':
          router.push({
            pathname: '/(tabs)/editViewPage',
            params: { cardId: card.id, edit: '1' },
          });
          break;
        case 'open':
          await Linking.openURL(url);
          break;
      }
    },
  }));

  return (
    <CardTapGesture
      containerClassName="flex-1 bg-background dark:bg-dark-background"
      onDoubleTap={goBackToCaller}
      onSwipeDown={() => setShowQr(true)}
      simultaneousWithNative
    >
      <ScrollView
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 24) + 32,
          paddingTop: Math.max(insets.top, 12),
        }}
        showsVerticalScrollIndicator={false}
      >
        <CardDetailView card={card} fullBleed profile={profile} />
      </ScrollView>
      <FloatingToolsButton actions={toolActions} />
      <QRCodeModal visible={showQr} cardName={card.name} url={share.url} error={share.error instanceof Error ? share.error.message : undefined} onClose={() => setShowQr(false)} />
    </CardTapGesture>
  );
}
