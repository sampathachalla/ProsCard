import { View } from 'react-native';
import Animated, { FadeIn, FadeOut, useSharedValue } from 'react-native-reanimated';
import type { BusinessCard } from '@/components/cardsComponents/types/card.types';
import type { Profile } from '@/components/profileComponents/types/profile.types';
import { BusinessCardCarousel } from './BusinessCardCarousel';
import type { CardViewMode } from './CardSectionHeader';
import { CarouselFooter } from './CarouselFooter';
import { StackedCardView } from './StackedCardView';

type CardShowcaseSectionProps = {
  activeIndex: number;
  bottomInset: number;
  cards: BusinessCard[];
  height: number;
  onActiveIndexChange: (index: number) => void;
  onCardDoubleTap?: (card: BusinessCard) => void;
  onCardSwipeDown?: (card: BusinessCard) => void;
  profile: Profile;
  viewMode: CardViewMode;
};

const FOOTER_HEIGHT = 38;

export function CardShowcaseSection({
  activeIndex,
  bottomInset,
  cards,
  height,
  onActiveIndexChange,
  onCardDoubleTap,
  onCardSwipeDown,
  profile,
  viewMode,
}: CardShowcaseSectionProps) {
  const carouselProgress = useSharedValue(0);
  const contentHeight =
    viewMode === 'stack'
      ? height
      : Math.max(0, height - FOOTER_HEIGHT - bottomInset);

  return (
    <View style={{ height }}>
      <Animated.View
        key={viewMode}
        entering={FadeIn.duration(180)}
        exiting={FadeOut.duration(120)}
        style={{ height: contentHeight }}
      >
        {viewMode === 'carousel' ? (
          <BusinessCardCarousel
            activeIndex={activeIndex}
            cards={cards}
            height={contentHeight}
            progress={carouselProgress}
            onActiveIndexChange={onActiveIndexChange}
            onCardDoubleTap={onCardDoubleTap}
            onCardSwipeDown={onCardSwipeDown}
            profile={profile}
          />
        ) : (
          <StackedCardView
            activeIndex={activeIndex}
            bottomInset={bottomInset + FOOTER_HEIGHT}
            cards={cards}
            height={contentHeight}
            onActiveIndexChange={onActiveIndexChange}
            onCardDoubleTap={onCardDoubleTap}
            onCardSwipeDown={onCardSwipeDown}
            profile={profile}
          />
        )}
      </Animated.View>

      <View
        style={{
          bottom: bottomInset,
          left: 0,
          pointerEvents: 'none',
          position: 'absolute',
          right: 0,
        }}
      >
        <CarouselFooter activeIndex={activeIndex} count={cards.length} />
      </View>
    </View>
  );
}
