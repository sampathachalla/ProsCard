// components/profileComponents/Components/SettingsRow.tsx
import type { ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

const ROW_CLASS = 'flex-row items-center bg-card dark:bg-dark-card px-4 py-4 mb-3';

export function SettingsRow({
  icon: Icon,
  label,
  onPress,
  right,
}: {
  icon: LucideIcon;
  label: string;
  onPress?: () => void;
  right?: ReactNode;
}) {
  const content = (
    <>
      <View className="w-9 h-9 rounded-full bg-background dark:bg-dark-background items-center justify-center mr-3">
        <Icon color={Colors.light.tint} size={18} strokeWidth={2.2} />
      </View>
      <Text className="flex-1 text-textPrimary dark:text-dark-textPrimary font-medium">
        {label}
      </Text>
      {right ?? <ChevronRight color={Colors.light.mutedText} size={18} strokeWidth={2} />}
    </>
  );

  // Rows holding a control (e.g. a Switch) must not be wrapped in a disabled button:
  // on web that swallows the control's clicks, and screen readers announce it as disabled.
  if (!onPress) {
    return <View className={ROW_CLASS}>{content}</View>;
  }

  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} className={ROW_CLASS} onPress={onPress}>
      {content}
    </TouchableOpacity>
  );
}
