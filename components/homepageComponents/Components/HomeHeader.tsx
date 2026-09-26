import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';
import { AppWordmark } from '@/components/uiComponents/AppWordmark';
import { Avatar } from '@/components/uiComponents/Avatar';
import { BrandLogo } from '@/components/uiComponents/BrandLogo';

type HomeHeaderProps = {
  userName: string;
  onProfilePress?: () => void;
};

export function HomeHeader({
  userName,
  onProfilePress,
}: HomeHeaderProps) {
  const router = useRouter();
  const { theme } = useThemeContext();
  const palette = theme === 'dark' ? Colors.dark : Colors.light;

  const handleProfilePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (onProfilePress) {
      onProfilePress();
    } else {
      router.push('/(tabs)/profilePage');
    }
  };

  return (
    <View className="min-h-[52px] flex-row items-center">
      <BrandLogo
        accessibilityLabel="MindPROS company logo"
        size="sm"
        variant="wordmark"
      />

      <AppWordmark className="ml-4 flex-1" />

      <Pressable
        accessibilityLabel="Open profile and settings"
        accessibilityRole="button"
        className="relative items-center justify-center rounded-full active:scale-95 active:opacity-80"
        onPress={handleProfilePress}
      >
        <Avatar
          name={userName}
          size={40}
          style={{ borderColor: palette.border, borderWidth: 1 }}
        />
      </Pressable>
    </View>
  );
}
