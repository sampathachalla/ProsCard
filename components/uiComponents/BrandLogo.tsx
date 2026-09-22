import { Image, View, type ImageSourcePropType } from 'react-native';
import { Text } from './Text';

type BrandLogoSize = 'sm' | 'md' | 'header' | 'lg';
type BrandLogoVariant = 'wordmark' | 'badge';

type BrandLogoProps = {
  size?: BrandLogoSize;
  variant?: BrandLogoVariant;
  source?: ImageSourcePropType;
  accessibilityLabel?: string;
  className?: string;
};

const textSizeClasses: Record<BrandLogoSize, string> = {
  sm: 'text-base',
  md: 'text-xl',
  header: 'text-3xl',
  lg: 'text-4xl',
};

const badgeDimensions: Record<BrandLogoSize, { width: number; height: number; borderRadius: number }> = {
  sm: { width: 112, height: 44, borderRadius: 14 },
  md: { width: 136, height: 54, borderRadius: 17 },
  header: { width: 152, height: 60, borderRadius: 18 },
  lg: { width: 168, height: 68, borderRadius: 21 },
};

export function BrandLogo({
  size = 'md',
  variant = 'wordmark',
  source,
  accessibilityLabel = 'ProsCard logo',
  className = '',
}: BrandLogoProps) {
  const textSize = textSizeClasses[size];
  const isBadge = variant === 'badge';
  const dimensions = badgeDimensions[size];

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
      {source ? (
        <Image source={source} resizeMode="contain" style={isBadge ? { width: '88%', height: '78%' } : dimensions} />
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
