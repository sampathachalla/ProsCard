import { useEffect, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCards } from '@/components/cardsComponents/Hooks/useCards';
import { CardShowcaseSection } from '@/components/homepageComponents/Components/CardShowcaseSection';
import { useCardViewPreference } from '@/components/homepageComponents/Hooks/useCardViewPreference';
import { HomeActions } from '@/components/homepageComponents/Components/HomeActions';
import { HomeHeader } from '@/components/homepageComponents/Components/HomeHeader';
import { useProfileSnapshot } from '@/components/profileComponents/Hooks/useProfileSnapshot';
import { QRCodeModal } from '@/components/uiComponents/QRCodeModal';
import { useShareUrl } from '@/components/sharingComponents/Hooks/useShareUrl';
import { ensureDefaultCard } from '@/components/cardsComponents/Services/cardsService';
import { showMessage } from '@/components/uiComponents/confirmAction';

export default function HomepageScreen() {
  const { cards, fetched, error: cardsError, offline } = useCards();
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [showcaseHeight, setShowcaseHeight] = useState(0);
  const { hydrated: viewModeHydrated, viewMode } = useCardViewPreference();
  const [qrCardId, setQrCardId] = useState<string | null>(null);
  const share = useShareUrl(qrCardId);
  const { profile } = useProfileSnapshot();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Every account starts with one default card; this covers users who reach home without one.
  const [defaultCardFailed, setDefaultCardFailed] = useState(false);
  const needsDefaultCard = fetched && !cardsError && !offline && cards.length === 0 && !defaultCardFailed;
  useEffect(() => {
    if (!needsDefaultCard) return;
    ensureDefaultCard(profile).catch((reason) => {
      setDefaultCardFailed(true);
      showMessage('Could not create your card', reason instanceof Error ? reason.message : 'Try again from the Add card tile.');
    });
    // Profile is read at creation time only; re-running for profile changes would not add value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsDefaultCard]);

  const handleAddCard = () => {
    if (offline) {
      showMessage('You are offline', 'Reconnect to create a new card.');
      return;
    }
    router.push({ pathname: '/(tabs)/editViewPage', params: { create: '1', origin: 'home' } });
  };

  const currentCard = cards[activeCardIndex] ?? cards[0];
  const userName = currentCard?.name ?? 'ProsCard User';

  const handleShowcaseLayout = (event: LayoutChangeEvent) => {
    const nextHeight = Math.round(event.nativeEvent.layout.height);
    setShowcaseHeight((currentHeight) =>
      currentHeight === nextHeight ? currentHeight : nextHeight,
    );
  };

  const handleCardPress = (cardId: string) => {
    router.push({
      pathname: '/cards/[cardId]',
      params: { cardId },
    });
  };

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <View
        className="px-5 pb-3"
        style={{ paddingTop: Math.max(insets.top, 12) }}
      >
        <HomeHeader userName={userName} />
      </View>

      <View
        className="flex-1 overflow-hidden"
        style={{ marginTop: 8 }}
        onLayout={handleShowcaseLayout}
      >
        {showcaseHeight > 0 && viewModeHydrated ? (
          <CardShowcaseSection
            activeIndex={activeCardIndex}
            addingCard={needsDefaultCard}
            onAddCard={handleAddCard}
            cards={cards}
            height={showcaseHeight}
            onActiveIndexChange={setActiveCardIndex}
            onCardDoubleTap={(card) => handleCardPress(card.id)}
            onCardSwipeDown={(card) => setQrCardId(card.id)}
            profile={profile}
            viewMode={viewMode}
          />
        ) : null}
      </View>

      <View
        className="bg-background dark:bg-dark-background"
        style={{
          paddingBottom: Math.max(insets.bottom + 8, 16),
          paddingHorizontal: 20,
          paddingTop: 12,
        }}
      >
        <HomeActions />
      </View>

      <QRCodeModal
        visible={Boolean(qrCardId)}
        cardName={cards.find((card) => card.id === qrCardId)?.name ?? 'ProsCard'}
        url={share.url}
        error={share.error instanceof Error ? share.error.message : undefined}
        onClose={() => setQrCardId(null)}
      />
    </View>
  );
}
