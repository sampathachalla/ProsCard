import { ActivityIndicator, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { Text } from '@/common/ui/Text';

type Props = {
  title: string;
  isSaving: boolean;
  onBack: () => void;
  onSave: () => void;
};

/** Back · page name · Save, as one bar pinned above the form. */
export function AddCardHeader({ title, isSaving, onBack, onSave }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center border-b border-slate-200 bg-background px-3 pb-3 dark:border-slate-800 dark:bg-dark-background"
      style={{ paddingTop: Math.max(insets.top, 12) }}
    >
      <Pressable
        accessibilityLabel="Go back"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onBack}
        className="min-h-[44px] w-20 flex-row items-center active:opacity-60"
      >
        <ChevronLeft color="#2563eb" size={22} strokeWidth={2.4} />
        <Text className="text-base font-semibold text-[#2563eb] dark:text-[#38bdf8]">Back</Text>
      </Pressable>

      <Text variant="none" numberOfLines={1} className="flex-1 text-center text-lg font-bold text-textPrimary dark:text-dark-textPrimary">
        {title}
      </Text>

      <View className="w-20 items-end">
        <Pressable
          accessibilityLabel="Save card"
          accessibilityRole="button"
          disabled={isSaving}
          onPress={onSave}
          className="min-h-[36px] min-w-[64px] items-center justify-center rounded-full bg-[#2563eb] px-4 active:opacity-80 dark:bg-[#38bdf8]"
        >
          {isSaving ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text className="text-sm font-bold text-white dark:text-slate-950">Save</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
