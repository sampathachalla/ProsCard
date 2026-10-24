import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View, type LayoutChangeEvent } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCards } from '@/pages/cards/Hooks/useCards';
import { CardShowcaseSection } from '@/pages/home/Components/CardShowcaseSection';
import { useCardViewPreference } from '@/pages/home/Hooks/useCardViewPreference';
import { HomeActions } from '@/pages/home/Components/HomeActions';
import { HomeHeader } from '@/pages/home/Components/HomeHeader';
import { useProfileSnapshot } from '@/pages/profile/Hooks/useProfileSnapshot';
import { QRCodeModal } from '@/common/ui/QRCodeModal';
import { useShareUrl } from '@/pages/share/Hooks/useShareUrl';
import { ensureDefaultCard } from '@/pages/cards/Services/cardsService';
import { showMessage } from '@/common/ui/confirmAction';
import { BrandLogo } from '@/common/ui/BrandLogo';
import { Text } from '@/common/ui/Text';
import { resolveDisplayMediaUrls } from '@/pages/profile/Services/mediaService';
import { resolveCoverPhotoPreset } from '@/pages/cards/Services/coverPhotoPresets';

function HomeLoadingScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View
      accessibilityLabel="Loading your VC Pros cards"
      accessibilityRole="progressbar"
      className="flex-1 items-center justify-center bg-background px-8 dark:bg-dark-background"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <BrandLogo size="xl" />
      <ActivityIndicator className="mt-8" size="large" />
      <Text className="mt-4 text-center text-base font-semibold">Preparing your cards…</Text>
      <Text className="mt-1 text-center text-sm text-textMuted dark:text-dark-textMuted">
        Loading your profile, photos, and logos
      </Text>
    </View>
  );
}

export default function HomepageScreen() {
  const { cards, fetched, initialFetchComplete: cardsFetched, error: cardsError, offline } = useCards();
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [showcaseHeight, setShowcaseHeight] = useState(0);
  const { hydrated: viewModeHydrated, viewMode } = useCardViewPreference();
  const [qrCardId, setQrCardId] = useState<string | null>(null);
  const share = useShareUrl(qrCardId);
  const { profile, fetched: profileFetched } = useProfileSnapshot();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [readyMediaKey, setReadyMediaKey] = useState<string | null>(null);

  const initialMediaUrls = useMemo(() => [
    profile.photoUrl,
    profile.coverPhotoUrl,
    profile.companyLogoUrl,
    ...cards.flatMap((card) => [
      card.sectionOverrides.profilePhoto,
      card.sectionOverrides.coverPhoto,
      card.sectionOverrides.logo,
    ]),
  ].filter(
    (url): url is string =>
      typeof url === 'string' && url.length > 0 && !resolveCoverPhotoPreset(url),
  ), [cards, profile]);
  const mediaKey = useMemo(() => JSON.stringify(initialMediaUrls), [initialMediaUrls]);
  const mediaReady = readyMediaKey === mediaKey;

  useEffect(() => {
    if (!cardsFetched || !profileFetched) return;
    let active = true;
    resolveDisplayMediaUrls(initialMediaUrls)
      .then(async (urls) => {
        await Promise.all(urls.map((url) => Image.prefetch(url, 'memory-disk').catch(() => false)));
      })
      .catch(() => {})
      .finally(() => {
        if (active) setReadyMediaKey(mediaKey);
      });
    return () => { active = false; };
  }, [cardsFetched, initialMediaUrls, mediaKey, profileFetched]);

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
    router.push({
      pathname: '/(tabs)/editViewPage',
      params: { create: '1', creationSession: Date.now().toString(), origin: 'home' },
    });
  };

  const currentCard = cards[activeCardIndex] ?? cards[0];
  const userName = currentCard?.name ?? 'VC Pros User';

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

  if (!cardsFetched || !profileFetched || !viewModeHydrated || !mediaReady) {
    return <HomeLoadingScreen />;
  }

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <View
        className="px-5 pb-1"
        style={{ paddingTop: Math.max(insets.top, 12) }}
      >
        <HomeHeader userName={userName} />
      </View>

      <View
        className="flex-1 overflow-hidden"
        style={{ marginTop: 0 }}
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
        cardName={cards.find((card) => card.id === qrCardId)?.name ?? 'VC Pros'}
        url={share.url}
        error={share.error instanceof Error ? share.error.message : undefined}
        onClose={() => setQrCardId(null)}
      />
    </View>
  );
}
