import { Platform, View } from 'react-native';
import { Check, UserRoundCheck } from 'lucide-react-native';
import { Button } from '@/common/ui/Button';
import { Text } from '@/common/ui/Text';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';

type Props = {
  contactName: string;
  disabled?: boolean;
  onReplace?: () => void;
  onDiscard?: () => void;
};

const DuplicateIcon = Platform.OS === 'android' ? Check : UserRoundCheck;

export function DuplicateContactBanner({ contactName, disabled, onReplace, onDiscard }: Props) {
  const { theme } = useThemeContext();
  const tint = theme === 'dark' ? Colors.dark.tint : Colors.light.tint;
  const hasActions = Boolean(onReplace && onDiscard);

  return (
    <View className={`mb-4 rounded-2xl border px-4 py-3 ${hasActions
      ? 'border-slate-200/80 bg-card dark:border-slate-800 dark:bg-dark-card'
      : 'border-amber-500/30 bg-amber-500/10'}`}>
      <View className="flex-row items-center">
        {hasActions ? (
          <View className="size-9 items-center justify-center rounded-xl bg-primary/10 dark:bg-sky-500/15">
            <DuplicateIcon color={tint} size={18} strokeWidth={2.3} />
          </View>
        ) : <DuplicateIcon color="#d97706" size={17} strokeWidth={2.3} />}
        <View className="ml-2.5 flex-1">
          <Text className={hasActions
            ? 'text-sm font-semibold text-textPrimary dark:text-dark-textPrimary'
            : 'text-xs font-bold text-amber-700 dark:text-amber-400'}>Already saved</Text>
          <Text className={`mt-0.5 text-xs text-textMuted ${hasActions ? 'dark:text-dark-textMuted' : 'dark:text-slate-400'}`}>
            Matches {contactName} in your contacts.
          </Text>
        </View>
      </View>
      {hasActions ? (
        <View className="mt-3 flex-row flex-wrap gap-2">
          <Button
            label="Replace saved contact"
            size="sm"
            disabled={disabled}
            onPress={onReplace}
            style={{ minHeight: 48 }}
          />
          <Button
            label="Discard new scan"
            variant="secondary"
            size="sm"
            disabled={disabled}
            onPress={onDiscard}
            style={{ minHeight: 48 }}
          />
        </View>
      ) : null}
    </View>
  );
}
