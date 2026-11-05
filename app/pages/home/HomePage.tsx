import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, View, type LayoutChangeEvent } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type BottomSheet from '@gorhom/bottom-sheet';

import { useCards } from '@/pages/cards/Hooks/useCards';
import { CardShowcaseSection } from '@/pages/home/Components/CardShowcaseSection';
import { CategoryBottomSheet } from '@/pages/home/Components/CategoryBottomSheet';
import { HomeCardToolbar } from '@/pages/home/Components/HomeCardToolbar';
import { HomeHeader } from '@/pages/home/Components/HomeHeader';
import { HomeScreenLayout } from '@/pages/home/Components/HomeScreenLayout';
import { useCardViewPreference } from '@/pages/home/Hooks/useCardViewPreference';
import { useProfileSnapshot } from '@/pages/profile/Hooks/useProfileSnapshot';
import { ensureDefaultCard } from '@/pages/cards/Services/cardsService';
import { navigateToCardEditor } from '@/pages/cards/Utils/navigateToCardEditor';
import { resolveCardTagLabel } from '@/pages/cards/Utils/resolveCardTagLabel';
import { getHomeTabBarLayoutHeight } from '@/pages/home/Utils/homeTabBarLayout';
import { showMessage } from '@/common/ui/confirmAction';
import { BrandLogo } from '@/common/ui/BrandLogo';
import { Text } from '@/common/ui/Text';
import { resolveDisplayMediaUrls } from '@/pages/profile/Services/mediaService';
import { resolveCoverPhotoPreset } from '@/pages/cards/Services/coverPhotoPresets';
import type { BusinessCard } from '@/pages/cards/types/card.types';
import { navigateToSharePreview } from '@/pages/share/Utils/navigateToSharePreview';
import { ensureCardLiveActivity } from '@/pages/share/Services/liveActivityService';

/** Longest the first load waits for images; a slow network shows the card with images still arriving. */
const INITIAL_MEDIA_WAIT_MS = 6_000;

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
  const { hydrated: viewModeHydrated } = useCardViewPreference();
  const { profile, fetched: profileFetched } = useProfileSnapshot();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [mediaReady, setMediaReady] = useState(false);
  const cardPickerRef = useRef<BottomSheet>(null);

  const initialMediaUrls = useMemo(
    () =>
      [
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
      ),
    [cards, profile],
  );

  // Only the first load waits behind the loading screen. Later changes (a new photo, a saved card) load
  // in place, so the carousel is not torn down and does not jump back to another card.
  useEffect(() => {
    if (mediaReady || !cardsFetched || !profileFetched) return;
    let active = true;
    const finish = () => {
      if (active) setMediaReady(true);
    };
    const timer = setTimeout(finish, INITIAL_MEDIA_WAIT_MS);
    resolveDisplayMediaUrls(initialMediaUrls)
      .then(async (urls) => {
        await Promise.all(urls.map((url) => Image.prefetch(url, 'memory-disk').catch(() => false)));
      })
      .catch(() => {})
      .finally(finish);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [cardsFetched, initialMediaUrls, mediaReady, profileFetched]);

  const [defaultCardFailed, setDefaultCardFailed] = useState(false);
  // Waits for the profile too: the first card is filled from it, and a blank one would stay blank.
  const needsDefaultCard = fetched && profileFetched && !cardsError && !offline && cards.length === 0 && !defaultCardFailed;
  useEffect(() => {
    if (!needsDefaultCard) return;
    ensureDefaultCard(profile).catch((reason) => {
      setDefaultCardFailed(true);
      showMessage(
        'Could not create your card',
        reason instanceof Error ? reason.message : 'Try again with the add button.',
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsDefaultCard]);

  const boundedCardIndex =
    cards.length > 0 ? Math.min(activeCardIndex, cards.length - 1) : 0;
  const currentCard = cards[boundedCardIndex] ?? cards[0];
  const primaryCard = cards.find((card) => card.isPrimary) ?? cards[0];

  useEffect(() => {
    if (!cardsFetched || !primaryCard) return;
    void ensureCardLiveActivity({
      cardName: primaryCard.name || profile.fullName || 'My VC Card',
      qrSvg: null,
      shareUrl: `vcpros://sharePage?cardId=${encodeURIComponent(primaryCard.id)}`,
    }).catch(() => {
      // Live Activities may be disabled in iOS Settings; the app remains fully usable.
    });
  }, [cardsFetched, primaryCard?.id, primaryCard?.name, profile.fullName]);

  const cardTag = useMemo(() => {
    if (!currentCard) return needsDefaultCard ? 'Creating card…' : 'My card';
    return resolveCardTagLabel(currentCard);
  }, [currentCard, needsDefaultCard]);

  const handleAddCard = () => {
    if (offline) {
      showMessage('You are offline', 'Reconnect to create a new card.');
      return;
    }
    navigateToCardEditor(router, { create: true });
  };

  const handleEditCard = () => {
    if (!currentCard) return;
    navigateToCardEditor(router, { cardId: currentCard.id });
  };

  const handleOpenCardInApp = useCallback(
    (card: BusinessCard) => {
      router.push({
        pathname: '/cards/[cardId]',
        params: { cardId: card.id },
      });
    },
    [router],
  );

  const handleOpenWebPreview = useCallback(
    async (card: BusinessCard) => {
      try {
        await navigateToSharePreview(card.id);
      } catch (reason) {
        Alert.alert(
          'Could not open preview',
          reason instanceof Error ? reason.message : 'Try again in a moment.',
        );
      }
    },
    [],
  );

  const handlePreviewCard = () => {
    if (!currentCard) return;
    void handleOpenWebPreview(currentCard);
  };

  const handleShowcaseLayout = (event: LayoutChangeEvent) => {
    const nextHeight = Math.round(event.nativeEvent.layout.height);
    setShowcaseHeight((currentHeight) =>
      currentHeight === nextHeight ? currentHeight : nextHeight,
    );
  };

  const openCardPicker = () => {
    cardPickerRef.current?.snapToIndex(0);
  };

  if (!cardsFetched || !profileFetched || !viewModeHydrated || !mediaReady) {
    return <HomeLoadingScreen />;
  }

  const hasCard = Boolean(currentCard);

  const tabBarLayoutHeight = getHomeTabBarLayoutHeight(insets.bottom);

  const previewContent = (
    <View
      className="flex-1"
      onLayout={handleShowcaseLayout}
      style={{ paddingBottom: tabBarLayoutHeight }}
    >
      {showcaseHeight > 0 && needsDefaultCard ? (
        <View
          className="mx-5 items-center justify-center rounded-[28px] bg-slate-100/60 dark:bg-dark-card/40"
          style={{ height: showcaseHeight }}
        >
          <ActivityIndicator size="large" />
          <Text className="mt-4 text-center text-base font-semibold">Creating your card…</Text>
        </View>
      ) : null}
      {showcaseHeight > 0 && !hasCard && !needsDefaultCard ? (
        <View
          className="mx-5 items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-100/60 px-6 dark:border-slate-600 dark:bg-dark-card/40"
          style={{ height: showcaseHeight }}
        >
          <Text className="text-center text-base font-semibold">No card yet</Text>
          <Text className="mt-2 text-center text-sm text-textMuted dark:text-dark-textMuted">
            Tap + in the header to create your first card.
          </Text>
        </View>
      ) : null}
      {showcaseHeight > 0 && hasCard ? (
        <View style={{ height: showcaseHeight }}>
          <CardShowcaseSection
            activeIndex={boundedCardIndex}
            addingCard={needsDefaultCard}
            cards={cards}
            height={showcaseHeight}
            includeAddTile={false}
            onActiveIndexChange={setActiveCardIndex}
            onAddCard={handleAddCard}
            onCardSingleTap={handleOpenCardInApp}
            profile={profile}
            viewMode="carousel"
          />
        </View>
      ) : null}
    </View>
  );

  return (
    <>
      <HomeScreenLayout
        topInset={Math.max(insets.top, 8)}
        header={
          <HomeHeader
            cardTag={cardTag}
            addingCard={needsDefaultCard}
            addDisabled={offline}
            cardTagSelectable={cards.length > 1}
            onAddCard={handleAddCard}
            onCardTagPress={cards.length > 1 ? openCardPicker : undefined}
          />
        }
        toolbar={
          <HomeCardToolbar
            disabled={!hasCard}
            onEdit={handleEditCard}
            onPreview={handlePreviewCard}
          />
        }
        preview={previewContent}
      />

      {cards.length > 1 ? (
        <CategoryBottomSheet
          ref={cardPickerRef}
          cards={cards}
          profile={profile}
          selectedIndex={boundedCardIndex}
          onSelectCard={setActiveCardIndex}
        />
      ) : null}
    </>
  );
}
