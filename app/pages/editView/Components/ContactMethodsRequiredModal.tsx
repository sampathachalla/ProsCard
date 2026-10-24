import { Modal, Pressable, View } from 'react-native';
import { ContactRound, Plus } from 'lucide-react-native';
import { Text } from '@/common/ui/Text';

type ContactMethodsRequiredModalProps = {
  missingCount: number;
  minimumCount: number;
  visible: boolean;
  onContinue: () => void;
};

export function ContactMethodsRequiredModal({
  missingCount,
  minimumCount,
  visible,
  onContinue,
}: ContactMethodsRequiredModalProps) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onContinue}>
      <View className="flex-1 items-center justify-center bg-black/65 px-5">
        <View className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-[#0b1120]">
          <View className="size-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60">
            <ContactRound color="#3b82f6" size={24} />
          </View>

          <Text accessibilityRole="header" className="mt-4 text-xl font-black text-textPrimary dark:text-white">
            Add more contact methods
          </Text>
          <Text className="mt-2 text-sm leading-5 text-textMuted dark:text-slate-400">
            Every card needs at least {minimumCount} contact methods. Add {missingCount} more using email, phone,
            website, address, or a social link.
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={onContinue}
            className="mt-5 min-h-[52px] flex-row items-center justify-center rounded-2xl bg-primary px-4 active:opacity-75 dark:bg-dark-primary"
          >
            <Plus color="#ffffff" size={19} strokeWidth={2.5} />
            <Text className="ml-2 font-bold text-white">Add contact method</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
