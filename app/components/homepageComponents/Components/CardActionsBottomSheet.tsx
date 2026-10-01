import { forwardRef, useMemo } from 'react';
import { Alert, Platform, Share, View } from 'react-native';
import { useRouter } from 'expo-router';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { Copy, Edit3, Radio, Wallet } from 'lucide-react-native';
import type { BusinessCard } from '@/components/cardsComponents/types/card.types';
import { closeBottomSheet } from '@/components/uiComponents/closeBottomSheet';
import { SheetActionRow } from '@/components/uiComponents/SheetActionRow';
import { SheetHeader } from '@/components/uiComponents/SheetHeader';
import { ThemedBottomSheet } from '@/components/uiComponents/ThemedBottomSheet';
import { getShareUrl } from '@/components/sharingComponents/Services/sharingService';
import { queryClient, queryKeys } from '@/services/api/queryClient';
import { useAddToWallet } from '@/components/walletCardComponents/Hooks/useAddToWallet';

type CardActionsBottomSheetProps = {
  card?: BusinessCard;
  onEdit?: () => void;
};

export const CardActionsBottomSheet = forwardRef<BottomSheet, CardActionsBottomSheetProps>(
  ({ card, onEdit }, ref) => {
    const router = useRouter();
    const wallet = useAddToWallet();
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
        description: 'Share a link anyone can open',
        icon: Copy,
        color: '#0284c7',
        onPress: () => {
          if (!card) return;
          queryClient.fetchQuery({ queryKey: queryKeys.share(card.id), queryFn: () => getShareUrl(card.id), staleTime: Infinity })
            .then(async (url) => {
              if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
                await navigator.clipboard.writeText(url);
                Alert.alert('Link Copied', 'Your public card link has been copied to clipboard.');
              } else {
                await Share.share({ message: url, title: `${card.name} | ProsCard`, url });
              }
            })
            .catch((reason) => Alert.alert('Share link unavailable', reason instanceof Error ? reason.message : 'Try again.'));
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
        label: wallet.label,
        description: 'Save this card as a pass in your phone’s wallet',
        icon: Wallet,
        color: '#059669',
        onPress: () => {
          void wallet.addToWallet(card?.id, card?.name);
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
