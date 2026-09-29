import type { ComponentProps } from 'react';
import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { LucideIcon } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';
import { Text } from './Text';

type IconButtonProps = Omit<ComponentProps<typeof Pressable>, 'children'> & {
  icon: LucideIcon;
  accessibilityLabel: string;
  size?: number;
  iconSize?: number;
  variant?: 'surface' | 'ghost' | 'glass' | 'primary';
  badge?: number | string;
  enableHaptics?: boolean;
};

export function IconButton({
  icon: Icon,
  accessibilityLabel,
  size = 44,
  iconSize,
  variant = 'surface',
  badge,
  enableHaptics = true,
  disabled,
  onPress,
  className = '',
  ...props
}: IconButtonProps) {
  const { theme } = useThemeContext();
  const palette = theme === 'dark' ? Colors.dark : Colors.light;

  const actualIconSize = iconSize ?? Math.round(size * 0.48);

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: 'bg-primary dark:bg-dark-primary shadow-sm',
          iconColor: Colors.palette.primaryWhite,
        };
      case 'glass':
        return {
          container: 'bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60',
          iconColor: palette.icon,
        };
      case 'ghost':
        return {
          container: 'bg-transparent',
          iconColor: palette.icon,
        };
      case 'surface':
      default:
        return {
          container: 'bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/50 dark:border-slate-700/50',
          iconColor: palette.icon,
        };
    }
  };

  const { container: containerClass, iconColor } = getVariantStyles();

  const handlePress = (e: any) => {
    if (disabled) return;
    if (enableHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress?.(e);
  };

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      onPress={handlePress}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className={`items-center justify-center relative ${containerClass} ${
        disabled ? 'opacity-40' : 'active:scale-95 active:opacity-75'
      } ${className}`}
      {...props}
    >
      <Icon color={iconColor} size={actualIconSize} strokeWidth={2} />
      {badge !== undefined && badge !== null && (
        <View className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 rounded-full items-center justify-center border-2 border-white dark:border-slate-900">
          <Text className="text-[10px] font-bold text-white text-center">
            {badge}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

