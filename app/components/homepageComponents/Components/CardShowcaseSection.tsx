import { View } from 'react-native';
import Animated, { FadeIn, FadeOut, useSharedValue } from 'react-native-reanimated';
import type { BusinessCard } from '@/components/cardsComponents/types/card.types';
import type { Profile } from '@/components/profileComponents/types/profile.types';
import { BusinessCardCarousel } from './BusinessCardCarousel';
import type { CardViewMode } from '../types/cardViewMode';
import { CarouselFooter } from './CarouselFooter';
import { WalletStackView } from './StackedCardView';

type CardShowcaseSectionProps = {
  activeIndex: number;
  addingCard?: boolean;
  bottomInset: number;
  cards: BusinessCard[];
  height: number;
  onActiveIndexChange: (index: number) => void;
  onAddCard?: () => void;
  onCardDoubleTap?: (card: BusinessCard) => void;
  onCardSwipeDown?: (card: BusinessCard) => void;
  profile: Profile;
  viewMode: CardViewMode;
};

const FOOTER_HEIGHT = 38;

export function CardShowcaseSection({
  activeIndex,
  addingCard,
  bottomInset,
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
        {/* Carousel: `BusinessCard`. Stack: wallet pass (section 1 identity layout via `WalletDesignEngine`). */}
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
          <WalletStackView
            activeIndex={activeIndex}
            addingCard={addingCard}
            bottomInset={bottomInset + FOOTER_HEIGHT}
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
