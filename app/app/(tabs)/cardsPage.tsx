import { useState } from 'react';
import { Alert, FlatList, Pressable, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCards } from '@/components/cardsComponents/Hooks/useCards';
import { useProfileSnapshot } from '@/components/profileComponents/Hooks/useProfileSnapshot';
import { CardSectionFace } from '@/components/cardsComponents/Components/CardSectionFace';
import { FlippableCard } from '@/components/gestures';
import { PageHeader } from '@/components/uiComponents/PageHeader';
import { Text } from '@/components/uiComponents/Text';
import { QRCodeModal } from '@/components/uiComponents/QRCodeModal';
import { useShareUrl } from '@/components/sharingComponents/Hooks/useShareUrl';
import { Plus, Trash2 } from 'lucide-react-native';
import { createDefaultCard, deleteCard } from '@/components/cardsComponents/Services/cardsService';

export default function CardsPageScreen() {
  const { cards, loading, error, offline, refresh } = useCards();
  const { profile } = useProfileSnapshot();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [qrCardId, setQrCardId] = useState<string | null>(null);
  const share = useShareUrl(qrCardId);
  const columns = width >= 1000 ? 3 : width >= 640 ? 2 : 1;
  const gap = 16;
  const cardWidth = Math.min(420, (width - 48 - gap * (columns - 1)) / columns);
  const cardHeight = cardWidth / 1.586;
  const createCard = async () => {
    try {
      const created = await createDefaultCard(profile);
      router.push({ pathname: '/(tabs)/editViewPage', params: { cardId: created.id, edit: '1' } });
    } catch (reason) {
      Alert.alert('Could not create card', reason instanceof Error ? reason.message : 'Try again.');
    }
  };
  const confirmDelete = (id: string, name: string) => Alert.alert('Delete card?', `${name || 'This card'} and its uploaded images will be removed.`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => deleteCard(id).catch((reason) => Alert.alert('Delete failed', reason instanceof Error ? reason.message : 'Try again.')) },
  ]);

  return <View className="flex-1 bg-background dark:bg-dark-background">
    <PageHeader title="My Cards" subtitle={offline ? `${cards.length} cached · offline` : `${cards.length} digital ${cards.length === 1 ? 'card' : 'cards'}`} onBackPress={() => router.replace('/(tabs)/profilePage')} right={<Pressable accessibilityLabel="Create card" disabled={offline} onPress={createCard} className="h-11 w-11 items-center justify-center rounded-full bg-primary"><Plus color="#fff" size={21} /></Pressable>} />
    <FlatList
      key={columns}
      data={cards}
      numColumns={columns}
      keyExtractor={(item) => item.id}
      columnWrapperStyle={columns > 1 ? { gap } : undefined}
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom, 20) + 16, gap }}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<View className="mt-16 items-center justify-center px-6"><Text variant="heading" className="text-center">{loading ? 'Loading cards…' : error ? 'Could not load cards' : 'No cards yet'}</Text><Text variant="muted" className="mt-2 text-center">{error ? error.message : 'Create your first digital card.'}</Text><Pressable onPress={error ? () => { void refresh(); } : createCard} className="mt-5 rounded-xl bg-primary px-5 py-3"><Text className="font-bold text-white">{error ? 'Retry' : 'Create card'}</Text></Pressable></View>}
      renderItem={({ item }) => <View style={{ width: cardWidth }}><FlippableCard accessibilityLabel={`${item.category} card for ${item.name}`} front={<CardSectionFace card={item} height={cardHeight} profile={profile} sectionId="identity" width={cardWidth} />} back={<CardSectionFace card={item} height={cardHeight} profile={profile} sectionId="professional" width={cardWidth} />} height={cardHeight} width={cardWidth} onDoubleTap={() => router.push({ pathname: '/cards/[cardId]', params: { cardId: item.id } })} onSwipeDown={() => setQrCardId(item.id)} /><Pressable accessibilityLabel={`Delete ${item.name}`} onPress={() => confirmDelete(item.id, item.name)} className="mt-2 self-end flex-row items-center gap-1.5 rounded-xl px-3 py-2"><Trash2 color="#ef4444" size={16} /><Text className="font-semibold text-rose-500">Delete</Text></Pressable></View>}
    />
    <QRCodeModal visible={Boolean(qrCardId)} cardName={cards.find((card) => card.id === qrCardId)?.name ?? 'ProsCard'} url={share.url} error={share.error instanceof Error ? share.error.message : undefined} onClose={() => setQrCardId(null)} />
  </View>;
}
