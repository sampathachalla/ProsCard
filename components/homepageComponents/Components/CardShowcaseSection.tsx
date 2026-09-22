import { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut, useSharedValue } from 'react-native-reanimated';
import type { BusinessCard } from '@/components/cardsComponents/types/card.types';
import { BusinessCardCarousel } from './BusinessCardCarousel';
import { CardSectionHeader, type CardViewMode } from './CardSectionHeader';
import { CarouselFooter } from './CarouselFooter';
import { StackedCardView } from './StackedCardView';

type CardShowcaseSectionProps = {
  activeIndex: number;
  cards: BusinessCard[];
  onActiveIndexChange: (index: number) => void;
  onCardTitlePress: () => void;
};

export function CardShowcaseSection({
  activeIndex,
  cards,
  onActiveIndexChange,
  onCardTitlePress,
}: CardShowcaseSectionProps) {
  const carouselProgress = useSharedValue(0);
  const [viewMode, setViewMode] = useState<CardViewMode>('carousel');
  const activeCard = cards[activeIndex] ?? cards[0];

  const toggleViewMode = () => {
    setViewMode((currentMode) => (currentMode === 'carousel' ? 'stack' : 'carousel'));
  };

  return (
    <View>
      <View className="px-5 pb-2">
        <CardSectionHeader
          category={activeCard?.category ?? 'Card'}
          onCategoryPress={onCardTitlePress}
          onViewModeToggle={toggleViewMode}
          viewMode={viewMode}
        />
      </View>

      <Animated.View
        key={viewMode}
        entering={FadeIn.duration(180)}
        exiting={FadeOut.duration(120)}
      >
        {viewMode === 'carousel' ? (
          <BusinessCardCarousel
            activeIndex={activeIndex}
            cards={cards}
            progress={carouselProgress}
            onActiveIndexChange={onActiveIndexChange}
          />
        ) : (
          <StackedCardView
            activeIndex={activeIndex}
            cards={cards}
            onActiveIndexChange={onActiveIndexChange}
          />
        )}
      </Animated.View>

      <CarouselFooter activeIndex={activeIndex} count={cards.length} />
    </View>
  );
}
