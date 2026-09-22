import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { LucideIcon } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';
import { Text } from './Text';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = Omit<ComponentProps<typeof Pressable>, 'children'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  enableHaptics?: boolean;
  className?: string;
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-4 py-2 gap-2 rounded-xl',
  md: 'min-h-12 px-5 py-3 gap-2.5 rounded-2xl',
  lg: 'min-h-14 px-6 py-4 gap-3 rounded-full',
};

const iconSizes: Record<ButtonSize, number> = {
  sm: 18,
  md: 20,
  lg: 22,
};

const textSizes: Record<ButtonSize, string> = {
  sm: 'text-sm font-semibold',
  md: 'text-base font-semibold',
  lg: 'text-lg font-bold',
};

export function Button({
  label,
  variant = 'primary',
  size = 'lg',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  enableHaptics = true,
  disabled,
  onPress,
  className = '',
  ...props
}: ButtonProps) {
  const { theme } = useThemeContext();
  const palette = theme === 'dark' ? Colors.dark : Colors.light;

  const getColors = () => {
    switch (variant) {
      case 'primary':
        return {
          container: 'bg-primary dark:bg-dark-primary shadow-sm shadow-blue-500/20',
          foreground: Colors.palette.primaryWhite,
        };
      case 'secondary':
        return {
          container: 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
          foreground: theme === 'dark' ? '#f8fafc' : '#0f172a',
        };
      case 'outline':
        return {
          container: 'border-2 border-primary/80 bg-transparent dark:border-dark-primary/80',
          foreground: palette.tint,
        };
      case 'glass':
        return {
          container: 'bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80 backdrop-blur-md',
          foreground: palette.tint,
        };
      case 'ghost':
        return {
          container: 'bg-transparent',
          foreground: palette.tint,
        };
    }
  };

  const { container: containerClass, foreground } = getColors();

  const handlePress = (e: any) => {
    if (disabled || loading) return;
    if (enableHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress?.(e);
  };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={handlePress}
      className={`flex-row items-center justify-center ${sizeClasses[size]} ${containerClass} ${
        disabled || loading ? 'opacity-50' : 'active:scale-[0.98] active:opacity-85'
      } ${className}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={foreground} size="small" />
      ) : (
        <>
          {Icon && iconPosition === 'left' ? (
            <Icon color={foreground} size={iconSizes[size]} strokeWidth={2.2} />
          ) : null}
          <View>
            <Text className={textSizes[size]} style={{ color: foreground }}>
              {label}
            </Text>
          </View>
          {Icon && iconPosition === 'right' ? (
            <Icon color={foreground} size={iconSizes[size]} strokeWidth={2.2} />
          ) : null}
        </>
      )}
    </Pressable>
  );
}

