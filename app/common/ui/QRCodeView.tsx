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
import { MediaImage } from './MediaImage';
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
  /** Company logo shown in the QR center. Empty values fall back to the VC Pros app mark. */
  centerLogoUrl?: string;
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
  centerLogoUrl,
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

  const isTransparentBg =
    !backgroundColor ||
    backgroundColor.trim().toLowerCase() === 'transparent';
  const isLightBg = isTransparentBg
    ? !isRgbaOrHexLight(foregroundColor)
    : isRgbaOrHexLight(backgroundColor);
  const vcTheme = isLightBg ? 'light' : 'dark';
  const vcStroke = isLightBg ? '#00A8E8' : '#E2E8F0';
  const centerIconSize = Math.round(size * 0.27);
  const customCenterLogo = centerLogoUrl?.trim() ?? '';
  const customLogoWidth = Math.round(size * 0.3);
  const customLogoHeight = Math.round(size * 0.18);

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
            {/* Enterprise Dark Navy-Slate Fill (keeps the dark color in the theme) */}
            <SvgLinearGradient id="qrVcGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#1E293B" />
              <Stop offset="50%" stopColor="#0F172A" />
              <Stop offset="100%" stopColor="#060D1A" />
            </SvgLinearGradient>
            <SvgLinearGradient id="qrTieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#334155" />
              <Stop offset="45%" stopColor="#1E293B" />
              <Stop offset="100%" stopColor="#090F1E" />
            </SvgLinearGradient>
            <SvgLinearGradient id="qrWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#38BDF8" />
              <Stop offset="55%" stopColor={accentColor} />
              <Stop offset="100%" stopColor="#1E3A8A" />
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
          {showCenterLogo && !useBrandIconAsset && !customCenterLogo ? (
            <G
              transform={`translate(${qrData.matrixSize / 2}, ${qrData.matrixSize / 2}) scale(${
                (qrData.matrixSize * 0.29) / 348
              }) translate(-224, -162)`}
            >
              {/* Geometric C (Right side of VC monogram) */}
              <Path
                d="M 392 144 C 366 120, 328 114, 290 122 C 244 132, 220 166, 222 210 C 224 254, 254 286, 304 290 C 340 293, 372 284, 396 266 L 370 224 C 354 235, 334 240, 314 238 C 290 235, 274 218, 274 198 C 274 176, 290 160, 316 158 C 334 156, 352 162, 368 174 Z"
                fill="url(#qrVcGrad)"
                stroke={vcStroke}
                strokeWidth={4.5}
                strokeLinejoin="round"
              />

              {/* Geometric V Left Arm */}
              <Path
                d="M 52 122 L 126 122 L 194 254 L 160 284 L 52 122 Z"
                fill="url(#qrVcGrad)"
                stroke={vcStroke}
                strokeWidth={4.5}
                strokeLinejoin="round"
              />

              {/* Executive Collar Wings */}
              <Path
                d="M 212 108 C 164 96, 132 70, 128 28 C 158 54, 192 64, 216 90 Z"
                fill="url(#qrWingGrad)"
                stroke={vcStroke}
                strokeWidth={4}
                strokeLinejoin="round"
              />
              <Path
                d="M 224 108 C 272 96, 304 70, 308 28 C 278 54, 244 64, 220 90 Z"
                fill="url(#qrWingGrad)"
                stroke={vcStroke}
                strokeWidth={4}
                strokeLinejoin="round"
              />

              {/* Angled Executive Tie (Forms the Right Arm of V) */}
              <G transform="rotate(11, 218, 114)">
                <Polygon
                  points="198,92 236,92 242,120 192,120"
                  fill="url(#qrTieGrad)"
                  stroke={vcStroke}
                  strokeWidth={4}
                  strokeLinejoin="round"
                />
                <Rect
                  x={194}
                  y={119}
                  width={46}
                  height={6.5}
                  rx={3.25}
                  fill="#38BDF8"
                  stroke="#060D1F"
                  strokeWidth={1.5}
                />
                <Polygon
                  points="194,126 240,126 254,250 217,294 180,250"
                  fill="url(#qrVcGrad)"
                  stroke={vcStroke}
                  strokeWidth={4.5}
                  strokeLinejoin="round"
                />
                <Polygon
                  points="196,128 217,128 217,290 183,249"
                  fill="rgba(56, 189, 248, 0.12)"
                />
              </G>
            </G>
          ) : null}
        </Svg>

        {showCenterLogo && (useBrandIconAsset || customCenterLogo) ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              width: customCenterLogo ? customLogoWidth : centerIconSize,
              height: customCenterLogo ? customLogoHeight : centerIconSize,
            }}
            className="items-center justify-center"
          >
            {customCenterLogo ? (
              <MediaImage
                sourceUrl={customCenterLogo}
                contentFit="contain"
                style={{ width: customLogoWidth, height: customLogoHeight }}
              />
            ) : (
              <Image
                source={getVcProsIconSource(vcTheme)}
                resizeMode="contain"
                style={{ width: centerIconSize, height: centerIconSize }}
              />
            )}
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
