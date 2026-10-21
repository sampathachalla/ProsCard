import { Modal, Pressable, View } from 'react-native';
import { RefreshCw, SquareUserRound } from 'lucide-react-native';
import { Text } from '@/components/uiComponents/Text';

type ConnectionScopeModalProps = {
  fieldLabel: string;
  newValue: string;
  savedValue: string;
  visible: boolean;
  onChoose: (scope: 'card' | 'account') => void;
};

export function ConnectionScopeModal({
  fieldLabel,
  newValue,
  savedValue,
  visible,
  onChoose,
}: ConnectionScopeModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={() => onChoose('card')}
    >
      <View className="flex-1 items-center justify-center bg-black/65 px-5">
        <View className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-[#0b1120]">
          <Text accessibilityRole="header" className="text-xl font-black text-textPrimary dark:text-white">
            Use this {fieldLabel}
          </Text>
          <Text className="mt-1 text-sm leading-5 text-textMuted dark:text-slate-400">
            This value is different from the one saved to your VC Pros account.
          </Text>

          <View className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/70">
            <Text className="text-xs font-bold uppercase tracking-wide text-textMuted dark:text-slate-400">Saved value</Text>
            <Text selectable className="mt-1 text-sm font-semibold text-textPrimary dark:text-white">{savedValue}</Text>
            <View className="my-3 h-px bg-slate-200 dark:bg-slate-700" />
            <Text className="text-xs font-bold uppercase tracking-wide text-primary dark:text-dark-primary">New value</Text>
            <Text selectable className="mt-1 text-sm font-semibold text-textPrimary dark:text-white">{newValue}</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => onChoose('card')}
            className="mt-5 min-h-[52px] flex-row items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 active:opacity-75 dark:border-slate-600 dark:bg-slate-900"
          >
            <SquareUserRound color="#3b82f6" size={19} />
            <Text className="ml-2 font-bold text-textPrimary dark:text-white">Use on this card only</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => onChoose('account')}
            className="mt-3 min-h-[52px] flex-row items-center justify-center rounded-2xl bg-primary px-4 active:opacity-75 dark:bg-dark-primary"
          >
            <RefreshCw color="#ffffff" size={18} />
            <Text className="ml-2 font-bold text-white">Replace saved account value</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
