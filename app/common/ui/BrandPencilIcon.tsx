import React from 'react';
import {
  Image,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, {
  Defs,
  G,
  LinearGradient as SvgLinearGradient,
  Polygon,
  Rect,
  Stop,
} from 'react-native-svg';
import vcProsPencilIconDark from '@/assets/vcpros-pencil-icon-dark.png';
import vcProsPencilIconLight from '@/assets/vcpros-pencil-icon-light.png';
import { useThemeContext } from '@/context/ThemeContext';

export type BrandPencilIconProps = {
  /** Width and height of the icon in dp (defaults to 22). */
  size?: number;
  /** Override theme ('dark' uses platinum border; 'light' uses dark navy border). */
  themeMode?: 'light' | 'dark';
  /** Tilt angle in degrees (defaults to 14° to match the VC logo tie/pencil angle). */
  angle?: number;
  /** When true, renders the raster PNG asset instead of the inline vector SVG. */
  useRasterAsset?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  className?: string;
};

/** Theme-aware VCPROS standalone pencil/tie icon asset source. */
export function getVcProsPencilIconSource(
  theme: 'light' | 'dark' = 'dark',
): ImageSourcePropType {
  return theme === 'dark' ? vcProsPencilIconDark : vcProsPencilIconLight;
}

export function BrandPencilIcon({
  size = 22,
  themeMode,
  angle = 14,
  useRasterAsset = false,
  accessibilityLabel = 'Edit',
  style,
  className = '',
}: BrandPencilIconProps) {
  const { theme } = useThemeContext();
  const effectiveTheme = themeMode ?? theme;
  const isDark = effectiveTheme === 'dark';
  const outerStroke = isDark ? '#E2E8F0' : '#00A8E8';

  if (useRasterAsset) {
    return (
      <View
        accessible
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="image"
        className={`items-center justify-center ${className}`}
        style={[{ width: size, height: size }, style]}
      >
        <Image
          source={getVcProsPencilIconSource(effectiveTheme)}
          resizeMode="contain"
          style={{ width: size, height: size }}
        />
      </View>
    );
  }

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      className={`items-center justify-center ${className}`}
      style={[{ width: size, height: size }, style]}
    >
      <Svg width={size} height={size} viewBox="0 0 240 240">
        <Defs>
          <SvgLinearGradient id="vcPencilBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#1E293B" />
            <Stop offset="50%" stopColor="#0F172A" />
            <Stop offset="100%" stopColor="#060D1A" />
          </SvgLinearGradient>
          <SvgLinearGradient id="vcPencilCap" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#334155" />
            <Stop offset="45%" stopColor="#1E293B" />
            <Stop offset="100%" stopColor="#090F1E" />
          </SvgLinearGradient>
          <SvgLinearGradient id="vcPencilFerrule" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#38BDF8" />
            <Stop offset="50%" stopColor="#0284C7" />
            <Stop offset="100%" stopColor="#38BDF8" />
          </SvgLinearGradient>
        </Defs>

        <G transform={`translate(120, 120) rotate(${angle}) translate(-217, -193)`}>
          {/* Top Crown / Eraser Cap */}
          <Polygon
            points="198,90 236,90 242,118 192,118"
            fill="url(#vcPencilCap)"
            stroke={outerStroke}
            strokeWidth={5}
            strokeLinejoin="round"
          />

          {/* Faceted Pencil / Tie Blade Shaft & Tip */}
          <Polygon
            points="192,128 242,128 254,250 217,296 180,250"
            fill="url(#vcPencilBody)"
            stroke={outerStroke}
            strokeWidth={5.2}
            strokeLinejoin="round"
          />

          {/* Left Dimensional Light Facet */}
          <Polygon
            points="194,130 217,130 217,292 183,249"
            fill="rgba(56, 189, 248, 0.16)"
          />

          {/* Cyan Nib Accent at the Bottom Point */}
          <Polygon
            points="204,274 230,274 217,292"
            fill="rgba(56, 189, 248, 0.36)"
          />

          {/* Cyan Ferrule Band */}
          <Rect
            x={191}
            y={118}
            width={52}
            height={10}
            rx={5}
            fill="url(#vcPencilFerrule)"
            stroke={outerStroke}
            strokeWidth={3}
          />
        </G>
      </Svg>
    </View>
  );
}
