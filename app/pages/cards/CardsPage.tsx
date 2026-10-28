import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, Plus, Star, Trash2, X } from 'lucide-react-native';
import { useCards } from '@/pages/cards/Hooks/useCards';
import type { BusinessCard } from '@/pages/cards/types/card.types';
import { useProfileSnapshot } from '@/pages/profile/Hooks/useProfileSnapshot';
import { CardShowcaseSection } from '@/pages/home/Components/CardShowcaseSection';
import { PageHeader } from '@/common/ui/PageHeader';
import { Text } from '@/common/ui/Text';
import { confirmAction } from '@/common/ui/confirmAction';
import { deleteCard, setPrimaryCard } from '@/pages/cards/Services/cardsService';
import { navigateToCardEditor } from '@/pages/cards/Utils/navigateToCardEditor';

export default function CardsPageScreen() {
  const { cards, loading, error, offline, refresh } = useCards();
  const { profile } = useProfileSnapshot();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showcaseHeight, setShowcaseHeight] = useState(0);
  const [pendingAction, setPendingAction] = useState<'primary' | 'delete' | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletedCardName, setDeletedCardName] = useState<string | null>(null);
  const boundedActiveIndex = cards.length > 0 ? Math.min(activeIndex, cards.length - 1) : 0;
  const activeCard = cards[boundedActiveIndex];
  const goBackToProfile = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/profilePage');
    }
  };

  const createCard = () => {
    navigateToCardEditor(router, { create: true });
  };

  const confirmDelete = async (card: BusinessCard) => {
    if (pendingAction || card.isPrimary) return;
    const confirmed = await confirmAction({
      title: 'Delete card?',
      message: `${card.name || 'This card'} and its uploaded images will be removed.`,
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!confirmed) return;
    setPendingAction('delete');
    setActionError(null);
    try {
      await deleteCard(card.id);
      setActiveIndex((current) => Math.max(0, Math.min(current, cards.length - 2)));
      setDeletedCardName(card.name || 'Card');
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Could not delete this card. Try again.');
    } finally {
      setPendingAction(null);
    }
  };

  const makePrimary = async (card: BusinessCard) => {
    if (pendingAction || card.isPrimary) return;
    setPendingAction('primary');
    setActionError(null);
    try {
      await setPrimaryCard(card.id);
      setActiveIndex(0);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Could not change the primary card. Try again.');
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <PageHeader
        title="Manage cards"
        subtitle={offline ? `${cards.length} cached · offline` : `${cards.length} digital ${cards.length === 1 ? 'card' : 'cards'}`}
        onBackPress={goBackToProfile}
        right={
          <Pressable accessibilityLabel="Create card" accessibilityRole="button" disabled={offline} onPress={createCard} className={`size-11 items-center justify-center rounded-full bg-primary ${offline ? 'opacity-50' : ''}`}>
            <Plus color="#fff" size={21} />
          </Pressable>
        }
      />

      {deletedCardName ? (
        <View
          accessibilityLiveRegion="polite"
          className="mx-6 mb-2 flex-row items-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3"
        >
          <CheckCircle2 color="#059669" size={19} strokeWidth={2.4} />
          <Text className="ml-2.5 flex-1 text-sm font-bold text-emerald-700 dark:text-emerald-400">
            {deletedCardName} was deleted.
          </Text>
          <Pressable
            accessibilityLabel="Dismiss deleted card message"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setDeletedCardName(null)}
            className="size-8 items-center justify-center rounded-full active:bg-emerald-500/10"
          >
            <X color="#059669" size={17} />
          </Pressable>
        </View>
      ) : null}

      <View className="flex-1" onLayout={(event) => setShowcaseHeight(Math.round(event.nativeEvent.layout.height))}>
        {loading || error ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text variant="heading" className="text-center">{loading ? 'Loading cards…' : 'Could not load cards'}</Text>
            <Text variant="muted" className="mt-2 text-center">{error?.message}</Text>
            {error ? <Pressable onPress={() => { void refresh(); }} className="mt-5 rounded-xl bg-primary px-5 py-3"><Text className="font-bold text-white">Retry</Text></Pressable> : null}
          </View>
        ) : showcaseHeight > 0 && cards.length > 0 ? (
          <CardShowcaseSection
            activeIndex={boundedActiveIndex}
            cards={cards}
            height={showcaseHeight}
            includeAddTile={false}
            onActiveIndexChange={(index) => { setActiveIndex(index); setActionError(null); }}
            profile={profile}
            viewMode="carousel"
          />
        ) : !loading && !error ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text variant="heading" className="text-center">No cards yet</Text>
            <Text variant="muted" className="mt-2 text-center">Create your first card to start sharing your details.</Text>
            <Pressable accessibilityRole="button" disabled={offline} onPress={createCard} className="mt-5 min-h-[48px] flex-row items-center rounded-2xl bg-primary px-5">
              <Plus color="#fff" size={18} /><Text className="ml-2 font-bold text-white">Create card</Text>
            </Pressable>
          </View>
        ) : null}

      </View>

      {activeCard ? (
        <View
          className="border-t border-slate-200 bg-background px-5 pt-3 dark:border-slate-800 dark:bg-dark-background"
          style={{ paddingBottom: Math.max(insets.bottom, 14) }}
        >
          {actionError ? (
            <Text accessibilityLiveRegion="polite" className="mb-2 text-center text-sm font-semibold text-error dark:text-dark-error">
              {actionError}
            </Text>
          ) : null}
          <View className="flex-row gap-3">
            <Pressable
              accessibilityLabel={activeCard.isPrimary ? `${activeCard.name} is the primary card` : `Make ${activeCard.name} primary`}
              accessibilityRole="button"
              accessibilityState={{ disabled: activeCard.isPrimary || offline || pendingAction !== null, busy: pendingAction === 'primary' }}
              disabled={activeCard.isPrimary || offline || pendingAction !== null}
              onPress={() => { void makePrimary(activeCard); }}
              className={`min-h-[52px] flex-1 flex-row items-center justify-center rounded-2xl bg-primary px-4 ${(activeCard.isPrimary || offline || pendingAction !== null) ? 'opacity-50' : ''}`}
            >
              {pendingAction === 'primary' ? <ActivityIndicator color="#fff" size="small" /> : <Star color="#fff" fill={activeCard.isPrimary ? '#fff' : 'transparent'} size={19} />}
              <Text className="ml-2 font-bold text-white">{activeCard.isPrimary ? 'Primary card' : 'Make primary'}</Text>
            </Pressable>
            <Pressable
              accessibilityLabel={activeCard.isPrimary ? 'Primary card cannot be deleted' : `Delete ${activeCard.name}`}
              accessibilityRole="button"
              accessibilityState={{ disabled: activeCard.isPrimary || offline || pendingAction !== null, busy: pendingAction === 'delete' }}
              disabled={activeCard.isPrimary || offline || pendingAction !== null}
              onPress={() => { void confirmDelete(activeCard); }}
              className={`min-h-[52px] flex-1 flex-row items-center justify-center rounded-2xl border border-error px-4 ${(activeCard.isPrimary || offline || pendingAction !== null) ? 'opacity-40' : ''}`}
            >
              {pendingAction === 'delete' ? <ActivityIndicator color="#ef4444" size="small" /> : <Trash2 color="#ef4444" size={19} />}
              <Text className="ml-2 font-bold text-error dark:text-dark-error">Delete</Text>
            </Pressable>
          </View>
          {activeCard.isPrimary ? (
            <Text variant="muted" className="mt-2 text-center text-xs">Choose another card as primary before deleting this one.</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
