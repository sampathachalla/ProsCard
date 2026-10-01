import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, View, useWindowDimensions } from 'react-native';
import { Plus, Trophy } from 'lucide-react-native';
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

export type WalletStackViewProps = {
  activeIndex: number;
  addingCard?: boolean;
  bottomInset: number;
  cardOverlay?: (card: BusinessCard) => ReactNode;
  cards: BusinessCard[];
  height: number;
  onActiveIndexChange: (index: number) => void;
  onAddCard?: () => void;
  onCardDoubleTap?: (card: BusinessCard) => void;
  onCardSwipeDown?: (card: BusinessCard) => void;
  profile: Profile;
  showAddCardPass?: boolean;
  showPrimaryTag?: boolean;
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

export function walletStackRankFor(index: number, activeIndex: number, cardCount: number): number {
  if (activeIndex >= cardCount) return index === cardCount ? 0 : cardCount - index;
  if (index === cardCount) return cardCount;
  return (index - activeIndex + cardCount) % cardCount;
}

/** Wallet pass stacked view — used in "My Cards" for cards to add to wallet. */
export function WalletStackView({
  activeIndex: requestedActiveIndex,
  addingCard = false,
  bottomInset,
  cardOverlay,
  cards,
  height,
  onActiveIndexChange,
  onAddCard,
  onCardDoubleTap,
  onCardSwipeDown,
  profile,
  showAddCardPass = true,
  showPrimaryTag = false,
}: WalletStackViewProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(() =>
    Math.max(0, Math.min(requestedActiveIndex, cards.length)),
  );
  const containerHeight = height;
  const focusedCardTop = showPrimaryTag ? 30 : FOCUSED_CARD_TOP;
  const passVerticalBudget = Math.max(0, containerHeight - bottomInset - focusedCardTop - 8);
  const cardWidth = resolveWalletCardWidth({
    windowWidth,
    availableHeight: passVerticalBudget,
  });
  const cardHeight = getWalletCardDimensions(cardWidth).height;
  const slotCount = cards.length + (showAddCardPass ? 1 : 0);
  const addSlotIndex = showAddCardPass ? cards.length : -1;
  const activeIndex = Math.max(0, Math.min(requestedActiveIndex, slotCount - 1));
  const effectiveExpandedIndex = expandedIndex === null || slotCount === 0
    ? null
    : Math.min(expandedIndex, slotCount - 1);

  const defaultStackStep =
    slotCount > 1
      ? Math.max(
          0,
          (containerHeight - cardHeight - FOCUSED_CARD_TOP) / (slotCount - 1),
        )
      : 0;

  const collapsedCardOrder = useMemo(() => {
    return Array.from({ length: slotCount }, (_, index) => index)
      .filter((index) => index !== effectiveExpandedIndex);
  }, [slotCount, effectiveExpandedIndex]);
  const collapsedStackTop = Math.max(
    focusedCardTop,
    containerHeight -
      bottomInset -
      COLLAPSED_STACK_VISIBLE_HEIGHT -
      Math.max(0, collapsedCardOrder.length - 1) * COLLAPSED_CARD_STEP,
  );

  const selectCard = (index: number) => {
    if (index === effectiveExpandedIndex) return;

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
      {effectiveExpandedIndex !== null ? (
        <Pressable
          accessibilityLabel="Return to the wallet stack"
          accessibilityRole="button"
          className="absolute inset-0"
          onPress={collapseStack}
        />
      ) : null}

      {Array.from({ length: slotCount }, (_, index) => {
        const isExpanded = effectiveExpandedIndex !== null;
        const selected = index === effectiveExpandedIndex;
        const collapsedIndex = collapsedCardOrder.indexOf(index);
        const stackRank = walletStackRankFor(index, activeIndex, cards.length);
        const targetY = isExpanded
          ? selected
            ? focusedCardTop
            : collapsedStackTop + collapsedIndex * COLLAPSED_CARD_STEP
          : focusedCardTop +
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
            <View style={{ position: 'relative' }}>
              <WalletCardRenderEngine
                card={card}
                profile={profile}
                width={cardWidth}
                height={cardHeight}
                onDoubleTap={() => openCard(index)}
                onSwipeDown={() => showQr(index)}
                onSingleTap={() => selectCard(index)}
              />
              {showPrimaryTag && card.isPrimary ? (
                <View
                  pointerEvents="none"
                  accessibilityLabel="Primary card"
                  className="absolute -top-3.5 right-4 h-8 w-8 items-center justify-center rounded-full bg-amber-500 border border-amber-200/60 shadow-md"
                >
                  <Trophy color="#ffffff" size={16} strokeWidth={2.4} />
                </View>
              ) : null}
              {cardOverlay?.(card)}
            </View>
          </StackSlot>
        );
      })}
    </View>
  );
}
