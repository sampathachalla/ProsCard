import { View } from 'react-native';
import Animated, { FadeIn, FadeOut, useSharedValue } from 'react-native-reanimated';
import type { BusinessCard } from '@/components/cardsComponents/types/card.types';
import type { Profile } from '@/components/profileComponents/types/profile.types';
import { BusinessCardCarousel } from './BusinessCardCarousel';
import type { CardViewMode } from '../types/cardViewMode';
import { StackedCardView } from './StackedCardView';

type CardShowcaseSectionProps = {
  activeIndex: number;
  addingCard?: boolean;
  cards: BusinessCard[];
  height: number;
  onActiveIndexChange: (index: number) => void;
  onAddCard?: () => void;
  onCardDoubleTap?: (card: BusinessCard) => void;
  onCardSwipeDown?: (card: BusinessCard) => void;
  profile: Profile;
  viewMode: CardViewMode;
};

export function CardShowcaseSection({
  activeIndex,
  addingCard,
  cards,
  height,
  onActiveIndexChange,
  onAddCard,
  onCardDoubleTap,
  onCardSwipeDown,
  profile,
  viewMode,
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
        {/* Carousel: horizontal `BusinessCard`. Stack: vertically stacked `BusinessCard`. */}
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
            onCardSwipeDown={onCardSwipeDown}
            profile={profile}
          />
        ) : (
          <StackedCardView
            activeIndex={activeIndex}
            addingCard={addingCard}
            bottomInset={0}
            cards={cards}
            height={contentHeight}
            onActiveIndexChange={onActiveIndexChange}
            onAddCard={onAddCard}
            onCardDoubleTap={onCardDoubleTap}
            onCardSwipeDown={onCardSwipeDown}
            profile={profile}
          />
        )}
      </Animated.View>

    </View>
  );
}
