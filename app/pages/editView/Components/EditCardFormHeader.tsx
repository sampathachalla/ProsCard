import { ActivityIndicator, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { IconButton } from '@/common/ui/IconButton';
import { Text } from '@/common/ui/Text';

type EditCardFormHeaderProps = {
  isCreateMode: boolean;
  isSaving: boolean;
  saveDisabled?: boolean;
  onBack: () => void;
  onSave: () => void;
};

/** Wireframe header: Back · page title · Save */
export function EditCardFormHeader({
  isCreateMode,
  isSaving,
  saveDisabled = false,
  onBack,
  onSave,
}: EditCardFormHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center border-b border-slate-200 bg-background px-4 pb-3 dark:border-slate-800 dark:bg-dark-background"
      style={{ paddingTop: Math.max(insets.top, 12) }}
    >
      <IconButton accessibilityLabel="Go back" icon={ArrowLeft} variant="ghost" onPress={onBack} />
      <Text variant="heading" numberOfLines={1} className="min-w-0 flex-1 text-center">
        {isCreateMode ? 'Add Card' : 'Edit Card'}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isCreateMode ? 'Create card' : 'Save card'}
        accessibilityState={{ busy: isSaving, disabled: saveDisabled || isSaving }}
        disabled={saveDisabled || isSaving}
        onPress={onSave}
        className="min-h-[44px] min-w-[64px] items-center justify-center rounded-lg px-2 active:opacity-70 disabled:opacity-40"
      >
        {isSaving ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text className="text-base font-bold text-primary dark:text-dark-primary">Save</Text>
        )}
      </Pressable>
    </View>
  );
}
