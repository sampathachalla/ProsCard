import { Pressable, View } from 'react-native';
import { Text } from '@/components/uiComponents/Text';

export function AuthFooterSwitch({
  prompt,
  actionLabel,
  onPress,
}: {
  prompt: string;
  actionLabel: string;
  onPress: () => void;
}) {
  return (
    <View className="flex-row flex-wrap items-center justify-center">
      <Text className="text-[13px] text-[#737373] dark:text-slate-400">{prompt} </Text>
      <Pressable
        onPress={onPress}
        accessibilityRole="link"
        accessibilityLabel={actionLabel}
        className="active:opacity-70"
      >
        <Text className="text-[13px] font-semibold text-sky-600 dark:text-sky-400">
          {actionLabel}
        </Text>
      </Pressable>
    </View>
  );
}
