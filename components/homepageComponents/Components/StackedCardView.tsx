import { useMemo } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { LinearTransition } from 'react-native-reanimated';
import mindProsLogo from '@/assets/mindpros-logo.png';
import type { BusinessCard } from '@/components/cardsComponents/types/card.types';
import { StandardWalletCard } from '@/components/uiComponents/StandardWalletCard';
import { Text } from '@/components/uiComponents/Text';

type StackedCardViewProps = {
  activeIndex: number;
  cards: BusinessCard[];
  onActiveIndexChange: (index: number) => void;
};

const CARD_ASPECT_RATIO = 1.586;
const CARD_PEEK_HEIGHT = 58;

export function StackedCardView({
  activeIndex,
  cards,
  onActiveIndexChange,
}: StackedCardViewProps) {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = Math.min(360, Math.max(280, windowWidth - 40));
  const cardHeight = cardWidth / CARD_ASPECT_RATIO;

  const orderedCards = useMemo(() => {
    return cards
      .map((card, index) => ({ card, index }))
      .filter(({ index }) => index !== activeIndex)
      .concat(cards[activeIndex] ? [{ card: cards[activeIndex], index: activeIndex }] : []);
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
      className="items-center px-5 py-2"
      style={{ height: cardHeight + Math.max(0, cards.length - 1) * CARD_PEEK_HEIGHT + 16 }}
    >
      {orderedCards.map(({ card, index }, visualIndex) => {
        const selected = index === activeIndex;

        return (
          <Animated.View
            key={card.id}
            layout={LinearTransition.springify().damping(18).stiffness(180)}
            style={{
              marginTop: visualIndex === 0 ? 0 : -(cardHeight - CARD_PEEK_HEIGHT),
              zIndex: visualIndex + 1,
            }}
          >
            <Pressable
              accessibilityLabel={`${card.category} card for ${card.name}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => selectCard(index)}
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
      })}
    </View>
  );
}
