import { forwardRef, useMemo } from 'react';
import { View } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { Briefcase, Heart, Sparkles, Users } from 'lucide-react-native';
import type { BusinessCard } from '@/components/cardsComponents/types/card.types';
import { closeBottomSheet } from '@/components/uiComponents/closeBottomSheet';
import { SheetActionRow } from '@/components/uiComponents/SheetActionRow';
import { SheetHeader } from '@/components/uiComponents/SheetHeader';
import { ThemedBottomSheet } from '@/components/uiComponents/ThemedBottomSheet';

const CARD_ICONS = [Briefcase, Heart, Sparkles, Users] as const;

type CategoryBottomSheetProps = {
  cards: BusinessCard[];
  selectedIndex: number;
  onSelectCard: (index: number) => void;
};

export const CategoryBottomSheet = forwardRef<BottomSheet, CategoryBottomSheetProps>(
  ({ cards, selectedIndex, onSelectCard }, ref) => {
    const snapPoints = useMemo(() => ['50%'], []);

    const handleSelect = (index: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      onSelectCard(index);
      if (ref && 'current' in ref) {
        closeBottomSheet(ref);
      }
    };

    return (
      <ThemedBottomSheet ref={ref} snapPoints={snapPoints}>
        <BottomSheetView className="flex-1 px-6 pb-6 pt-2">
          <SheetHeader
            title="Select a Card"
            subtitle="Choose the profile card you want to display"
          />

          <View className="gap-2.5">
            {cards.map((card, index) => {
              const Icon = CARD_ICONS[index % CARD_ICONS.length];

              return (
                <SheetActionRow
                  key={card.id}
                  label={card.category}
                  description={`${card.company} · ${card.title}`}
                  icon={Icon}
                  variant="selectable"
                  selected={selectedIndex === index}
                  onPress={() => handleSelect(index)}
                />
              );
            })}
          </View>
        </BottomSheetView>
      </ThemedBottomSheet>
    );
  },
);

CategoryBottomSheet.displayName = 'CategoryBottomSheet';
