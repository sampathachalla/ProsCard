import { Image, View, type ImageSourcePropType } from 'react-native';
import mindProsLogoLight from '@/assets/mindpros-logo-light.png';
import mindProsLogoDark from '@/assets/mindpros-logo-dark.png';
import { useThemeContext } from '@/context/ThemeContext';
import { Text } from './Text';

type BrandLogoSize = 'sm' | 'md' | 'header' | 'lg' | 'xl' | 'xxl';
type BrandLogoVariant = 'wordmark' | 'badge';

type BrandLogoProps = {
  size?: BrandLogoSize;
  variant?: BrandLogoVariant;
  /** Override both themes. Prefer omitting this so light/dark assets auto-switch. */
  source?: ImageSourcePropType;
  sourceLight?: ImageSourcePropType;
  sourceDark?: ImageSourcePropType;
  accessibilityLabel?: string;
  className?: string;
};

const textSizeClasses: Record<BrandLogoSize, string> = {
  sm: 'text-base',
  md: 'text-xl',
  header: 'text-3xl',
  lg: 'text-4xl',
  xl: 'text-5xl',
  xxl: 'text-6xl',
};

const badgeDimensions: Record<BrandLogoSize, { width: number; height: number; borderRadius: number }> = {
  sm: { width: 112, height: 44, borderRadius: 14 },
  md: { width: 136, height: 54, borderRadius: 17 },
  header: { width: 152, height: 60, borderRadius: 18 },
  lg: { width: 168, height: 68, borderRadius: 21 },
  xl: { width: 240, height: 96, borderRadius: 24 },
  xxl: { width: 320, height: 128, borderRadius: 28 },
};

/** Theme-aware MindPros mark: light asset on light UI, dark asset on dark UI. */
export function getMindProsLogoSource(theme: 'light' | 'dark'): ImageSourcePropType {
  return theme === 'dark' ? mindProsLogoDark : mindProsLogoLight;
}

export function BrandLogo({
  size = 'md',
  variant = 'wordmark',
  source,
  sourceLight = mindProsLogoLight,
  sourceDark = mindProsLogoDark,
  accessibilityLabel = 'MindPROS logo',
  className = '',
}: BrandLogoProps) {
  const { theme } = useThemeContext();
  const textSize = textSizeClasses[size];
  const isBadge = variant === 'badge';
  const dimensions = badgeDimensions[size];

  const resolvedSource =
    source ?? (theme === 'dark' ? sourceDark : sourceLight);

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      className={`flex-row items-center justify-center ${
        isBadge ? 'border border-white/20 bg-slate-950/90 shadow-sm' : ''
      } ${className}`}
      style={isBadge ? dimensions : undefined}
    >
      {resolvedSource ? (
        <Image
          source={resolvedSource}
          resizeMode="contain"
          style={isBadge ? { width: '88%', height: '78%' } : dimensions}
        />
      ) : (
        <Text
          className={`${textSize} font-black tracking-tight ${
            isBadge ? 'text-slate-900' : 'text-textPrimary dark:text-dark-textPrimary'
          }`}
        >
          Pros
          <Text className={`${textSize} font-black tracking-tight text-primary dark:text-dark-primary`}>
            Card
          </Text>
        </Text>
      )}
    </View>
  );
}
