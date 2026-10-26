import { useState } from 'react';
import { Alert, Linking, Platform, ScrollView, Share, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { GenerateMetadataFunction } from 'expo-router/server';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { CardDetailView } from '@/pages/fullCard/Components/CardDetailView';
import { getCardById } from '@/pages/cards/Services/cardsService';
import { useCard } from '@/pages/cards/Hooks/useCard';
import { CardTapGesture } from '@/common/gestures';
import { Text } from '@/common/ui/Text';
import { QRCodeModal } from '@/common/ui/QRCodeModal';
import { useShareUrl } from '@/pages/share/Hooks/useShareUrl';
import { useAddToWallet } from '@/pages/walletCard/Hooks/useAddToWallet';
import { WalletProcessingModal } from '@/pages/walletCard/Components/WalletProcessingModal';
import { getShareUrl } from '@/pages/share/Services/sharingService';
import { queryClient, queryKeys } from '@/services/api/queryClient';
import { useProfileSnapshot } from '@/pages/profile/Hooks/useProfileSnapshot';
import {
  FLOATING_TOOL_DEFINITIONS,
  FloatingToolsButton,
  type FloatingToolAction,
} from '@/common/toolsButton';

export const generateMetadata: GenerateMetadataFunction = async (_request, params) => {
  const cardId = Array.isArray(params.cardId) ? params.cardId[0] : params.cardId;
  const card = getCardById(cardId ?? '');

  if (!card) {
    return {
      title: 'Card not found | VC Pros',
      description: 'This VC Pros card is no longer available.',
    };
  }

  const description = `${card.name}, ${card.title} at ${card.company}. View and scan this digital business card.`;

  return {
    title: `${card.name} | VC Pros`,
    description,
    openGraph: {
      title: `${card.name} | VC Pros`,
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
  const wallet = useAddToWallet();

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

      try {
        switch (tool.id) {
          case 'copy':
            if (Platform.OS === 'web' && navigator.clipboard) {
              await navigator.clipboard.writeText(url);
              Alert.alert('Link copied', 'The card URL was copied to your clipboard.');
            } else {
              await Share.share({ message: url, title: `${card.name} | VC Pros`, url });
            }
            break;
          case 'wallet':
            await wallet.addToWallet(card.id, card.name);
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
      } catch (reason) {
        Alert.alert('Something went wrong', reason instanceof Error ? reason.message : 'Please try again.');
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
      <WalletProcessingModal label={wallet.label} visible={wallet.adding} />
      <QRCodeModal visible={showQr} cardName={card.name} url={share.url} error={share.error instanceof Error ? share.error.message : undefined} onClose={() => setShowQr(false)} />
    </CardTapGesture>
  );
}
