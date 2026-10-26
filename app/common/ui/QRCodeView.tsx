import React, { useMemo } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, G, Path, Polygon, Rect } from 'react-native-svg';
// @ts-expect-error qrcode is installed via react-native-qrcode-svg
import QRCodeGenerator from 'qrcode';

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
  const halfWidth = matrixSize * 0.165;
  const halfHeight = matrixSize * 0.145;
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
  accentColor,
  framed = true,
  padding = 16,
  showCenterLogo = true,
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

  const wingColor = accentColor ?? '#38bdf8';

  const content =
    value && qrData ? (
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${qrData.matrixSize} ${qrData.matrixSize}`}
        ref={(ref) => getRef?.(ref as unknown as QrSvgRef | null)}
      >
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

        {/* Centered VC Brand Mark */}
        {showCenterLogo ? (
          <G
            transform={`translate(${qrData.matrixSize / 2}, ${qrData.matrixSize / 2}) scale(${
              (qrData.matrixSize * 0.27) / 100
            }) translate(-50, -50)`}
          >
            {/* Collar Wings above Tie */}
            <Path
              d="M 43 33 C 28 24, 19 16, 20 2 C 29 12, 40 14, 45 23 C 47 26, 46 30, 43 33 Z"
              fill={wingColor}
            />
            <Path
              d="M 55 33 C 70 24, 79 16, 78 2 C 69 12, 58 14, 53 23 C 51 26, 52 30, 55 33 Z"
              fill={wingColor}
            />

            {/* V Left Arm */}
            <Path
              d="M 4 32 L 24 32 L 41 72 L 30 82 L 4 32 Z"
              fill={foregroundColor}
            />

            {/* Tie Knot & Blade (Right arm of V / Center divider) */}
            <Polygon points="44,25 54,25 56,34 42,34" fill={foregroundColor} />
            <Polygon
              points="42,36 56,36 60,72 49,86 38,72"
              fill={foregroundColor}
            />

            {/* Bold C Letter */}
            <Path
              d="M 96 38 C 89 31, 78 29, 68 32 C 56 36, 50 47, 51 60 C 52 73, 61 82, 74 83 C 83 84, 91 81, 97 76 L 89 62 C 85 66, 79 67, 74 66 C 67 65, 64 60, 64 54 C 64 48, 68 43, 75 43 C 80 42, 85 44, 89 48 Z"
              fill={foregroundColor}
            />
          </G>
        ) : null}
      </Svg>
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
