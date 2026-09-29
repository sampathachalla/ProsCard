import { Pressable, View } from 'react-native';
import { ChevronRight, Palette } from 'lucide-react-native';
import { Text } from '@/components/uiComponents/Text';

export function EditorStylingLauncher({
  compact = false,
  onPress,
}: {
  compact?: boolean;
  onPress: () => void;
}) {
  if (compact) {
    return (
      <Pressable
        accessibilityLabel="Open styling controls"
        accessibilityRole="button"
        className="flex-row items-center rounded-xl border border-slate-200 bg-card px-3 py-2 active:opacity-75 dark:border-slate-700 dark:bg-dark-card"
        onPress={onPress}
      >
        <Palette color="#3b82f6" size={18} />
        <Text className="ml-2 text-sm font-bold text-primary dark:text-dark-primary">Styling</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityLabel="Open styling controls"
      accessibilityRole="button"
      className="mb-4 flex-row items-center rounded-2xl border border-slate-200 bg-card px-4 py-3 active:opacity-75 dark:border-slate-700 dark:bg-dark-card"
      onPress={onPress}
    >
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/50">
        <Palette color="#3b82f6" size={20} />
      </View>
      <View className="flex-1">
        <Text className="font-bold text-textPrimary dark:text-dark-textPrimary">Styling</Text>
        <Text className="mt-0.5 text-xs text-textMuted dark:text-dark-textMuted">
          Colors, gradients, presets and typography
        </Text>
      </View>
      <ChevronRight color="#64748b" size={19} />
    </Pressable>
  );
}
