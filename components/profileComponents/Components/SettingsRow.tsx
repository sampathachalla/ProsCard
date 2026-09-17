// components/profileComponents/SettingsRow.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

export function SettingsRow({
  icon,
  label,
  onPress,
  right,
}: {
  icon: keyof typeof Ionicons.glyphMap;
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
        <Ionicons name={icon} size={18} color={Colors.light.tint} />
      </View>
      <Text className="flex-1 text-textPrimary dark:text-dark-textPrimary font-medium">
        {label}
      </Text>
      {right ?? <Ionicons name="chevron-forward" size={18} color={Colors.light.mutedText} />}
    </TouchableOpacity>
  );
}
