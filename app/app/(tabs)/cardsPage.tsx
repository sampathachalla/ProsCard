import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Edit3, Plus, Star, Trash2, X } from 'lucide-react-native';
import { useCards } from '@/components/cardsComponents/Hooks/useCards';
import type { BusinessCard } from '@/components/cardsComponents/types/card.types';
import { useProfileSnapshot } from '@/components/profileComponents/Hooks/useProfileSnapshot';
import { WalletStackView } from '@/components/walletCardComponents';
import { PageHeader } from '@/components/uiComponents/PageHeader';
import { Text } from '@/components/uiComponents/Text';
import { deleteCard, setPrimaryCard } from '@/components/cardsComponents/Services/cardsService';

export default function CardsPageScreen() {
  const { cards, loading, error, offline, refresh } = useCards();
  const { profile } = useProfileSnapshot();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [stackHeight, setStackHeight] = useState(0);
  const [actionCardId, setActionCardId] = useState<string | null>(null);
  const goBackToProfile = () => router.replace('/(tabs)/profilePage');

  const createCard = () => {
    router.push({ pathname: '/(tabs)/editViewPage', params: { create: '1', origin: 'cards' } });
  };

  const editCard = (card: BusinessCard) => {
    setActionCardId(null);
    router.push({ pathname: '/(tabs)/editViewPage', params: { cardId: card.id, edit: '1' } });
  };

  const confirmDelete = (card: BusinessCard) => Alert.alert(
    'Delete card?',
    `${card.name || 'This card'} and its uploaded images will be removed.`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setActionCardId(null);
          deleteCard(card.id).catch((reason) => Alert.alert('Delete failed', reason instanceof Error ? reason.message : 'Try again.'));
        },
      },
    ],
  );

  const makePrimary = async (card: BusinessCard) => {
    try {
      await setPrimaryCard(card.id);
      setActiveIndex(0);
      setActionCardId(null);
    } catch (reason) {
      Alert.alert('Could not change primary card', reason instanceof Error ? reason.message : 'Try again.');
    }
  };

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <PageHeader
        title="My Cards"
        subtitle={offline ? `${cards.length} cached · offline` : `${cards.length} digital ${cards.length === 1 ? 'card' : 'cards'}`}
        onBackPress={goBackToProfile}
        right={
          <Pressable accessibilityLabel="Create card" disabled={offline} onPress={createCard} className="h-11 w-11 items-center justify-center rounded-full bg-primary">
            <Plus color="#fff" size={21} />
          </Pressable>
        }
      />

      <View className="flex-1" onLayout={(event) => setStackHeight(event.nativeEvent.layout.height)}>
        {loading || error ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text variant="heading" className="text-center">{loading ? 'Loading cards…' : 'Could not load cards'}</Text>
            <Text variant="muted" className="mt-2 text-center">{error?.message}</Text>
            {error ? <Pressable onPress={() => { void refresh(); }} className="mt-5 rounded-xl bg-primary px-5 py-3"><Text className="font-bold text-white">Retry</Text></Pressable> : null}
          </View>
        ) : stackHeight > 0 ? (
          <WalletStackView
            activeIndex={activeIndex}
            bottomInset={Math.max(insets.bottom, 16)}
            cardOverlay={(card) => card.id === actionCardId ? (
              <View
                className="absolute items-center justify-center overflow-hidden p-4"
                style={{ backgroundColor: 'rgba(2, 6, 23, 0.78)', borderRadius: 28, bottom: -1, left: -1, right: -1, top: -1, zIndex: 100 }}
              >
                <Pressable accessibilityRole="button" accessibilityLabel="Close card actions" onPress={() => setActionCardId(null)} className="absolute right-3 top-3 h-10 w-10 items-center justify-center rounded-full bg-black/35">
                  <X color="#f8fafc" size={20} />
                </Pressable>
                <View className="flex-row items-center justify-center">
                  <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${card.name}`} onPress={() => editCard(card)} className="mr-2 h-12 flex-row items-center rounded-2xl bg-blue-600 px-4">
                    <Edit3 color="#fff" size={17} /><Text className="ml-2 font-bold text-white">Edit</Text>
                  </Pressable>
                  {!card.isPrimary ? (
                    <Pressable accessibilityRole="button" accessibilityLabel={`Make ${card.name} primary`} onPress={() => { void makePrimary(card); }} className="mr-2 h-12 flex-row items-center rounded-2xl bg-amber-500/25 px-4">
                      <Star color="#fbbf24" size={18} /><Text className="ml-2 font-bold text-amber-300">Primary</Text>
                    </Pressable>
                  ) : null}
                  <Pressable accessibilityRole="button" accessibilityLabel={card.isPrimary ? 'Primary card cannot be deleted' : `Delete ${card.name}`} disabled={card.isPrimary} onPress={() => confirmDelete(card)} className={`h-12 w-12 items-center justify-center rounded-2xl ${card.isPrimary ? 'bg-white/5 opacity-35' : 'bg-rose-500/25'}`}>
                    <Trash2 color={card.isPrimary ? '#94a3b8' : '#fb7185'} size={19} />
                  </Pressable>
                </View>
              </View>
            ) : null}
            cards={cards}
            height={stackHeight}
            onActiveIndexChange={(index) => {
              setActiveIndex(index);
              setActionCardId(null);
            }}
            onAddCard={offline ? undefined : createCard}
            onCardDoubleTap={(card) => setActionCardId(card.id)}
            profile={profile}
            showAddCardPass={false}
            showPrimaryTag
          />
        ) : null}

      </View>
    </View>
  );
}
