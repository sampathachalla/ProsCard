import { useState } from 'react';
import { Alert, Linking, Platform, ScrollView, Share, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { GenerateMetadataFunction } from 'expo-router/server';
import { CardDetailView } from '@/components/cardsComponents/Components/CardDetailView';
import { getCardById } from '@/components/cardsComponents/Services/cardsService';
import { CardTapGesture } from '@/components/gestures';
import { Text } from '@/components/uiComponents/Text';
import { QRCodeModal } from '@/components/uiComponents/QRCodeModal';
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
  const card = getCardById(cardId);
  const { profile } = useProfileSnapshot();
  const [showQr, setShowQr] = useState(false);

  const getCardUrl = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return `${window.location.origin}/cards/${cardId}`;
    }
    const publicOrigin = process.env.EXPO_PUBLIC_WEB_URL ?? 'https://proscard.app';
    return `${publicOrigin.replace(/\/$/, '')}/cards/${cardId}`;
  };

  const goToHomepage = () => router.replace('/(tabs)/homepage');

  if (!card) {
    return (
      <CardTapGesture
        containerClassName="flex-1 bg-background dark:bg-dark-background"
        onDoubleTap={goToHomepage}
      >
        <View className="flex-1 items-center justify-center px-8">
          <Text variant="heading" className="text-center">Card not found</Text>
          <Text variant="muted" className="mt-2 text-center">
            This card is no longer available. Double tap to return home.
          </Text>
        </View>
      </CardTapGesture>
    );
  }

  const toolActions: FloatingToolAction[] = FLOATING_TOOL_DEFINITIONS.map((tool) => ({
    ...tool,
    onSelect: async () => {
      const url = getCardUrl();

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
          Alert.alert(
            'Add to Wallet',
            'Wallet support is not implemented yet. This shortcut is ready for a future Apple or Google Wallet integration.',
          );
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
      onDoubleTap={goToHomepage}
      onSwipeDown={() => setShowQr(true)}
      simultaneousWithNative
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32, paddingTop: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <CardDetailView card={card} profile={profile} />
      </ScrollView>
      <FloatingToolsButton actions={toolActions} />
      <QRCodeModal visible={showQr} cardName={card.name} url={getCardUrl()} onClose={() => setShowQr(false)} />
    </CardTapGesture>
  );
}
