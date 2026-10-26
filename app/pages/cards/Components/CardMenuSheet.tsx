import { forwardRef } from 'react';
import { View } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SheetActionRow } from '@/common/ui/SheetActionRow';
import { SheetHeader } from '@/common/ui/SheetHeader';
import { ThemedBottomSheet } from '@/common/ui/ThemedBottomSheet';
import { CARD_MENU_ACTIONS, type CardMenuActionId } from '../Config/cardMenuActions';

type Props = {
  title: string;
  walletLabel: string;
  onSelect: (action: CardMenuActionId) => void;
};

/** Slide-up menu listing the card actions (edit, preview, share, duplicate, wallet, lockscreen). */
export const CardMenuSheet = forwardRef<BottomSheet, Props>(({ title, walletLabel, onSelect }, ref) => {
  const insets = useSafeAreaInsets();

  return (
    <ThemedBottomSheet ref={ref} fitContent>
      <BottomSheetView style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }} className="px-6 pt-2">
        <SheetHeader title="Card options" subtitle={title} />
        <View className="gap-2.5">
          {CARD_MENU_ACTIONS.map((action) => (
            <SheetActionRow
              key={action.id}
              label={action.id === 'wallet' ? walletLabel : action.label}
              description={action.description}
              icon={action.icon}
              iconColor={action.color}
              onPress={() => onSelect(action.id)}
            />
          ))}
        </View>
      </BottomSheetView>
    </ThemedBottomSheet>
  );
});

CardMenuSheet.displayName = 'CardMenuSheet';
