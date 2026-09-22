import { useEffect, useRef } from 'react';
import { View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import Animated, {
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { BusinessCard as BusinessCardData } from '@/components/cardsComponents/types/card.types';
import { Text } from '@/components/uiComponents/Text';
import { BusinessCard } from './BusinessCard';
import { getBusinessCardHeight, getBusinessCardWidth } from '../Utils/businessCardLayout';

type BusinessCardCarouselProps = {
  activeIndex: number;
  cards: BusinessCardData[];
  progress: SharedValue<number>;
  onActiveIndexChange?: (index: number) => void;
};

const CARD_GAP = 14;
const SIDE_PADDING = 20;

function AnimatedCardWrapper({
  card,
  index,
  height,
  width,
  progress,
}: {
  card: BusinessCardData;
  index: number;
  height: number;
  width: number;
  progress: SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const distance = Math.abs(progress.value - index);
    const scale = interpolate(distance, [0, 1], [1, 0.94], 'clamp');
    const opacity = interpolate(distance, [0, 1], [1, 0.85], 'clamp');

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <BusinessCard card={card} height={height} width={width} />
    </Animated.View>
  );
}

export function BusinessCardCarousel({
  activeIndex,
  cards,
  progress,
  onActiveIndexChange,
}: BusinessCardCarouselProps) {
  const listRef = useRef<FlashListRef<BusinessCardData>>(null);
  const activeIndexRef = useRef(0);
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();

  const cardWidth = getBusinessCardWidth(windowWidth, cards.length);
  const cardHeight = getBusinessCardHeight(cardWidth, windowHeight);
  const interval = cardWidth + CARD_GAP;





  useEffect(() => {
    const boundedIndex = Math.max(0, Math.min(cards.length - 1, activeIndex));
    const shouldAnimate = boundedIndex !== activeIndexRef.current;

    activeIndexRef.current = boundedIndex;
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        offset: boundedIndex * interval,
        animated: shouldAnimate,
      });
      progress.set(boundedIndex);
    });
  }, [activeIndex, cards.length, interval, progress]);

  const updateProgress = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const rawProgress = event.nativeEvent.contentOffset.x / interval;
    progress.set(rawProgress);
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.max(
      0,
      Math.min(cards.length - 1, Math.round(event.nativeEvent.contentOffset.x / interval)),
    );
    if (nextIndex !== activeIndexRef.current) {
      activeIndexRef.current = nextIndex;
      Haptics.selectionAsync().catch(() => {});
    }
    progress.set(nextIndex);
    onActiveIndexChange?.(nextIndex);
  };

  if (cards.length === 0) {
    return (
      <View className="mx-5 min-h-80 items-center justify-center rounded-[32px] border border-dashed border-slate-300 bg-card px-8 dark:border-slate-700 dark:bg-dark-card">
        <Text variant="heading" className="text-center">
          No business cards found
        </Text>
        <Text variant="muted" className="mt-2 text-center">
          Create your first digital business card to begin networking.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ height: cardHeight + 16 }} className="justify-center py-2">
      <FlashList
        ref={listRef}
        accessibilityLabel="Business card carousel"
        contentOffset={{ x: 0, y: 0 }}
        data={cards}
        decelerationRate="fast"
        disableIntervalMomentum
        horizontal
        keyExtractor={(item) => item.id}
        maintainVisibleContentPosition={{ disabled: true }}
        onLoad={() => {
          requestAnimationFrame(() => {
            listRef.current?.scrollToOffset({
              offset: activeIndexRef.current * interval,
              animated: false,
            });
            progress.set(activeIndexRef.current);
          });
        }}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScroll={updateProgress}
        renderItem={({ item, index }) => (
          <AnimatedCardWrapper
            card={item}
            index={index}
            height={cardHeight}
            width={cardWidth}
            progress={progress}
          />
        )}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={interval}
        ListHeaderComponent={<View style={{ width: SIDE_PADDING }} />}
        ListFooterComponent={<View style={{ width: SIDE_PADDING }} />}
        ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
        contentContainerStyle={{ alignItems: 'center' }}
      />
    </View>
  );
}
