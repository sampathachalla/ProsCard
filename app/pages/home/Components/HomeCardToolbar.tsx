import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Text } from '@/common/ui/Text';
import { useThemeContext } from '@/context/ThemeContext';

/** Equal pill width — sized for “Preview” so both capsules match the reference layout. */
const PILL_WIDTH = 132;
const PILL_HEIGHT = 44;

type HomeCardToolbarProps = {
  disabled?: boolean;
  onEdit: () => void;
  onPreview: () => void;
};

function OutlinePillButton({
  label,
  disabled,
  onPress,
  isDark,
}: {
  label: string;
  disabled?: boolean;
  onPress: () => void;
  isDark: boolean;
}) {
  const borderColor = isDark ? 'rgba(203, 213, 225, 0.55)' : 'rgba(100, 116, 139, 0.55)';
  const textColor = isDark ? '#cbd5e1' : '#64748b';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      className={`items-center justify-center rounded-full ${
        disabled ? 'opacity-50' : 'active:opacity-70'
      }`}
      style={{
        width: PILL_WIDTH,
        height: PILL_HEIGHT,
        borderWidth: 1,
        borderColor,
        backgroundColor: 'transparent',
      }}
    >
      <Text variant="none" style={{ color: textColor, fontSize: 15, fontWeight: '500' }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function HomeCardToolbar({ disabled = false, onEdit, onPreview }: HomeCardToolbarProps) {
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  const handleEdit = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onEdit();
  };

  const handlePreview = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPreview();
  };

  return (
    <View className="flex-row items-center justify-center gap-3 pb-2.5 pt-1">
      <OutlinePillButton disabled={disabled} isDark={isDark} label="Edit" onPress={handleEdit} />
      <OutlinePillButton disabled={disabled} isDark={isDark} label="Preview" onPress={handlePreview} />
    </View>
  );
}
