import { Modal, Pressable, View } from 'react-native';
import { RefreshCw, Trash2, UserRoundCheck } from 'lucide-react-native';
import { Text } from '@/components/uiComponents/Text';

type DuplicateContactModalProps = {
  contactName: string;
  visible: boolean;
  onDiscard: () => void;
  onReplace: () => void;
};

export function DuplicateContactModal({
  contactName,
  visible,
  onDiscard,
  onReplace,
}: DuplicateContactModalProps) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={() => {}}>
      <View className="flex-1 items-center justify-center bg-black/65 px-5">
        <View className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-[#0b1120]">
          <View className="size-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40">
            <UserRoundCheck color="#d97706" size={24} />
          </View>
          <Text accessibilityRole="header" className="mt-4 text-xl font-black text-textPrimary dark:text-white">
            Contact already saved
          </Text>
          <Text className="mt-2 text-sm leading-5 text-textMuted dark:text-slate-400">
            {contactName} matches a contact already in VC Pros. Replace the saved contact with these details or discard this new scan.
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={onReplace}
            className="mt-5 min-h-[52px] flex-row items-center justify-center rounded-2xl bg-primary px-4 active:opacity-75 dark:bg-dark-primary"
          >
            <RefreshCw color="#ffffff" size={18} />
            <Text className="ml-2 font-bold text-white">Replace saved contact</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={onDiscard}
            className="mt-3 min-h-[52px] flex-row items-center justify-center rounded-2xl border border-rose-300 bg-rose-50 px-4 active:opacity-75 dark:border-rose-900 dark:bg-rose-950/30"
          >
            <Trash2 color="#e11d48" size={18} />
            <Text className="ml-2 font-bold text-rose-600 dark:text-rose-400">Discard new scan</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
