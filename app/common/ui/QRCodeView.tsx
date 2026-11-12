import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { captureRef } from 'react-native-view-shot';
import Svg, {
  Circle,
  Defs,
  G,
  Image as SvgImage,
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
import type { QrCornerStyle, QrLogoSize, QrPatternStyle } from '@/pages/share/types/share.types';
import { getDisplayMediaUrl, getImmediateDisplayMediaUrl, getMediaImageCacheKey, refreshDisplayMediaUrl } from '@/pages/profile/Services/mediaService';
import { resolveCompanyLogoPreset, resolveCompanyLogoVector } from '@/pages/cards/Services/companyLogoPresets';

export interface QrSvgRef {
  toDataURL?: (callback: (dataUrl: string) => void) => void;
  /** Rasterizes the on-screen QR (native) for Photos / widget export. */
  capturePngUri?: () => Promise<string | null>;
  /** Resolves once the center logo is drawn, so an export cannot run before it arrives. */
  whenLogoReady?: () => Promise<void>;
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
  centerLogoBackground?: string;
  centerLogoBorderColor?: string;
  patternStyle?: QrPatternStyle;
  cornerStyle?: QrCornerStyle;
  logoSize?: QrLogoSize;
  /** When true, overlays the raster BrandLogo icon PNG; defaults to the exact VC vector mark from the VCPROS logo so SVG-to-PNG export also captures it. */
  useBrandIconAsset?: boolean;
  getRef?: (ref: QrSvgRef | null) => void;
  style?: StyleProp<ViewStyle>;
};

/** Brandfetch's CDN serves its HTML website to non-browser agents; matches the API's image fetch. */
const LOGO_IMAGE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  Accept: 'image/webp,image/png,image/*',
};

/** Longest an export waits for the center logo; a logo that fails to load sends no event. */
const LOGO_EXPORT_WAIT_MS = 3000;

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
  centerLogoBackground,
  centerLogoBorderColor,
  patternStyle = 'dots',
  cornerStyle = 'rounded',
  logoSize = 'medium',
  useBrandIconAsset = false,
  getRef,
  style,
}: QRCodeViewProps) {
  const captureRootRef = useRef<any>(null);
  const svgRef = useRef<Svg | null>(null);
  const customCenterLogo = centerLogoUrl?.trim() ?? '';
  const customLogoPreset = resolveCompanyLogoPreset(customCenterLogo);
  const customLogoVector = resolveCompanyLogoVector(customCenterLogo);
  const useNativeLogo = Platform.OS === 'android' && showCenterLogo && Boolean(customCenterLogo && !customLogoVector);
  const [resolvedLogo, setResolvedLogo] = useState({ source: '', attempt: 0, uri: '' });
  const [logoAttempt, setLogoAttempt] = useState({ source: '', count: 0 });
  const attempt = logoAttempt.source === customCenterLogo ? logoAttempt.count : 0;
  const logoFailed = attempt >= 2;
  const resolvedCustomLogo = resolvedLogo.source === customCenterLogo && resolvedLogo.attempt === attempt
    ? resolvedLogo.uri
    : useNativeLogo ? '' : getImmediateDisplayMediaUrl(customCenterLogo);
  const handleLogoError = useCallback(() => {
    if (!useNativeLogo || logoFailed) return;
    setLogoAttempt((current) => current.source === customCenterLogo && current.count > attempt
      ? current
      : { source: customCenterLogo, count: attempt + 1 });
  }, [attempt, customCenterLogo, logoFailed, useNativeLogo]);

  React.useEffect(() => {
    if (!customCenterLogo || customLogoPreset || logoFailed) return;
    let active = true;
    const resolve = attempt ? refreshDisplayMediaUrl : getDisplayMediaUrl;
    resolve(customCenterLogo).then((uri) => {
      if (active) setResolvedLogo({ source: customCenterLogo, attempt, uri });
    }).catch(() => { if (active) handleLogoError(); });
    return () => { active = false; };
  }, [attempt, customCenterLogo, customLogoPreset, handleLogoError, logoFailed]);

  const cacheKey = getMediaImageCacheKey(customCenterLogo);
  const customLogoSource = customLogoVector || logoFailed
    ? undefined
    : customLogoPreset?.source ?? (resolvedCustomLogo ? {
      uri: resolvedCustomLogo,
      headers: LOGO_IMAGE_HEADERS,
      cacheKey: cacheKey && attempt === 0 ? cacheKey : undefined,
    } : undefined);
  const brandIconSource = useBrandIconAsset && !customCenterLogo
    ? getVcProsIconSource('light')
    : undefined;
  const logoImageKey = customCenterLogo ? `${customCenterLogo}|${resolvedCustomLogo}|${attempt}` : 'brand-icon';
  const needsLogoImage = showCenterLogo && !customLogoVector && !logoFailed && Boolean(customCenterLogo || brandIconSource);
  const [loadedLogoKey, setLoadedLogoKey] = useState('');
  const logoReady = !needsLogoImage || loadedLogoKey === logoImageKey;
  const logoReadyRef = useRef(logoReady);
  const logoWaitersRef = useRef(new Set<() => void>());

  React.useEffect(() => {
    if (!logoReady) {
      logoReadyRef.current = false;
      return undefined;
    }
    // Allow the image layer to draw before an export captures it.
    const frame = requestAnimationFrame(() => {
      logoReadyRef.current = true;
      logoWaitersRef.current.forEach((finish) => finish());
    });
    return () => cancelAnimationFrame(frame);
  }, [logoReady]);

  const whenLogoReady = useCallback(() => new Promise<void>((resolve) => {
    if (logoReadyRef.current) {
      resolve();
      return;
    }
    const finish = () => {
      clearTimeout(timeout);
      logoWaitersRef.current.delete(finish);
      resolve();
    };
    const timeout = setTimeout(finish, LOGO_EXPORT_WAIT_MS);
    logoWaitersRef.current.add(finish);
  }), []);

  const publishExportRef = useCallback(() => {
    if (!getRef) return;
    getRef({
      whenLogoReady,
      // Export the SVG itself first. Capturing the surrounding native view can
      // produce a solid background on iOS when react-native-view-shot runs
      // before react-native-svg has committed its drawing layer.
      toDataURL: (callback) => {
        if (useNativeLogo && captureRootRef.current) {
          void captureRef(captureRootRef.current, { format: 'png', result: 'base64' })
            .then(callback, () => callback(''));
          return;
        }
        const svg = svgRef.current;
        if (!svg?.toDataURL) {
          callback('');
          return;
        }
        svg.toDataURL(callback);
      },
      capturePngUri: async () => {
        const node = captureRootRef.current;
        if (!node) return null;
        try {
          return await captureRef(node, {
            format: 'png',
            quality: 1,
            result: 'tmpfile',
          });
        } catch {
          return null;
        }
      },
    });
  }, [getRef, useNativeLogo, whenLogoReady]);

  React.useEffect(() => {
    publishExportRef();
    return () => getRef?.(null);
  }, [getRef, publishExportRef, value, size, foregroundColor, backgroundColor, showCenterLogo, centerLogoUrl, centerLogoBackground, centerLogoBorderColor, patternStyle, cornerStyle, logoSize]);

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
  const vcStroke = isLightBg ? '#00A8E8' : '#E2E8F0';
  const centerIconSize = Math.round(size * 0.27);
  const logoScale = logoSize === 'small' ? 0.78 : logoSize === 'large' ? 1.16 : 1;
  const customLogoWidth = Math.round(size * 0.25 * logoScale);
  const customLogoHeight = Math.round(size * 0.15 * logoScale);
  const logoPlateWidth = Math.round(customLogoWidth + size * 0.045);
  const logoPlateHeight = Math.round(customLogoHeight + size * 0.04);
  const resolvedLogoBackground = centerLogoBackground?.trim() || (isLightBg ? '#ffffff' : '#f8fafc');
  const resolvedLogoBorder = centerLogoBorderColor?.trim() || accentColor;

  const content =
    value && qrData ? (
      <View
        ref={captureRootRef}
        collapsable={false}
        style={{ width: size, height: size }}
        className="items-center justify-center"
      >
        <Svg
          ref={svgRef}
          width={size}
          height={size}
          viewBox={`0 0 ${qrData.matrixSize} ${qrData.matrixSize}`}
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
              {cornerStyle === 'circle' ? (
                <>
                  <Circle cx={eye.col + 3.5} cy={eye.row + 3.5} r={3} fill="none" stroke={foregroundColor} strokeWidth={1.05} />
                  <Circle cx={eye.col + 3.5} cy={eye.row + 3.5} r={1.5} fill={foregroundColor} />
                </>
              ) : (
                <>
                  <Rect x={eye.col + 0.5} y={eye.row + 0.5} width={6} height={6}
                    rx={cornerStyle === 'rounded' ? 1.85 : 0} ry={cornerStyle === 'rounded' ? 1.85 : 0}
                    fill="none" stroke={foregroundColor} strokeWidth={1.05} />
                  <Rect x={eye.col + 2} y={eye.row + 2} width={3} height={3}
                    rx={cornerStyle === 'rounded' ? 0.85 : 0} ry={cornerStyle === 'rounded' ? 0.85 : 0}
                    fill={foregroundColor} />
                </>
              )}
            </G>
          ))}

          {/* Circular Data Dots */}
          {qrData.dots.map((dot, idx) => patternStyle === 'dots' ? (
            <Circle key={`dot-${idx}`} cx={dot.col + 0.5} cy={dot.row + 0.5} r={0.41} fill={foregroundColor} />
          ) : (
            <Rect key={`dot-${idx}`} x={dot.col + 0.08} y={dot.row + 0.08} width={0.84} height={0.84}
              rx={patternStyle === 'rounded' ? 0.25 : 0} fill={foregroundColor} />
          ))}

          {/* Exact Enterprise VC Logo Vector Mark from vcpros-logo-v3 */}
          {showCenterLogo && (logoFailed || (!useBrandIconAsset && !customCenterLogo)) ? (
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

          {showCenterLogo && (customLogoVector || customLogoSource || brandIconSource) ? (
            <G>
              {customCenterLogo ? (
                <Rect
                  x={(qrData.matrixSize - (logoPlateWidth / size) * qrData.matrixSize) / 2}
                  y={(qrData.matrixSize - (logoPlateHeight / size) * qrData.matrixSize) / 2}
                  width={(logoPlateWidth / size) * qrData.matrixSize}
                  height={(logoPlateHeight / size) * qrData.matrixSize}
                  rx={qrData.matrixSize * 0.035}
                  fill={resolvedLogoBackground}
                  stroke={resolvedLogoBorder}
                  strokeWidth={Math.max(0.18, qrData.matrixSize * 0.006)}
                />
              ) : null}
              {customLogoVector ? (
                <G
                  transform={`translate(${qrData.matrixSize / 2}, ${qrData.matrixSize / 2}) scale(${(qrData.matrixSize * 0.16 * logoScale) / 24}) translate(-12, -12)`}
                >
                  <Path d={customLogoVector.path} fill={customLogoVector.color} />
                </G>
              ) : !useNativeLogo ? (
                <SvgImage
                  key={logoImageKey}
                  href={(customLogoSource ?? brandIconSource)!}
                  onLoad={() => setLoadedLogoKey(logoImageKey)}
                  x={(qrData.matrixSize - (customCenterLogo ? customLogoWidth : centerIconSize) / size * qrData.matrixSize) / 2}
                  y={(qrData.matrixSize - (customCenterLogo ? customLogoHeight : centerIconSize) / size * qrData.matrixSize) / 2}
                  width={(customCenterLogo ? customLogoWidth : centerIconSize) / size * qrData.matrixSize}
                  height={(customCenterLogo ? customLogoHeight : centerIconSize) / size * qrData.matrixSize}
                  preserveAspectRatio="xMidYMid meet"
                />
              ) : null}
            </G>
          ) : null}
        </Svg>
        {useNativeLogo && customLogoSource ? (
          <View pointerEvents="none" style={{ position: 'absolute', left: (size - customLogoWidth) / 2, top: (size - customLogoHeight) / 2 }}>
            <Image
              key={logoImageKey}
              source={customLogoSource}
              style={{ width: customLogoWidth, height: customLogoHeight }}
              contentFit="contain"
              cachePolicy={attempt ? 'none' : 'memory-disk'}
              allowDownscaling={false}
              onDisplay={() => setLoadedLogoKey(logoImageKey)}
              onError={handleLogoError}
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
