import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/common/ui/Text';

type Props = {
  title: string;
  visible: boolean;
  onClose: () => void;
  onPreview?: () => void;
  children: ReactNode;
};

/** Page-sheet modal used by the Layout, Card theme and Add contact pickers. */
export function AddCardSheet({ title, visible, onClose, onPreview, children }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal animationType="slide" presentationStyle="pageSheet" visible={visible} onRequestClose={onClose}>
      <View className="flex-1 bg-background dark:bg-dark-background">
        <View className="flex-row items-center border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <Text variant="subtitle" className="flex-1">
            {title}
          </Text>
          <View className="flex-row items-center gap-2">
          {onPreview ? (
            <Pressable
              accessibilityLabel="Preview card"
              accessibilityRole="button"
              hitSlop={6}
              onPress={onPreview}
              className="min-h-[36px] justify-center rounded-full border border-[#2563eb] px-4 active:opacity-70 dark:border-[#38bdf8]"
            >
              <Text className="font-bold text-[#2563eb] dark:text-[#38bdf8]">Preview</Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityLabel="Done"
            accessibilityRole="button"
            hitSlop={10}
            onPress={onClose}
            className="min-h-[36px] justify-center rounded-full bg-slate-100 px-4 active:opacity-70 dark:bg-slate-800"
          >
            <Text className="font-bold text-[#2563eb] dark:text-[#38bdf8]">Done</Text>
          </Pressable>
          </View>
        </View>
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: Math.max(insets.bottom, 16) + 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    </Modal>
  );
}
