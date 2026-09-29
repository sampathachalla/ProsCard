import { useEffect, useMemo, useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import type { BusinessCard } from '@/components/cardsComponents/types/card.types';
import type { Profile } from '@/components/profileComponents/types/profile.types';
import {
  WalletCardRenderEngine,
  getWalletCardDimensions,
  resolveWalletCardWidth,
} from '@/components/cardsComponents/Wallet';
import { Text } from '@/components/uiComponents/Text';

/** Wallet view — section 1 + 2 via `WalletCardRenderEngine` (no flip). */
type StackedCardViewProps = {
  activeIndex: number;
  bottomInset: number;
  cards: BusinessCard[];
  height: number;
  onActiveIndexChange: (index: number) => void;
  onCardDoubleTap?: (card: BusinessCard) => void;
  onCardSwipeDown?: (card: BusinessCard) => void;
  profile: Profile;
};

const FOCUSED_CARD_TOP = 8;
const COLLAPSED_CARD_STEP = 36;
const COLLAPSED_STACK_VISIBLE_HEIGHT = 40;

type WalletStackItemProps = {
  card: BusinessCard;
  cardHeight: number;
  cardWidth: number;
  index: number;
  onPress: (index: number) => void;
  onDoubleTap: (index: number) => void;
  onSwipeDown: (index: number) => void;
  profile: Profile;
  selected: boolean;
  targetScale: number;
  targetY: number;
  zIndex: number;
};

function WalletStackItem({
  card,
  cardHeight,
  cardWidth,
  index,
  onPress,
  onDoubleTap,
  onSwipeDown,
  profile,
  selected,
  targetScale,
  targetY,
  zIndex,
}: WalletStackItemProps) {
  const translateY = useSharedValue(targetY);
  const scale = useSharedValue(targetScale);

  useEffect(() => {
    translateY.set(
      withSpring(targetY, {
        damping: 18,
        mass: 0.85,
        stiffness: 170,
      }),
    );
    scale.set(
      withSpring(targetScale, {
        damping: 18,
        mass: 0.85,
        stiffness: 170,
      }),
    );
  }, [scale, targetScale, targetY, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.get() }, { scale: scale.get() }],
  }));

  return (
    <Animated.View
      style={[
        {
          alignItems: 'center',
          position: 'absolute',
          top: 0,
          width: '100%',
          zIndex,
        },
        animatedStyle,
      ]}
    >
      <WalletCardRenderEngine
        card={card}
        profile={profile}
        width={cardWidth}
        height={cardHeight}
        onDoubleTap={() => onDoubleTap(index)}
        onSwipeDown={() => onSwipeDown(index)}
        onSingleTap={() => onPress(index)}
      />
    </Animated.View>
  );
}

/** Stacked homepage layout — each card is a wallet pass (sections 1 + 2). */
export function WalletStackView({
  activeIndex,
  bottomInset,
  cards,
  height,
  onActiveIndexChange,
  onCardDoubleTap,
  onCardSwipeDown,
  profile,
}: StackedCardViewProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const containerHeight = height;
  const passVerticalBudget = Math.max(0, containerHeight - bottomInset - FOCUSED_CARD_TOP - 8);
  const cardWidth = resolveWalletCardWidth({
    windowWidth,
    availableHeight: passVerticalBudget,
  });
  const cardHeight = getWalletCardDimensions(cardWidth).height;
  const defaultStackStep =
    cards.length > 1
      ? Math.max(
          0,
          (containerHeight - cardHeight - FOCUSED_CARD_TOP) / (cards.length - 1),
        )
      : 0;

  const collapsedCardOrder = useMemo(() => {
    return cards
      .map((_, index) => index)
      .filter((index) => index !== expandedIndex);
  }, [cards, expandedIndex]);
  const collapsedStackTop = Math.max(
    FOCUSED_CARD_TOP,
    containerHeight -
      bottomInset -
      COLLAPSED_STACK_VISIBLE_HEIGHT -
      Math.max(0, collapsedCardOrder.length - 1) * COLLAPSED_CARD_STEP,
  );

  const selectCard = (index: number) => {
    if (index === expandedIndex) return;

    setExpandedIndex(index);
    onActiveIndexChange(index);
  };

  const openCard = (index: number) => {
    onCardDoubleTap?.(cards[index]);
  };

  const showQr = (index: number) => {
    onCardSwipeDown?.(cards[index]);
  };

  const collapseStack = () => {
    if (expandedIndex === null) return;
    setExpandedIndex(null);
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
    <View
      accessibilityLabel={`Wallet stack with ${cards.length} cards`}
      className="overflow-hidden"
      style={{ height: containerHeight }}
    >
      {expandedIndex !== null ? (
        <Pressable
          accessibilityLabel="Return to the wallet stack"
          accessibilityRole="button"
          className="absolute inset-0"
          onPress={collapseStack}
        />
      ) : null}

      {cards.map((card, index) => {
        const isExpanded = expandedIndex !== null;
        const selected = index === expandedIndex;
        const collapsedIndex = collapsedCardOrder.indexOf(index);
        const stackRank =
          (index - activeIndex + cards.length) % cards.length;
        const targetY = isExpanded
          ? selected
            ? FOCUSED_CARD_TOP
            : collapsedStackTop + collapsedIndex * COLLAPSED_CARD_STEP
          : FOCUSED_CARD_TOP +
            (cards.length - 1 - stackRank) * defaultStackStep;
        const targetScale = isExpanded && !selected
          ? 0.94 + collapsedIndex * 0.015
          : 1;
        const zIndex = isExpanded
          ? selected
            ? cards.length + 1
            : collapsedIndex + 1
          : cards.length - stackRank;

        return (
          <WalletStackItem
            key={card.id}
            card={card}
            cardHeight={cardHeight}
            cardWidth={cardWidth}
            index={index}
            onDoubleTap={openCard}
            onSwipeDown={showQr}
            onPress={selectCard}
            profile={profile}
            selected={selected}
            targetScale={targetScale}
            targetY={targetY}
            zIndex={zIndex}
          />
        );
      })}
    </View>
  );
}

/** @deprecated Use `WalletStackView` — stack mode is wallet-only. */
export const StackedCardView = WalletStackView;
