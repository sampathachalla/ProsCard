import { useRef, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type BottomSheet from '@gorhom/bottom-sheet';
import { useCards } from '@/components/cardsComponents/Hooks/useCards';
import { CardShowcaseSection } from '@/components/homepageComponents/Components/CardShowcaseSection';
import { CategoryBottomSheet } from '@/components/homepageComponents/Components/CategoryBottomSheet';
import {
  CardSectionHeader,
  type CardViewMode,
} from '@/components/homepageComponents/Components/CardSectionHeader';
import { HomeActions } from '@/components/homepageComponents/Components/HomeActions';
import { HomeHeader } from '@/components/homepageComponents/Components/HomeHeader';
import { useThemeContext } from '@/context/ThemeContext';
import { useProfileSnapshot } from '@/components/profileComponents/Hooks/useProfileSnapshot';
import { QRCodeModal } from '@/components/uiComponents/QRCodeModal';

export default function HomepageScreen() {
  const { cards } = useCards();
  const [actionBarHeight, setActionBarHeight] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [showcaseHeight, setShowcaseHeight] = useState(0);
  const [viewMode, setViewMode] = useState<CardViewMode>('carousel');
  const [qrCardId, setQrCardId] = useState<string | null>(null);
  const { profile } = useProfileSnapshot();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useThemeContext();

  const categorySheetRef = useRef<BottomSheet>(null);

  const currentCard = cards[activeCardIndex] ?? cards[0];
  const userName = currentCard?.name ?? 'ProsCard User';

  const handleOpenCategorySheet = () => {
    categorySheetRef.current?.expand();
  };

  const handleShowcaseLayout = (event: LayoutChangeEvent) => {
    const nextHeight = Math.round(event.nativeEvent.layout.height);
    setShowcaseHeight((currentHeight) =>
      currentHeight === nextHeight ? currentHeight : nextHeight,
    );
  };

  const handleActionBarLayout = (event: LayoutChangeEvent) => {
    const nextHeight = Math.round(event.nativeEvent.layout.height);
    setActionBarHeight((currentHeight) =>
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

      <View className="px-5 pb-2">
        <CardSectionHeader
          category={currentCard?.category ?? 'Card'}
          onCategoryPress={handleOpenCategorySheet}
          onViewModeToggle={() => {
            setViewMode((currentMode) =>
              currentMode === 'carousel' ? 'stack' : 'carousel',
            );
          }}
          viewMode={viewMode}
        />
      </View>

      <View
        className="flex-1 overflow-hidden"
        onLayout={handleShowcaseLayout}
      >
        {showcaseHeight > 0 ? (
          <CardShowcaseSection
            activeIndex={activeCardIndex}
            bottomInset={actionBarHeight}
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

      <BlurView
        blurMethod="dimezisBlurView"
        intensity={38}
        onLayout={handleActionBarLayout}
        tint={theme}
        style={{
          backgroundColor:
            theme === 'dark' ? 'rgba(2, 6, 23, 0.32)' : 'rgba(255, 255, 255, 0.36)',
          borderTopColor:
            theme === 'dark' ? 'rgba(148, 163, 184, 0.18)' : 'rgba(203, 213, 225, 0.7)',
          borderTopWidth: 1,
          bottom: 0,
          left: 0,
          paddingBottom: Math.max(insets.bottom + 8, 16),
          paddingHorizontal: 20,
          paddingTop: 12,
          position: 'absolute',
          right: 0,
          zIndex: 20,
        }}
      >
        <HomeActions />
      </BlurView>

      {/* Interactive Bottom Sheets */}
      <CategoryBottomSheet
        ref={categorySheetRef}
        cards={cards}
        selectedIndex={activeCardIndex}
        onSelectCard={setActiveCardIndex}
      />
      <QRCodeModal
        visible={Boolean(qrCardId)}
        cardName={cards.find((card) => card.id === qrCardId)?.name ?? 'ProsCard'}
        url={`https://proscard.app/card/${qrCardId ?? ''}`}
        onClose={() => setQrCardId(null)}
      />
    </View>
  );
}
