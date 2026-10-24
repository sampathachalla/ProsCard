import { Pressable, View } from 'react-native';
import { Check, type LucideIcon } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';
import { Text } from './Text';

type SheetActionRowProps = {
  label: string;
  description?: string;
  icon: LucideIcon;
  iconColor?: string;
  onPress: () => void;
  variant?: 'action' | 'selectable';
  selected?: boolean;
};

export function SheetActionRow({
  label,
  description,
  icon: Icon,
  iconColor = '#2563eb',
  onPress,
  variant = 'action',
  selected = false,
}: SheetActionRowProps) {
  const { theme } = useThemeContext();
  const palette = theme === 'dark' ? Colors.dark : Colors.light;
  const isSelectable = variant === 'selectable';

  const rowClassName = isSelectable
    ? selected
      ? 'bg-blue-50 border-primary dark:bg-slate-800 dark:border-dark-primary'
      : 'bg-slate-50 border-slate-200/70 dark:bg-slate-800/40 dark:border-slate-700/50'
    : 'bg-slate-50 border-slate-200/70 dark:bg-slate-800/40 dark:border-slate-700/50';

  const iconWrapClassName = isSelectable
    ? selected
      ? 'bg-primary dark:bg-dark-primary'
      : 'bg-slate-200 dark:bg-slate-700'
    : '';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isSelectable ? { selected } : undefined}
      onPress={onPress}
      className={`flex-row items-center justify-between rounded-2xl p-3.5 border active:opacity-75 ${rowClassName}`}
    >
      <View className="flex-row items-center gap-3 flex-1 pr-2">
        <View
          className={`h-10 w-10 items-center justify-center rounded-xl ${iconWrapClassName}`}
          style={variant === 'action' ? { backgroundColor: `${iconColor}15` } : undefined}
        >
          <Icon
            color={isSelectable ? (selected ? '#ffffff' : palette.icon) : iconColor}
            size={20}
            strokeWidth={2.2}
          />
        </View>
        <View className="flex-1">
          <Text
            className={`font-bold text-textPrimary dark:text-dark-textPrimary ${
              isSelectable ? 'text-base' : 'text-sm'
            }`}
          >
            {label}
          </Text>
          {description ? <Text variant="tiny">{description}</Text> : null}
        </View>
      </View>

      {isSelectable && selected ? (
        <View className="h-6 w-6 items-center justify-center rounded-full bg-primary dark:bg-dark-primary">
          <Check color="#ffffff" size={14} strokeWidth={3} />
        </View>
      ) : null}
    </Pressable>
  );
}
