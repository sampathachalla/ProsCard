import { View, useWindowDimensions, type ImageSourcePropType } from 'react-native';
import { Image, type ImageProps, type ImageRef } from 'expo-image';
import vcProsLogoForLightTheme from '@/assets/vcpros-logo-v3-light.png'; // Enterprise Navy VC + cyan PROS
import vcProsLogoForDarkTheme from '@/assets/vcpros-logo-v3-dark.png'; // Enterprise White VC + cyan PROS
import vcProsIconForLightTheme from '@/assets/vcpros-icon-v3-light.png';
import vcProsIconForDarkTheme from '@/assets/vcpros-icon-v3-dark.png';
import { useThemeContext } from '@/context/ThemeContext';
import { Text } from './Text';

type BrandLogoSize = 'sm' | 'md' | 'header' | 'lg' | 'xl' | 'xxl';
type BrandLogoVariant = 'wordmark' | 'badge' | 'icon';

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

const wordmarkDimensions: Record<BrandLogoSize, { width: number; height: number; borderRadius: number }> = {
  sm: { width: 112, height: 44, borderRadius: 14 },
  md: { width: 136, height: 54, borderRadius: 17 },
  // Home header wordmark — larger footprint, still fits the header bar
  header: { width: 200, height: 56, borderRadius: 16 },
  lg: { width: 168, height: 68, borderRadius: 21 },
  xl: { width: 280, height: 100, borderRadius: 24 },
  // Auth welcome / login / signup — wide wordmark, taller footprint
  xxl: { width: 380, height: 140, borderRadius: 28 },
};

/** Square identity mark sizes (VC + cards icon). */
const iconDimensions: Record<BrandLogoSize, { width: number; height: number; borderRadius: number }> = {
  sm: { width: 36, height: 36, borderRadius: 10 },
  md: { width: 44, height: 44, borderRadius: 12 },
  header: { width: 64, height: 64, borderRadius: 16 },
  lg: { width: 56, height: 56, borderRadius: 14 },
  xl: { width: 72, height: 72, borderRadius: 18 },
  xxl: { width: 96, height: 96, borderRadius: 22 },
};

/** Space kept free beside the logo: the screen's padding on both sides. */
const LOGO_SIDE_MARGIN = 40;

/** Decoded logos held in memory, so a page never has to wait for its logo after it appears. */
const preloadedLogos = new Map<ImageSourcePropType, ImageRef>();

/** Decodes every logo up front; one that fails simply loads the normal way when it is shown. */
export async function preloadBrandLogos(): Promise<void> {
  const logos = [
    vcProsLogoForLightTheme,
    vcProsLogoForDarkTheme,
    vcProsIconForLightTheme,
    vcProsIconForDarkTheme,
  ];
  await Promise.allSettled(
    logos.map(async (logo) => {
      preloadedLogos.set(logo, await Image.loadAsync(logo));
    }),
  );
}

/**
 * expo-image on iOS paints a preloaded image as soon as it receives it, which can be before it
 * receives contentFit, so the image falls back to "cover" and gets cropped. Sizing the view to the
 * image's own shape keeps the whole logo visible whichever fit it ends up with.
 */
function fitPreloadedLogo(logo: ImageRef, box: { width: number; height: number }) {
  const aspectRatio = logo.width / logo.height;
  const width = Math.min(box.width, box.height * aspectRatio);
  return { width, height: width / aspectRatio };
}

/** Theme-aware VCPROS wordmark. */
export function getVcProsLogoSource(theme: 'light' | 'dark'): ImageSourcePropType {
  return theme === 'dark' ? vcProsLogoForDarkTheme : vcProsLogoForLightTheme;
}

/** Theme-aware VCPROS square icon. */
export function getVcProsIconSource(theme: 'light' | 'dark'): ImageSourcePropType {
  return theme === 'dark' ? vcProsIconForDarkTheme : vcProsIconForLightTheme;
}

/** @deprecated Prefer getVcProsLogoSource */
export function getMindProsLogoSource(theme: 'light' | 'dark'): ImageSourcePropType {
  return getVcProsLogoSource(theme);
}

export function BrandLogo({
  size = 'md',
  variant = 'wordmark',
  source,
  sourceLight,
  sourceDark,
  accessibilityLabel = 'VCPROS logo',
  className = '',
}: BrandLogoProps) {
  const { theme } = useThemeContext();
  const textSize = textSizeClasses[size];
  const isBadge = variant === 'badge';
  const isIcon = variant === 'icon';
  const { width: windowWidth } = useWindowDimensions();

  const defaultLight = isIcon ? vcProsIconForLightTheme : vcProsLogoForLightTheme;
  const defaultDark = isIcon ? vcProsIconForDarkTheme : vcProsLogoForDarkTheme;
  const resolvedLight = sourceLight ?? defaultLight;
  const resolvedDark = sourceDark ?? defaultDark;

  const fixed = isIcon ? iconDimensions[size] : wordmarkDimensions[size];
  const scale = isIcon
    ? 1
    : Math.min(1, Math.max(0, windowWidth - LOGO_SIDE_MARGIN) / fixed.width);
  const dimensions = {
    width: Math.round(fixed.width * scale),
    height: Math.round(fixed.height * scale),
    borderRadius: Math.round(fixed.borderRadius * scale),
  };

  const resolvedSource =
    source ?? (theme === 'dark' ? resolvedDark : resolvedLight);
  const alignSelf = isIcon || size === 'header' ? 'flex-start' : 'center';
  const preloadedLogo = isBadge || !resolvedSource ? undefined : preloadedLogos.get(resolvedSource);

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      className={`items-center justify-center ${
        isBadge ? 'border border-white/20 bg-slate-950/90 shadow-sm' : ''
      } ${className}`}
      style={isBadge ? dimensions : { alignSelf, width: dimensions.width, height: dimensions.height }}
    >
      {resolvedSource ? (
        <Image
          source={(preloadedLogo ?? resolvedSource) as ImageProps['source']}
          contentFit="contain"
          style={
            isBadge
              ? { width: '88%', height: '78%' }
              : preloadedLogo
                ? fitPreloadedLogo(preloadedLogo, dimensions)
                : { width: dimensions.width, height: dimensions.height }
          }
        />
      ) : (
        <Text
          className={`${textSize} font-black tracking-tight ${
            isBadge ? 'text-slate-900' : 'text-textPrimary dark:text-dark-textPrimary'
          }`}
        >
          VC
          <Text className={`${textSize} font-black tracking-tight text-primary dark:text-dark-primary`}>
            PROS
          </Text>
        </Text>
      )}
    </View>
  );
}
