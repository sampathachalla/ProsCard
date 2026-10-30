import { ActivityIndicator, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, RotateCcw } from 'lucide-react-native';

import { IconButton } from '@/common/ui/IconButton';
import { Text } from '@/common/ui/Text';
import { Colors } from '@/constants/Colors';

type AccountPageHeaderProps = {
  isSaving: boolean;
  canUndo: boolean;
  canSave: boolean;
  offline: boolean;
  onBack: () => void;
  onUndo: () => void;
  onSave: () => void;
};

/** Single navigation bar: back, title, undo, save (no duplicate stack header). */
export function AccountPageHeader({
  isSaving,
  canUndo,
  canSave,
  offline,
  onBack,
  onUndo,
  onSave,
}: AccountPageHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="border-b border-slate-200 bg-background dark:border-slate-800 dark:bg-dark-background"
      style={{ paddingTop: Math.max(insets.top, 12) }}
    >
      <View className="min-h-[48px] flex-row items-center px-4 pb-3">
        <IconButton accessibilityLabel="Go back" icon={ArrowLeft} variant="ghost" onPress={onBack} />

        <View className="min-w-0 flex-1 px-2">
          <Text variant="heading" numberOfLines={1} className="text-center">
            Account
          </Text>
        </View>

        <View className="flex-row items-center" style={{ gap: 4 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Undo changes"
            disabled={isSaving || !canUndo}
            onPress={onUndo}
            hitSlop={8}
            className={`h-10 w-10 items-center justify-center rounded-xl active:opacity-75 ${
              !canUndo ? 'opacity-35' : ''
            }`}
          >
            <RotateCcw color={Colors.light.tint} size={18} strokeWidth={2.2} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Save account"
            disabled={isSaving || !canSave}
            onPress={onSave}
            className={`h-10 min-w-[68px] items-center justify-center rounded-xl bg-primary px-3 active:opacity-85 dark:bg-dark-primary ${
              isSaving || !canSave ? 'opacity-50' : ''
            }`}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text variant="none" className="text-xs font-bold text-white">
                Save
              </Text>
            )}
          </Pressable>
        </View>
      </View>
      {offline ? (
        <Text variant="muted" className="px-4 pb-2 text-center text-xs">
          Offline · reconnect to save
        </Text>
      ) : null}
    </View>
  );
}
