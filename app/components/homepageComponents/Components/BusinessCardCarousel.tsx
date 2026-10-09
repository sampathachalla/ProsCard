import { useEffect, useRef, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { Plus } from 'lucide-react-native';
import Animated, {
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { BusinessCard as BusinessCardData } from '@/components/cardsComponents/types/card.types';
import type { Profile } from '@/components/profileComponents/types/profile.types';
import { Text } from '@/components/uiComponents/Text';
import { BusinessCard } from './BusinessCard';
import { getBusinessCardHeight, getBusinessCardWidth } from '../Utils/businessCardLayout';

type BusinessCardCarouselProps = {
  activeIndex: number;
  addingCard?: boolean;
  cards: BusinessCardData[];
  height: number;
  progress: SharedValue<number>;
  onActiveIndexChange?: (index: number) => void;
  onAddCard?: () => void;
  onCardDoubleTap?: (card: BusinessCardData) => void;
  onCardSwipeDown?: (card: BusinessCardData) => void;
  profile: Profile;
};

const CARD_GAP = 14;
const SIDE_PADDING = 20;
const CARD_VERTICAL_PADDING = 12;
const ADD_CARD_KEY = '__add-card__';

type CarouselItem = { kind: 'card'; card: BusinessCardData } | { kind: 'add' };

/** Always the last carousel item: creates a new card in the default design. */
function AddCardTile({ adding, height, onPress, width }: { adding: boolean; height: number; onPress?: () => void; width: number }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Add a new card"
      accessibilityState={{ busy: adding, disabled: adding }}
      disabled={adding}
      onPress={onPress}
      style={{ width, height }}
      className="items-center justify-center rounded-[32px] border-2 border-dashed border-slate-300 bg-card/60 px-8 active:opacity-80 dark:border-slate-600 dark:bg-dark-card/60"
    >
      <View className="mb-5 h-16 w-16 items-center justify-center rounded-full bg-primary dark:bg-dark-primary">
        {adding ? <ActivityIndicator color="#ffffff" /> : <Plus color="#ffffff" size={30} strokeWidth={2.4} />}
      </View>
      <Text variant="heading" className="text-center">
        {adding ? 'Creating card…' : 'Add card'}
      </Text>
      <Text variant="muted" className="mt-2 text-center">
        Starts with the default design. Customize its theme and layout anytime.
      </Text>
    </Pressable>
  );
}

function AnimatedCardWrapper({
  children,
  index,
  progress,
}: {
  children: ReactNode;
  index: number;
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
    <Animated.View style={animatedStyle}>{children}</Animated.View>
  );
}

export function BusinessCardCarousel({
  activeIndex,
  addingCard = false,
  cards,
  height,
  progress,
  onActiveIndexChange,
  onAddCard,
  onCardDoubleTap,
  onCardSwipeDown,
  profile,
}: BusinessCardCarouselProps) {
  const listRef = useRef<FlashListRef<CarouselItem>>(null);
  const activeIndexRef = useRef(0);
  const { width: windowWidth } = useWindowDimensions();

  const items: CarouselItem[] = [...cards.map((card) => ({ kind: 'card' as const, card })), { kind: 'add' }];
  const cardAvailableHeight = Math.max(0, height - CARD_VERTICAL_PADDING * 2);
  const cardWidth = getBusinessCardWidth(windowWidth, items.length, cardAvailableHeight);
  const cardHeight = getBusinessCardHeight(cardWidth, cardAvailableHeight);
  const interval = cardWidth + CARD_GAP;
  useEffect(() => {
    const boundedIndex = Math.max(0, Math.min(items.length - 1, activeIndex));
    const shouldAnimate = boundedIndex !== activeIndexRef.current;

    activeIndexRef.current = boundedIndex;
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        offset: boundedIndex * interval,
        animated: shouldAnimate,
      });
      progress.set(boundedIndex);
    });
  }, [activeIndex, items.length, interval, progress]);

  const updateProgress = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const rawProgress = event.nativeEvent.contentOffset.x / interval;
    progress.set(rawProgress);
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.max(
      0,
      Math.min(items.length - 1, Math.round(event.nativeEvent.contentOffset.x / interval)),
    );
    if (nextIndex !== activeIndexRef.current) {
      activeIndexRef.current = nextIndex;
      Haptics.selectionAsync().catch(() => {});
    }
    progress.set(nextIndex);
    onActiveIndexChange?.(nextIndex);
  };

  return (
    <View style={{ height, paddingVertical: CARD_VERTICAL_PADDING }} className="justify-center">
      <FlashList
        ref={listRef}
        accessibilityLabel="Business card carousel"
        contentOffset={{ x: 0, y: 0 }}
        data={items}
        decelerationRate="fast"
        disableIntervalMomentum
        horizontal
        keyExtractor={(item) => (item.kind === 'card' ? item.card.id : ADD_CARD_KEY)}
        getItemType={(item) => item.kind}
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
          <AnimatedCardWrapper index={index} progress={progress}>
            {item.kind === 'card' ? (
              <BusinessCard
                card={item.card}
                height={cardHeight}
                onDoubleTap={() => onCardDoubleTap?.(item.card)}
                onSwipeDown={() => onCardSwipeDown?.(item.card)}
                profile={profile}
                width={cardWidth}
              />
            ) : (
              <AddCardTile adding={addingCard} height={cardHeight} onPress={onAddCard} width={cardWidth} />
            )}
          </AnimatedCardWrapper>
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
