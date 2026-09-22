// components/profileComponents/Components/SettingsRow.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

export function SettingsRow({
  icon: Icon,
  label,
  onPress,
  right,
}: {
  icon: LucideIcon;
  label: string;
  onPress?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center bg-card dark:bg-dark-card rounded-2xl px-4 py-4 mb-3"
      onPress={onPress}
      disabled={!onPress}
    >
      <View className="w-9 h-9 rounded-full bg-background dark:bg-dark-background items-center justify-center mr-3">
        <Icon color={Colors.light.tint} size={18} strokeWidth={2.2} />
      </View>
      <Text className="flex-1 text-textPrimary dark:text-dark-textPrimary font-medium">
        {label}
      </Text>
      {right ?? <ChevronRight color={Colors.light.mutedText} size={18} strokeWidth={2} />}
    </TouchableOpacity>
  );
}
