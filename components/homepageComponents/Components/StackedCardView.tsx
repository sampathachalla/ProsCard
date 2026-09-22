import { useEffect, useMemo } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import mindProsLogo from '@/assets/mindpros-logo.png';
import type { BusinessCard } from '@/components/cardsComponents/types/card.types';
import { StandardWalletCard } from '@/components/uiComponents/StandardWalletCard';
import { Text } from '@/components/uiComponents/Text';
import { getCardShowcaseHeight } from '../Utils/businessCardLayout';

type StackedCardViewProps = {
  activeIndex: number;
  cards: BusinessCard[];
  onActiveIndexChange: (index: number) => void;
};

const FOCUSED_CARD_TOP = 8;
const COLLAPSED_CARD_STEP = 18;
const COLLAPSED_STACK_VISIBLE_HEIGHT = 76;

type WalletStackItemProps = {
  card: BusinessCard;
  cardWidth: number;
  index: number;
  onPress: (index: number) => void;
  selected: boolean;
  targetScale: number;
  targetY: number;
  zIndex: number;
};

function WalletStackItem({
  card,
  cardWidth,
  index,
  onPress,
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
          left: '50%',
          marginLeft: -(cardWidth / 2),
          position: 'absolute',
          top: 0,
          zIndex,
        },
        animatedStyle,
      ]}
    >
      <Pressable
        accessibilityLabel={`${card.category} card for ${card.name}`}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={() => onPress(index)}
        className="active:opacity-95"
      >
        <StandardWalletCard
          category={card.category}
          company={card.company}
          gradient={card.gradient}
          logoSource={mindProsLogo}
          name={card.name}
          selected={selected}
          title={card.title}
          width={cardWidth}
        />
      </Pressable>
    </Animated.View>
  );
}

export function StackedCardView({
  activeIndex,
  cards,
  onActiveIndexChange,
}: StackedCardViewProps) {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const cardWidth = Math.min(360, Math.max(280, windowWidth - 40));
  const containerHeight = getCardShowcaseHeight(windowWidth, windowHeight, cards.length);

  const collapsedCardOrder = useMemo(() => {
    return cards
      .map((_, index) => index)
      .filter((index) => index !== activeIndex);
  }, [activeIndex, cards]);

  const selectCard = (index: number) => {
    if (index === activeIndex) return;
    Haptics.selectionAsync().catch(() => {});
    onActiveIndexChange(index);
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
      className="overflow-hidden px-5"
      style={{ height: containerHeight }}
    >
      {cards.map((card, index) => {
        const selected = index === activeIndex;
        const collapsedIndex = collapsedCardOrder.indexOf(index);
        const targetY = selected
          ? FOCUSED_CARD_TOP
          : containerHeight -
            COLLAPSED_STACK_VISIBLE_HEIGHT +
            collapsedIndex * COLLAPSED_CARD_STEP;
        const targetScale = selected
          ? 1
          : 0.94 + collapsedIndex * 0.015;

        return (
          <WalletStackItem
            key={card.id}
            card={card}
            cardWidth={cardWidth}
            index={index}
            onPress={selectCard}
            selected={selected}
            targetScale={targetScale}
            targetY={targetY}
            zIndex={selected ? cards.length + 1 : collapsedIndex + 1}
          />
        );
      })}
    </View>
  );
}
