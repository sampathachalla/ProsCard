// components/contactsComponents/Components/AddContactBottomSheet.tsx
import { forwardRef } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { ImagePlus, PencilLine, ScanLine } from 'lucide-react-native';
import { closeBottomSheet } from '@/components/uiComponents/closeBottomSheet';
import { SheetActionRow } from '@/components/uiComponents/SheetActionRow';
import { SheetHeader } from '@/components/uiComponents/SheetHeader';
import { ThemedBottomSheet } from '@/components/uiComponents/ThemedBottomSheet';

type AddContactBottomSheetProps = {
  onScan: () => void;
  onUpload: () => void;
  onManual: () => void;
};

/** The "+" menu on the contacts page: scan a card, upload a card photo, or type the details. */
export const AddContactBottomSheet = forwardRef<BottomSheet, AddContactBottomSheetProps>(
  ({ onScan, onUpload, onManual }, ref) => {
    const insets = useSafeAreaInsets();

    const choose = (callback: () => void) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      if (ref && 'current' in ref) closeBottomSheet(ref);
      callback();
    };

    const actions = [
      { id: 'scan', label: 'Scan business card', description: 'Use the camera; details are read automatically', icon: ScanLine, color: '#2563eb', onPress: onScan },
      { id: 'upload', label: 'Upload card photo', description: 'Pick a photo of the card from your library', icon: ImagePlus, color: '#0284c7', onPress: onUpload },
      { id: 'manual', label: 'Enter manually', description: 'Type the contact details yourself', icon: PencilLine, color: '#7c3aed', onPress: onManual },
    ];

    return (
      // Sized to its content so there is no empty space under the last option.
      <ThemedBottomSheet ref={ref} fitContent>
        <BottomSheetView className="px-6 pt-2" style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}>
          <SheetHeader title="Add contact" subtitle="Create a contact from a business card or enter details yourself" />
          <View className="gap-3">
            {actions.map((action) => (
              <SheetActionRow
                key={action.id}
                label={action.label}
                description={action.description}
                icon={action.icon}
                iconColor={action.color}
                onPress={() => choose(action.onPress)}
              />
            ))}
          </View>
        </BottomSheetView>
      </ThemedBottomSheet>
    );
  },
);

AddContactBottomSheet.displayName = 'AddContactBottomSheet';
