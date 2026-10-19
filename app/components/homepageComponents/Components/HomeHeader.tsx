import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';
import { Avatar } from '@/components/uiComponents/Avatar';
import { BrandLogo } from '@/components/uiComponents/BrandLogo';
import { Text } from '@/components/uiComponents/Text';

type HomeHeaderProps = {
  userName: string;
  onProfilePress?: () => void;
};

/** Equal left/right columns so the title stays optically centered. */
const SIDE_SLOT = 64;

export function HomeHeader({
  userName,
  onProfilePress,
}: HomeHeaderProps) {
  const router = useRouter();
  const { theme } = useThemeContext();
  const palette = theme === 'dark' ? Colors.dark : Colors.light;

  const titleStyle = {
    fontSize: 30,
    fontWeight: '900' as const,
    letterSpacing: -1.1,
    lineHeight: 34,
  };

  const handleProfilePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (onProfilePress) {
      onProfilePress();
    } else {
      router.push('/(tabs)/profilePage');
    }
  };

  return (
    <View className="min-h-[64px] flex-row items-center">
      <View style={{ width: SIDE_SLOT }} className="items-start justify-center">
        <BrandLogo
          accessibilityLabel="VCPROS icon"
          size="header"
          variant="icon"
        />
      </View>

      <View className="min-w-0 flex-1 items-center justify-center px-2">
        <Text
          accessibilityLabel="VC Pros"
          accessibilityRole="header"
          numberOfLines={1}
          variant="none"
          className="text-center"
          style={titleStyle}
        >
          {/* Match logo: white VC + cyan PROS, heavy mark weight */}
          <Text
            variant="none"
            style={[
              titleStyle,
              { color: theme === 'dark' ? Colors.palette.primaryWhite : Colors.palette.darkBody },
            ]}
          >
            VC
          </Text>
          <Text
            variant="none"
            style={[
              titleStyle,
              {
                color: theme === 'dark' ? Colors.palette.brandCyanLight : Colors.palette.brandCyan,
              },
            ]}
          >
            PROS
          </Text>
        </Text>
        <Text
          variant="none"
          numberOfLines={1}
          className="mt-0.5 text-center text-[12px] font-medium tracking-wide text-textMuted dark:text-dark-textMuted"
        >
          Card for Professionals
        </Text>
      </View>

      <View style={{ width: SIDE_SLOT }} className="items-end justify-center">
        <Pressable
          accessibilityLabel="Open profile and settings"
          accessibilityRole="button"
          className="items-center justify-center rounded-full active:scale-95 active:opacity-80"
          onPress={handleProfilePress}
          hitSlop={8}
        >
          <Avatar
            name={userName}
            size={40}
            style={{ borderColor: palette.border, borderWidth: 1.5 }}
          />
        </Pressable>
      </View>
    </View>
  );
}
