import { forwardRef, useMemo } from 'react';
import { Alert, View } from 'react-native';
import { useRouter } from 'expo-router';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { Copy, Edit3, Radio, Wallet } from 'lucide-react-native';
import type { BusinessCard } from '@/components/cardsComponents/types/card.types';
import { closeBottomSheet } from '@/components/uiComponents/closeBottomSheet';
import { SheetActionRow } from '@/components/uiComponents/SheetActionRow';
import { SheetHeader } from '@/components/uiComponents/SheetHeader';
import { ThemedBottomSheet } from '@/components/uiComponents/ThemedBottomSheet';

type CardActionsBottomSheetProps = {
  card?: BusinessCard;
  onEdit?: () => void;
};

export const CardActionsBottomSheet = forwardRef<BottomSheet, CardActionsBottomSheetProps>(
  ({ card, onEdit }, ref) => {
    const router = useRouter();
    const snapPoints = useMemo(() => ['54%'], []);

    const closeSheet = () => {
      if (ref && 'current' in ref) {
        closeBottomSheet(ref);
      }
    };

    const handleAction = (_actionId: string, callback: () => void) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      closeSheet();
      callback();
    };

    const actions = [
      {
        id: 'edit',
        label: 'Edit Card Details',
        description: 'Update name, job title, phone & email',
        icon: Edit3,
        color: '#2563eb',
        onPress: () => {
          if (onEdit) {
            onEdit();
          } else {
            router.push({
              pathname: '/(tabs)/editViewPage',
              params: { cardId: card?.id ?? '1', edit: '1' },
            });
          }
        },
      },
      {
        id: 'copy',
        label: 'Copy Public Link',
        description: `proscard.app/card/${card?.id || '1'}`,
        icon: Copy,
        color: '#0284c7',
        onPress: () => {
          Alert.alert('Link Copied', 'Your public card link has been copied to clipboard!');
        },
      },
      {
        id: 'nfc',
        label: 'Write to NFC Card',
        description: 'Beam link to physical NFC tag or card',
        icon: Radio,
        color: '#7c3aed',
        onPress: () => {
          Alert.alert('NFC Card', 'Hold your NFC tag near the top of the phone to write.');
        },
      },
      {
        id: 'wallet',
        label: 'Add to Apple Wallet',
        description: 'Save digital pass to Apple Wallet',
        icon: Wallet,
        color: '#059669',
        onPress: () => {
          Alert.alert('Apple Wallet', 'Card pass generated and ready to add.');
        },
      },
    ];

    return (
      <ThemedBottomSheet ref={ref} snapPoints={snapPoints}>
        <BottomSheetView className="flex-1 px-6 pb-6 pt-2">
          <SheetHeader
            title="Card Options"
            subtitle={`Manage ${card?.name ?? 'your'}'s digital card`}
          />

          <View className="gap-2.5">
            {actions.map((action) => (
              <SheetActionRow
                key={action.id}
                label={action.label}
                description={action.description}
                icon={action.icon}
                iconColor={action.color}
                onPress={() => handleAction(action.id, action.onPress)}
              />
            ))}
          </View>
        </BottomSheetView>
      </ThemedBottomSheet>
    );
  },
);

CardActionsBottomSheet.displayName = 'CardActionsBottomSheet';
