import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, View, useWindowDimensions } from 'react-native';
import { Plus } from 'lucide-react-native';
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
  addingCard?: boolean;
  bottomInset: number;
  cards: BusinessCard[];
  height: number;
  onActiveIndexChange: (index: number) => void;
  onAddCard?: () => void;
  onCardDoubleTap?: (card: BusinessCard) => void;
  onCardSwipeDown?: (card: BusinessCard) => void;
  profile: Profile;
};

const FOCUSED_CARD_TOP = 8;
const COLLAPSED_CARD_STEP = 36;
const COLLAPSED_STACK_VISIBLE_HEIGHT = 40;

type StackSlotProps = {
  children: ReactNode;
  targetScale: number;
  targetY: number;
  zIndex: number;
};

/** Positions one pass in the stack and springs it to its target position. */
function StackSlot({ children, targetScale, targetY, zIndex }: StackSlotProps) {
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
      {children}
    </Animated.View>
  );
}

/** Last pass in the stack: creates a card in the default design. Its label sits in the strip that peeks out. */
function AddCardPass({ adding, cardHeight, cardWidth, onPress }: { adding: boolean; cardHeight: number; cardWidth: number; onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Add a new card"
      accessibilityState={{ busy: adding, disabled: adding }}
      disabled={adding}
      onPress={onPress}
      style={{ width: cardWidth, height: cardHeight }}
      className="overflow-hidden rounded-[28px] border-2 border-dashed border-slate-300 bg-card px-5 pt-3 active:opacity-90 dark:border-slate-600 dark:bg-dark-card"
    >
      <View className="flex-row items-center gap-3">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-primary dark:bg-dark-primary">
          {adding ? <ActivityIndicator color="#ffffff" size="small" /> : <Plus color="#ffffff" size={20} strokeWidth={2.6} />}
        </View>
        <Text className="text-base font-bold text-textPrimary dark:text-dark-textPrimary">
          {adding ? 'Creating card…' : 'Add card'}
        </Text>
      </View>
      <View className="flex-1 items-center justify-center px-4">
        <Text variant="muted" className="text-center">
          Starts with the default design. Customize its theme and layout anytime.
        </Text>
      </View>
    </Pressable>
  );
}

/**
 * Front-to-back position of a slot (0 = front). Cards rotate among themselves and the
 * "Add card" pass (slot `cardCount`) stays behind them, unless it is the active slot.
 */
export function stackRankFor(index: number, activeIndex: number, cardCount: number): number {
  if (activeIndex >= cardCount) return index === cardCount ? 0 : cardCount - index;
  if (index === cardCount) return cardCount;
  return (index - activeIndex + cardCount) % cardCount;
}

/** Stacked homepage layout — each card is a wallet pass (sections 1 + 2). */
export function WalletStackView({
  activeIndex: requestedActiveIndex,
  addingCard = false,
  bottomInset,
  cards,
  height,
  onActiveIndexChange,
  onAddCard,
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
  // Slots are every card plus the "Add card" pass, which is always the last slot.
  const slotCount = cards.length + 1;
  const addSlotIndex = cards.length;
  const activeIndex = Math.max(0, Math.min(requestedActiveIndex, slotCount - 1));
  const defaultStackStep =
    slotCount > 1
      ? Math.max(
          0,
          (containerHeight - cardHeight - FOCUSED_CARD_TOP) / (slotCount - 1),
        )
      : 0;

  const collapsedCardOrder = useMemo(() => {
    return Array.from({ length: slotCount }, (_, index) => index)
      .filter((index) => index !== expandedIndex);
  }, [slotCount, expandedIndex]);
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

      {Array.from({ length: slotCount }, (_, index) => {
        const isExpanded = expandedIndex !== null;
        const selected = index === expandedIndex;
        const collapsedIndex = collapsedCardOrder.indexOf(index);
        const stackRank = stackRankFor(index, activeIndex, cards.length);
        const targetY = isExpanded
          ? selected
            ? FOCUSED_CARD_TOP
            : collapsedStackTop + collapsedIndex * COLLAPSED_CARD_STEP
          : FOCUSED_CARD_TOP +
            (slotCount - 1 - stackRank) * defaultStackStep;
        const targetScale = isExpanded && !selected
          ? 0.94 + collapsedIndex * 0.015
          : 1;
        const zIndex = isExpanded
          ? selected
            ? slotCount + 1
            : collapsedIndex + 1
          : slotCount - stackRank;

        if (index === addSlotIndex) {
          return (
            <StackSlot key="__add-card__" targetScale={targetScale} targetY={targetY} zIndex={zIndex}>
              <AddCardPass adding={addingCard} cardHeight={cardHeight} cardWidth={cardWidth} onPress={onAddCard} />
            </StackSlot>
          );
        }

        const card = cards[index]!;
        return (
          <StackSlot key={card.id} targetScale={targetScale} targetY={targetY} zIndex={zIndex}>
            <WalletCardRenderEngine
              card={card}
              profile={profile}
              width={cardWidth}
              height={cardHeight}
              onDoubleTap={() => openCard(index)}
              onSwipeDown={() => showQr(index)}
              onSingleTap={() => selectCard(index)}
            />
          </StackSlot>
        );
      })}
    </View>
  );
}

/** @deprecated Use `WalletStackView` — stack mode is wallet-only. */
export const StackedCardView = WalletStackView;
