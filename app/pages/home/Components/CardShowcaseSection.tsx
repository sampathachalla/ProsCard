import { View } from 'react-native';
import Animated, { FadeIn, FadeOut, useSharedValue } from 'react-native-reanimated';
import type { BusinessCard } from '@/pages/cards/types/card.types';
import type { Profile } from '@/pages/profile/types/profile.types';
import { BusinessCardCarousel } from './BusinessCardCarousel';
import type { CardViewMode } from '../types/cardViewMode';
import { WalletStackView } from '@/pages/walletCard';

type CardShowcaseSectionProps = {
  activeIndex: number;
  addingCard?: boolean;
  cards: BusinessCard[];
  height: number;
  onActiveIndexChange: (index: number) => void;
  onAddCard?: () => void;
  onCardDoubleTap?: (card: BusinessCard) => void;
  onCardSingleTap?: (card: BusinessCard) => void;
  onCardSwipeDown?: (card: BusinessCard) => void;
  profile: Profile;
  viewMode: CardViewMode;
  includeAddTile?: boolean;
};

export function CardShowcaseSection({
  activeIndex,
  addingCard,
  cards,
  height,
  onActiveIndexChange,
  onAddCard,
  onCardDoubleTap,
  onCardSingleTap,
  onCardSwipeDown,
  profile,
  viewMode,
  includeAddTile = true,
}: CardShowcaseSectionProps) {
  const carouselProgress = useSharedValue(0);
  const contentHeight = height;

  return (
    <View style={{ height }}>
      <Animated.View
        key={viewMode}
        entering={FadeIn.duration(180)}
        exiting={FadeOut.duration(120)}
        style={{ height: contentHeight }}
      >
        {/* Carousel keeps the full-card preview. Stack reuses the wallet cards from Manage Cards. */}
        {viewMode === 'carousel' ? (
          <BusinessCardCarousel
            activeIndex={activeIndex}
            addingCard={addingCard}
            cards={cards}
            height={contentHeight}
            progress={carouselProgress}
            onActiveIndexChange={onActiveIndexChange}
            onAddCard={onAddCard}
            onCardDoubleTap={onCardDoubleTap}
            onCardSingleTap={onCardSingleTap}
            onCardSwipeDown={onCardSwipeDown}
            profile={profile}
            includeAddTile={includeAddTile}
          />
        ) : (
          <WalletStackView
            activeIndex={activeIndex}
            addingCard={addingCard}
            bottomInset={0}
            cards={cards}
            height={contentHeight}
            onActiveIndexChange={onActiveIndexChange}
            onAddCard={onAddCard}
            onCardDoubleTap={onCardDoubleTap}
            onCardSingleTap={onCardSingleTap}
            onCardSwipeDown={onCardSwipeDown}
            profile={profile}
            showAddCardPass={includeAddTile}
            showPrimaryTag
          />
        )}
      </Animated.View>

    </View>
  );
}
