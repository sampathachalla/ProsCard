import React, { useMemo } from 'react';
import { Image, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient as SvgLinearGradient,
  Path,
  Polygon,
  Rect,
  Stop,
} from 'react-native-svg';
// @ts-expect-error qrcode is installed via react-native-qrcode-svg
import QRCodeGenerator from 'qrcode';
import { getVcProsIconSource } from './BrandLogo';
import { isRgbaOrHexLight } from '@/utils/cardThemeColor';

export interface QrSvgRef {
  toDataURL?: (callback: (dataUrl: string) => void) => void;
}

export type QRCodeViewProps = {
  value: string;
  size: number;
  foregroundColor?: string;
  backgroundColor?: string;
  accentColor?: string;
  framed?: boolean;
  padding?: number;
  showCenterLogo?: boolean;
  /** When true, overlays the raster BrandLogo icon PNG; defaults to the exact VC vector mark from the VCPROS logo so SVG-to-PNG export also captures it. */
  useBrandIconAsset?: boolean;
  getRef?: (ref: QrSvgRef | null) => void;
  style?: StyleProp<ViewStyle>;
};

function isFinderPattern(row: number, col: number, matrixSize: number): boolean {
  // Top-left 7x7 + 1 cell quiet separator
  if (row <= 7 && col <= 7) return true;
  // Top-right 7x7 + 1 cell quiet separator
  if (row <= 7 && col >= matrixSize - 8) return true;
  // Bottom-left 7x7 + 1 cell quiet separator
  if (row >= matrixSize - 8 && col <= 7) return true;
  return false;
}

function isCenterLogoZone(row: number, col: number, matrixSize: number): boolean {
  const center = (matrixSize - 1) / 2;
  const halfWidth = matrixSize * 0.175;
  const halfHeight = matrixSize * 0.155;
  return (
    Math.abs(col - center) <= halfWidth &&
    Math.abs(row - center) <= halfHeight
  );
}

export function QRCodeView({
  value,
  size,
  foregroundColor = '#ffffff',
  backgroundColor = '#111827',
  accentColor = '#38bdf8',
  framed = true,
  padding = 16,
  showCenterLogo = true,
  useBrandIconAsset = false,
  getRef,
  style,
}: QRCodeViewProps) {
  const qrData = useMemo(() => {
    if (!value) return null;
    try {
      const qr = QRCodeGenerator.create(value, {
        errorCorrectionLevel: 'H',
      });
      const matrixSize: number = qr.modules.size;
      const rawData: Uint8Array | number[] = qr.modules.data;
      const dots: { row: number; col: number }[] = [];

      for (let row = 0; row < matrixSize; row++) {
        for (let col = 0; col < matrixSize; col++) {
          if (isFinderPattern(row, col, matrixSize)) continue;
          if (showCenterLogo && isCenterLogoZone(row, col, matrixSize)) continue;
          if (rawData[row * matrixSize + col]) {
            dots.push({ row, col });
          }
        }
      }

      return { matrixSize, dots };
    } catch {
      return null;
    }
  }, [value, showCenterLogo]);

  const isLightBg = isRgbaOrHexLight(backgroundColor);
  const vcTheme = isLightBg ? 'light' : 'dark';
  const vcGradStart = isLightBg ? '#1E293B' : '#FFFFFF';
  const vcGradMid = isLightBg ? '#0F172A' : '#F1F5F9';
  const vcGradEnd = isLightBg ? '#090D16' : '#CBD5E1';
  const vcStroke = '#040B1A';
  const centerIconSize = Math.round(size * 0.27);

  const content =
    value && qrData ? (
      <View style={{ width: size, height: size }} className="items-center justify-center">
        <Svg
          width={size}
          height={size}
          viewBox={`0 0 ${qrData.matrixSize} ${qrData.matrixSize}`}
          ref={(ref) => getRef?.(ref as unknown as QrSvgRef | null)}
        >
          <Defs>
            <SvgLinearGradient id="qrVcGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={vcGradStart} />
              <Stop offset="55%" stopColor={vcGradMid} />
              <Stop offset="100%" stopColor={vcGradEnd} />
            </SvgLinearGradient>
            <SvgLinearGradient id="qrWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#22D3EE" />
              <Stop offset="55%" stopColor={accentColor} />
              <Stop offset="100%" stopColor="#1D4ED8" />
            </SvgLinearGradient>
          </Defs>

          {/* Background */}
          <Rect
            x={0}
            y={0}
            width={qrData.matrixSize}
            height={qrData.matrixSize}
            rx={1.5}
            fill={backgroundColor}
          />

          {/* 3 Rounded Finder Eyes (Top-Left, Top-Right, Bottom-Left) */}
          {[
            { row: 0, col: 0 },
            { row: 0, col: qrData.matrixSize - 7 },
            { row: qrData.matrixSize - 7, col: 0 },
          ].map((eye, idx) => (
            <G key={`eye-${idx}`}>
              {/* Outer rounded-square ring */}
              <Rect
                x={eye.col + 0.5}
                y={eye.row + 0.5}
                width={6}
                height={6}
                rx={1.85}
                ry={1.85}
                fill="none"
                stroke={foregroundColor}
                strokeWidth={1.05}
              />
              {/* Inner rounded-square core */}
              <Rect
                x={eye.col + 2}
                y={eye.row + 2}
                width={3}
                height={3}
                rx={0.85}
                ry={0.85}
                fill={foregroundColor}
              />
            </G>
          ))}

          {/* Circular Data Dots */}
          {qrData.dots.map((dot, idx) => (
            <Circle
              key={`dot-${idx}`}
              cx={dot.col + 0.5}
              cy={dot.row + 0.5}
              r={0.41}
              fill={foregroundColor}
            />
          ))}

          {/* Exact Enterprise VC Logo Vector Mark from vcpros-logo-v3 */}
          {showCenterLogo && !useBrandIconAsset ? (
            <G
              transform={`translate(${qrData.matrixSize / 2}, ${qrData.matrixSize / 2}) scale(${
                (qrData.matrixSize * 0.29) / 356
              }) translate(-222, -165)`}
            >
              {/* Sleek Executive Collar Wings above Tie Knot */}
              <Path
                d="M 212 120 C 160 98, 128 74, 120 30 C 156 58, 192 66, 218 92 C 222 98, 218 110, 212 120 Z"
                fill="url(#qrWingGrad)"
                stroke={vcStroke}
                strokeWidth={4}
                strokeLinejoin="round"
              />
              <Path
                d="M 244 120 C 296 98, 328 74, 336 30 C 300 58, 264 66, 238 92 C 234 98, 238 110, 244 120 Z"
                fill="url(#qrWingGrad)"
                stroke={vcStroke}
                strokeWidth={4}
                strokeLinejoin="round"
              />

              {/* Geometric V Left Arm */}
              <Path
                d="M 46 124 L 122 124 L 192 258 L 152 292 L 46 124 Z"
                fill="url(#qrVcGrad)"
                stroke={vcStroke}
                strokeWidth={4.5}
                strokeLinejoin="round"
              />

              {/* Precision Geometric C */}
              <Path
                d="M 396 144 C 370 122, 332 116, 296 124 C 252 134, 228 168, 230 212 C 232 256, 262 288, 310 292 C 344 295, 374 286, 398 268 L 372 226 C 356 237, 336 242, 318 240 C 294 237, 280 220, 280 200 C 280 178, 296 162, 320 160 C 338 158, 356 164, 370 176 Z"
                fill="url(#qrVcGrad)"
                stroke={vcStroke}
                strokeWidth={4.5}
                strokeLinejoin="round"
              />

              {/* Executive Tie Knot, Faceted Blade & Collar Bar */}
              <Polygon
                points="210,98 246,98 252,128 204,128"
                fill="url(#qrVcGrad)"
                stroke={vcStroke}
                strokeWidth={4}
                strokeLinejoin="round"
              />
              <Polygon
                points="206,134 250,134 264,256 228,300 192,256"
                fill="url(#qrVcGrad)"
                stroke={vcStroke}
                strokeWidth={4.5}
                strokeLinejoin="round"
              />
              <Polygon
                points="228,136 248,136 261,255 228,296"
                fill={isLightBg ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.16)'}
              />
              <Rect
                x={206}
                y={127}
                width={44}
                height={6.5}
                rx={3.25}
                fill="#38BDF8"
                stroke={vcStroke}
                strokeWidth={2}
              />
            </G>
          ) : null}
        </Svg>

        {showCenterLogo && useBrandIconAsset ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              width: centerIconSize,
              height: centerIconSize,
            }}
            className="items-center justify-center"
          >
            <Image
              source={getVcProsIconSource(vcTheme)}
              resizeMode="contain"
              style={{ width: centerIconSize, height: centerIconSize }}
            />
          </View>
        ) : null}
      </View>
    ) : (
      <View style={{ width: size, height: size, backgroundColor, opacity: 0.6 }} />
    );

  if (!framed) {
    return (
      <View
        accessibilityLabel="Contact QR code"
        accessibilityRole="image"
        style={style}
      >
        {content}
      </View>
    );
  }

  return (
    <View
      accessibilityLabel="Contact QR code"
      accessibilityRole="image"
      style={[
        {
          padding,
          backgroundColor,
          borderRadius: 24,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 3,
        },
        style,
      ]}
      className="items-center justify-center border border-slate-200/80 dark:border-slate-800"
    >
      {content}
    </View>
  );
}
