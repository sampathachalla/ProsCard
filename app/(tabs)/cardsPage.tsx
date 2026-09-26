import { useState } from 'react';
import { FlatList, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCards } from '@/components/cardsComponents/Hooks/useCards';
import { useProfileSnapshot } from '@/components/profileComponents/Hooks/useProfileSnapshot';
import { CardSectionFace } from '@/components/cardsComponents/Components/CardSectionFace';
import { FlippableCard } from '@/components/gestures';
import { PageHeader } from '@/components/uiComponents/PageHeader';
import { Text } from '@/components/uiComponents/Text';
import { QRCodeModal } from '@/components/uiComponents/QRCodeModal';

export default function CardsPageScreen() {
  const { cards } = useCards();
  const { profile } = useProfileSnapshot();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [qrCardId, setQrCardId] = useState<string | null>(null);
  const columns = width >= 1000 ? 3 : width >= 640 ? 2 : 1;
  const gap = 16;
  const cardWidth = Math.min(420, (width - 48 - gap * (columns - 1)) / columns);
  const cardHeight = cardWidth / 1.586;

  return <View className="flex-1 bg-background dark:bg-dark-background">
    <PageHeader title="My Cards" subtitle={`${cards.length} digital ${cards.length === 1 ? 'card' : 'cards'}`} onBackPress={() => router.replace('/(tabs)/profilePage')} />
    <FlatList
      key={columns}
      data={cards}
      numColumns={columns}
      keyExtractor={(item) => item.id}
      columnWrapperStyle={columns > 1 ? { gap } : undefined}
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom, 20) + 16, gap }}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<View className="mt-16 items-center justify-center px-6"><Text variant="heading" className="text-center">No cards yet</Text><Text variant="muted" className="mt-2 text-center">Create a card from the home screen or editor.</Text></View>}
      renderItem={({ item }) => <View style={{ width: cardWidth }}><FlippableCard accessibilityLabel={`${item.category} card for ${item.name}`} front={<CardSectionFace card={item} height={cardHeight} profile={profile} sectionId="identity" width={cardWidth} />} back={<CardSectionFace card={item} height={cardHeight} profile={profile} sectionId="professional" width={cardWidth} />} height={cardHeight} width={cardWidth} onDoubleTap={() => router.push({ pathname: '/cards/[cardId]', params: { cardId: item.id } })} onSwipeDown={() => setQrCardId(item.id)} /></View>}
    />
    <QRCodeModal visible={Boolean(qrCardId)} cardName={cards.find((card) => card.id === qrCardId)?.name ?? 'ProsCard'} url={`https://proscard.app/card/${qrCardId ?? ''}`} onClose={() => setQrCardId(null)} />
  </View>;
}
