import React, { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, View, useWindowDimensions } from 'react-native';
import { Plus } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import type { BusinessCard } from '@/components/cardsComponents/types/card.types';
import type { Profile } from '@/components/profileComponents/types/profile.types';
import { Text } from '@/components/uiComponents/Text';
import { getWalletCardDimensions, resolveWalletCardWidth } from './walletCardLayout';
import { WalletDesignEngine } from './WalletDesignEngine';

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
const COLLAPSED_CARD_STEP = 34;
const COLLAPSED_STACK_VISIBLE_HEIGHT = 42;

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
      className="overflow-hidden rounded-[24px] border-2 border-dashed border-slate-300 bg-card px-5 pt-3 active:opacity-90 dark:border-slate-600 dark:bg-dark-card"
    >
      <View className="flex-row items-center gap-3">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-primary dark:bg-dark-primary">
          {adding ? <ActivityIndicator color="#ffffff" size="small" /> : <Plus color="#ffffff" size={18} strokeWidth={2.6} />}
        </View>
        <Text className="text-sm font-bold text-textPrimary dark:text-dark-textPrimary">
          {adding ? 'Creating card…' : 'Add card'}
        </Text>
      </View>
      <View className="flex-1 items-center justify-center px-4">
        <Text variant="muted" className="text-center text-xs">
          Starts with default design. Customize theme and layout anytime.
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

/**
 * Wallet Stack View for "My Cards" screen:
 * Displays cards in traditional ISO/IEC 7810 ID-1 standard wallet proportions (1.586 : 1)
 * with Identity (Section 1), Professional (Section 2), and QR code.
 */
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
  const focusedCardTop = showPrimaryTag ? 26 : FOCUSED_CARD_TOP;
  const passVerticalBudget = Math.max(0, containerHeight - bottomInset - focusedCardTop - 8);
  const cardWidth = resolveWalletCardWidth({
    windowWidth,
    availableHeight: passVerticalBudget,
  });
  const { height: cardHeight } = getWalletCardDimensions(cardWidth, passVerticalBudget);

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
          (containerHeight - cardHeight - focusedCardTop) / (slotCount - 1),
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
              <WalletDesignEngine
                card={card}
                profile={profile}
                width={cardWidth}
                height={cardHeight}
                onDoubleTap={() => openCard(index)}
                onSwipeDown={() => showQr(index)}
                onSingleTap={() => selectCard(index)}
              />
              {showPrimaryTag && card.isPrimary ? (
                <View pointerEvents="none" className="absolute -top-3.5 right-3 rounded-full bg-sky-500 px-2.5 py-0.5 shadow-sm">
                  <Text className="text-[10px] font-bold uppercase tracking-wider text-white">PRIMARY</Text>
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
