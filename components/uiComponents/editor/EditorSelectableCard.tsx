import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { Check } from 'lucide-react-native';
import { Text } from '@/components/uiComponents/Text';

type EditorSelectableCardProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  children?: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  selectedIndicator?: 'dot' | 'check' | 'none';
};

export function EditorSelectableCard({
  label,
  selected,
  onPress,
  accessibilityLabel,
  children,
  className = '',
  style,
  selectedIndicator = 'dot',
}: EditorSelectableCardProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`rounded-2xl border p-3 ${
        selected
          ? 'border-primary bg-blue-50 dark:border-dark-primary dark:bg-blue-950/30'
          : 'border-slate-200 bg-card dark:border-slate-700 dark:bg-dark-card'
      } ${className}`}
      style={style}
    >
      {children}
      <View className="flex-row items-center justify-between">
        <Text className="flex-1 text-xs font-bold text-textPrimary dark:text-dark-textPrimary">{label}</Text>
        {selected && selectedIndicator === 'dot' ? (
          <View className="ml-2 h-2.5 w-2.5 rounded-full bg-primary dark:bg-dark-primary" />
        ) : null}
        {selected && selectedIndicator === 'check' ? <Check color="#3b82f6" size={14} /> : null}
      </View>
    </Pressable>
  );
}
