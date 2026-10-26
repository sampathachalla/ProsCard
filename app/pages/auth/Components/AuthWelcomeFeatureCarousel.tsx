import React, { useRef, useState } from 'react';
import {
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient as SvgLinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { useSharedValue } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';
import { Text } from '@/common/ui/Text';
import { PaginationDots } from '@/common/ui/PaginationDots';

export type WelcomeSlide = {
  id: 'tap-network' | 'capture-leads' | 'turn-deals';
  badge: string;
  headline: string;
  description: string;
};

export const WELCOME_SLIDES: WelcomeSlide[] = [
  {
    id: 'tap-network',
    badge: 'INSTANT SHARE',
    headline: 'Your network,\none tap away.',
    description:
      'Create a beautiful digital business card and share it instantly — QR, link, or NFC tap.',
  },
  {
    id: 'capture-leads',
    badge: 'SMART SCANNER',
    headline: 'Capture every\nlead on the spot.',
    description:
      'Scan QR cards, paper cards, or event badges — each new contact lands straight in your CRM.',
  },
  {
    id: 'turn-deals',
    badge: 'GROWTH & FOLLOW-UP',
    headline: 'Turn contacts\ninto deals.',
    description:
      'See who viewed your card, track your pipeline, and follow up before the moment cools.',
  },
];

/** Slide 1 Illustration: Two tilted phones exchanging a glowing digital business card. */
function TapShareIllustration() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 340 270">
      <Defs>
        <RadialGradient id="tapGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#38bdf8" stopOpacity="0.32" />
          <Stop offset="55%" stopColor="#2563eb" stopOpacity="0.14" />
          <Stop offset="100%" stopColor="#020617" stopOpacity="0" />
        </RadialGradient>
        <SvgLinearGradient id="phoneScreenL" x1="0" y1="0" x2="0.4" y2="1">
          <Stop offset="0%" stopColor="#3b82f6" />
          <Stop offset="45%" stopColor="#1d4ed8" />
          <Stop offset="100%" stopColor="#090d16" />
        </SvgLinearGradient>
        <SvgLinearGradient id="phoneScreenR" x1="0" y1="0" x2="0.4" y2="1">
          <Stop offset="0%" stopColor="#38bdf8" />
          <Stop offset="45%" stopColor="#2563eb" />
          <Stop offset="100%" stopColor="#090d16" />
        </SvgLinearGradient>
        <SvgLinearGradient id="floatingCardGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#1e293b" />
          <Stop offset="100%" stopColor="#0f172a" />
        </SvgLinearGradient>
        <SvgLinearGradient id="cuffLeft" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#3b82f6" />
          <Stop offset="100%" stopColor="#1d4ed8" />
        </SvgLinearGradient>
        <SvgLinearGradient id="cuffRight" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#38bdf8" />
          <Stop offset="100%" stopColor="#2563eb" />
        </SvgLinearGradient>
      </Defs>

      {/* Ambient background blob & particles */}
      <Circle cx="170" cy="132" r="118" fill="url(#tapGlow)" />
      <Circle cx="68" cy="66" r="4" fill="#38bdf8" opacity="0.2" />
      <Circle cx="278" cy="70" r="5" fill="#2563eb" opacity="0.25" />
      <Circle cx="52" cy="128" r="3" fill="#38bdf8" opacity="0.18" />
      <Circle cx="288" cy="124" r="3.5" fill="#38bdf8" opacity="0.2" />

      {/* Left Hand & Tilted Phone */}
      <G transform="translate(96, 134) rotate(13)">
        {/* Back hand palm */}
        <Path
          d="M-58,42 C-48,22 -36,15 -26,18 L-20,82 L-64,98 Z"
          fill="#f4a98c"
        />
        {/* Phone Body */}
        <Rect
          x="-36"
          y="-68"
          width="72"
          height="138"
          rx="12"
          fill="#0f172a"
          stroke="#3b82f6"
          strokeWidth="2"
        />
        <Rect x="-32" y="-64" width="64" height="130" rx="9" fill="url(#phoneScreenL)" />
        {/* Speaker notch */}
        <Rect x="-10" y="-59" width="20" height="3.5" rx="1.75" fill="#0f172a" />
        {/* Fingertips on right edge of left phone */}
        <Rect x="32" y="8" width="9" height="6" rx="3" fill="#f4a98c" />
        <Rect x="32" y="20" width="9" height="6" rx="3" fill="#f4a98c" />
        <Rect x="32" y="32" width="8" height="6" rx="3" fill="#f4a98c" />
        {/* Thumb wrapping front */}
        <Path
          d="M-46,36 C-34,20 -16,14 -8,20 C-4,24 -10,32 -24,42 L-42,58 Z"
          fill="#f7bba2"
        />
      </G>

      {/* Right Hand & Tilted Phone */}
      <G transform="translate(244, 134) rotate(-13)">
        {/* Back hand palm */}
        <Path
          d="M58,42 C48,22 36,15 26,18 L20,82 L64,98 Z"
          fill="#f4a98c"
        />
        {/* Phone Body */}
        <Rect
          x="-36"
          y="-68"
          width="72"
          height="138"
          rx="12"
          fill="#0f172a"
          stroke="#38bdf8"
          strokeWidth="2"
        />
        <Rect x="-32" y="-64" width="64" height="130" rx="9" fill="url(#phoneScreenR)" />
        {/* Speaker notch */}
        <Rect x="-10" y="-59" width="20" height="3.5" rx="1.75" fill="#0f172a" />
        {/* Fingertips on left edge of right phone */}
        <Rect x="-41" y="8" width="9" height="6" rx="3" fill="#f4a98c" />
        <Rect x="-41" y="20" width="9" height="6" rx="3" fill="#f4a98c" />
        <Rect x="-40" y="32" width="8" height="6" rx="3" fill="#f4a98c" />
        {/* Thumb wrapping front */}
        <Path
          d="M46,36 C34,20 16,14 8,20 C4,24 10,32 24,42 L42,58 Z"
          fill="#f7bba2"
        />
      </G>

      {/* Left & Right Sleeve Cuffs */}
      <Path d="M18,216 L54,238 L38,262 L4,240 Z" fill="url(#cuffLeft)" />
      <Path d="M322,216 L286,238 L302,262 L336,240 Z" fill="url(#cuffRight)" />

      {/* Glowing Orbital Energy Rings */}
      <G transform="translate(170, 128) rotate(-8)">
        <Ellipse
          cx="0"
          cy="10"
          rx="62"
          ry="16"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2"
          strokeDasharray="8 4"
          opacity="0.75"
        />
        <Ellipse
          cx="0"
          cy="10"
          rx="46"
          ry="11"
          fill="none"
          stroke="#e0f2fe"
          strokeWidth="1.5"
          opacity="0.85"
        />
      </G>

      {/* Floating Digital Business Card in Center */}
      <G transform="translate(170, 114) rotate(-6)">
        <Rect
          x="-46"
          y="-26"
          width="92"
          height="52"
          rx="10"
          fill="url(#floatingCardGrad)"
          stroke="#38bdf8"
          strokeWidth="1.5"
        />
        {/* Avatar Circle */}
        <Circle cx="-22" cy="0" r="14" fill="#2563eb" />
        <Circle cx="-22" cy="-3" r="5" fill="#f7bba2" />
        <Path d="M-31,11 C-29,5 -15,5 -13,11" fill="#38bdf8" />
        {/* Card Text Lines */}
        <Rect x="-1" y="-10" width="34" height="4.5" rx="2.25" fill="#cbd5e1" />
        <Rect x="-1" y="-1" width="26" height="4" rx="2" fill="#64748b" />
        <Circle cx="1" cy="9" r="2" fill="#38bdf8" />
        <Rect x="6" y="7" width="22" height="4" rx="2" fill="#64748b" />
      </G>
    </Svg>
  );
}

/** Slide 2 Illustration: Scanning a lanyard QR badge into a live contact list. */
function LeadScannerIllustration() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 340 270">
      <Defs>
        <RadialGradient id="scanGlow" cx="52%" cy="48%" r="50%">
          <Stop offset="0%" stopColor="#2563eb" stopOpacity="0.30" />
          <Stop offset="60%" stopColor="#00a8e8" stopOpacity="0.10" />
          <Stop offset="100%" stopColor="#020617" stopOpacity="0" />
        </RadialGradient>
        <SvgLinearGradient id="badgeGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#1e293b" />
          <Stop offset="100%" stopColor="#0f172a" />
        </SvgLinearGradient>
        <SvgLinearGradient id="scanBeam" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
          <Stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
        </SvgLinearGradient>
      </Defs>

      <Circle cx="175" cy="130" r="120" fill="url(#scanGlow)" />

      {/* Floating captured mini cards on top-right */}
      {[
        { x: 244, y: 38, rot: -10 },
        { x: 230, y: 74, rot: -5 },
        { x: 222, y: 110, rot: -2 },
      ].map((c, idx) => (
        <G key={idx} transform={`translate(${c.x}, ${c.y}) rotate(${c.rot})`}>
          <Rect
            x="0"
            y="0"
            width="52"
            height="26"
            rx="6"
            fill="#0f172a"
            stroke="#1e293b"
            strokeWidth="1.2"
          />
          <Circle cx="12" cy="13" r="6.5" fill="#2563eb" />
          <Circle cx="12" cy="11.5" r="2.5" fill="#f7bba2" />
          <Rect x="23" y="8" width="20" height="3" rx="1.5" fill="#94a3b8" />
          <Rect x="23" y="14" width="14" height="2.5" rx="1.25" fill="#475569" />
        </G>
      ))}

      {/* Left Lanyard Straps + Event QR Badge */}
      <Path d="M74,0 L102,42 L110,42 L86,0 Z" fill="#2563eb" />
      <Path d="M118,0 L106,42 L114,42 L128,0 Z" fill="#1d4ed8" />

      <G transform="translate(112, 86) rotate(-12)">
        {/* Lanyard clip */}
        <Rect x="-8" y="-48" width="16" height="10" rx="3" fill="#475569" />
        {/* Badge Card */}
        <Rect
          x="-32"
          y="-40"
          width="64"
          height="92"
          rx="8"
          fill="url(#badgeGrad)"
          stroke="#334155"
          strokeWidth="1.5"
        />
        {/* Badge Avatar + Header lines */}
        <Circle cx="-14" cy="-20" r="8" fill="#334155" />
        <Rect x="-1" y="-24" width="24" height="3.5" rx="1.75" fill="#64748b" />
        <Rect x="-1" y="-17" width="16" height="3" rx="1.5" fill="#475569" />
        {/* QR Code Grid inside Badge */}
        <G transform="translate(-18, -2)">
          <Rect x="0" y="0" width="12" height="12" rx="2" fill="none" stroke="#e2e8f0" strokeWidth="2.2" />
          <Rect x="4" y="4" width="4" height="4" fill="#e2e8f0" />
          <Rect x="24" y="0" width="12" height="12" rx="2" fill="none" stroke="#e2e8f0" strokeWidth="2.2" />
          <Rect x="28" y="4" width="4" height="4" fill="#e2e8f0" />
          <Rect x="0" y="24" width="12" height="12" rx="2" fill="none" stroke="#e2e8f0" strokeWidth="2.2" />
          <Rect x="4" y="28" width="4" height="4" fill="#e2e8f0" />
          <Rect x="16" y="4" width="4" height="4" fill="#e2e8f0" />
          <Rect x="16" y="14" width="6" height="6" fill="#38bdf8" />
          <Rect x="26" y="18" width="8" height="4" fill="#e2e8f0" />
          <Rect x="16" y="26" width="8" height="8" rx="1.5" fill="#e2e8f0" />
          <Rect x="28" y="28" width="6" height="6" fill="#e2e8f0" />
        </G>
      </G>

      {/* Left Hand holding the badge */}
      <Path
        d="M28,250 L62,138 C68,124 82,118 90,124 L98,144 C104,132 114,126 120,132 C124,138 116,158 104,178 L86,260 Z"
        fill="#f4a98c"
      />
      <Path d="M12,268 L52,196 L94,218 L66,270 Z" fill="#1e3a8a" />

      {/* Right Hand back holding center phone */}
      <Path
        d="M210,132 C222,124 234,134 238,154 L252,226 L196,242 Z"
        fill="#f4a98c"
      />
      <Path d="M214,228 L258,210 L276,268 L224,270 Z" fill="#1e3a8a" />

      {/* Center Smartphone (Scanner + Contact List) */}
      <G transform="translate(174, 134)">
        <Rect
          x="-42"
          y="-78"
          width="84"
          height="156"
          rx="13"
          fill="#090d16"
          stroke="#3b82f6"
          strokeWidth="2.2"
        />
        <Rect x="-12" y="-71" width="24" height="3.5" rx="1.75" fill="#1e293b" />

        {/* Scanner Viewfinder Box */}
        <Path d="M-24,-52 L-24,-58 L-18,-58" stroke="#38bdf8" strokeWidth="2" fill="none" />
        <Path d="M24,-52 L24,-58 L18,-58" stroke="#38bdf8" strokeWidth="2" fill="none" />
        <Path d="M-24,-16 L-24,-10 L-18,-10" stroke="#38bdf8" strokeWidth="2" fill="none" />
        <Path d="M24,-16 L24,-10 L18,-10" stroke="#38bdf8" strokeWidth="2" fill="none" />

        {/* Laser scan line + beam */}
        <Rect x="-26" y="-36" width="52" height="18" fill="url(#scanBeam)" />
        <Line x1="-28" y1="-36" x2="28" y2="-36" stroke="#38bdf8" strokeWidth="2" />

        {/* Scanned contact rows inside phone */}
        {[0, 1, 2, 3].map((row) => {
          const y = 2 + row * 16;
          return (
            <G key={row} transform={`translate(0, ${y})`}>
              <Rect
                x="-32"
                y="0"
                width="64"
                height="13"
                rx="4"
                fill="#111827"
                stroke="#1e293b"
                strokeWidth="1"
              />
              <Circle cx="-22" cy="6.5" r="4" fill="#2563eb" />
              <Rect x="-14" y="4" width="26" height="2.5" rx="1.25" fill="#cbd5e1" />
              <Rect x="-14" y="8" width="18" height="2" rx="1" fill="#64748b" />
            </G>
          );
        })}

        {/* Bottom Home Indicator */}
        <Rect x="-22" y="69" width="44" height="3.5" rx="1.75" fill="#38bdf8" />
      </G>
    </Svg>
  );
}

/** Slide 3 Illustration: Central phone with upward deal chart connected to contact network & handshake. */
function NetworkDealsIllustration() {
  const leftNodes = [
    { cx: 74, cy: 52 },
    { cx: 58, cy: 102 },
    { cx: 74, cy: 150 },
  ];
  const rightNodes = [
    { cx: 266, cy: 52 },
    { cx: 282, cy: 102 },
    { cx: 266, cy: 150 },
  ];

  return (
    <Svg width="100%" height="100%" viewBox="0 0 340 270">
      <Defs>
        <RadialGradient id="dealsGlow" cx="50%" cy="52%" r="50%">
          <Stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
          <Stop offset="55%" stopColor="#2563eb" stopOpacity="0.14" />
          <Stop offset="100%" stopColor="#020617" stopOpacity="0" />
        </RadialGradient>
        <SvgLinearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#34d399" stopOpacity="0.42" />
          <Stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
        </SvgLinearGradient>
      </Defs>

      <Circle cx="170" cy="140" r="122" fill="url(#dealsGlow)" />

      {/* Network connecting curves from avatar nodes into top of phone */}
      <Path d="M88,52 C124,52 142,76 156,96" stroke="#38bdf8" strokeWidth="1.5" fill="none" opacity="0.55" />
      <Path d="M72,102 C110,102 132,96 152,100" stroke="#38bdf8" strokeWidth="1.5" fill="none" opacity="0.55" />
      <Path d="M88,150 C118,150 132,126 148,112" stroke="#38bdf8" strokeWidth="1.5" fill="none" opacity="0.55" />

      <Path d="M252,52 C216,52 198,76 184,96" stroke="#38bdf8" strokeWidth="1.5" fill="none" opacity="0.55" />
      <Path d="M268,102 C230,102 208,96 188,100" stroke="#38bdf8" strokeWidth="1.5" fill="none" opacity="0.55" />
      <Path d="M252,150 C222,150 208,126 192,112" stroke="#38bdf8" strokeWidth="1.5" fill="none" opacity="0.55" />

      {/* Connection data dots */}
      <Circle cx="116" cy="64" r="2.5" fill="#38bdf8" />
      <Circle cx="112" cy="100" r="2.5" fill="#38bdf8" />
      <Circle cx="116" cy="138" r="2.5" fill="#38bdf8" />
      <Circle cx="224" cy="64" r="2.5" fill="#38bdf8" />
      <Circle cx="228" cy="100" r="2.5" fill="#38bdf8" />
      <Circle cx="224" cy="138" r="2.5" fill="#38bdf8" />

      {/* Left & Right Avatar Nodes */}
      {[...leftNodes, ...rightNodes].map((node, idx) => (
        <G key={idx} transform={`translate(${node.cx}, ${node.cy})`}>
          <Circle cx="0" cy="0" r="16" fill="#0f172a" stroke="#3b82f6" strokeWidth="1.8" />
          <Circle cx="0" cy="-3" r="4.5" fill="#f7bba2" />
          <Path d="M-8,10 C-6,4 6,4 8,10" fill={idx % 2 === 0 ? '#3b82f6' : '#38bdf8'} />
        </G>
      ))}

      {/* Top Handshake Medallion */}
      <G transform="translate(170, 48)">
        <Circle cx="0" cy="0" r="34" fill="#1e293b" opacity="0.55" />
        <Circle cx="0" cy="0" r="24" fill="#0f172a" stroke="#3b82f6" strokeWidth="1.5" />
        {/* Left & Right cuffs */}
        <Path d="M-38,-14 L-16,-2 L-22,10 L-44,-2 Z" fill="#3b82f6" />
        <Path d="M38,-14 L16,-2 L22,10 L44,-2 Z" fill="#38bdf8" />
        {/* Clasped hands */}
        <Ellipse cx="0" cy="3" rx="14" ry="9" fill="#f4a98c" />
        <Path d="M-8,-2 C-2,-6 4,-6 10,-1" stroke="#d98a6c" strokeWidth="1.8" fill="none" />
        <Path d="M-6,4 C0,7 6,7 10,3" stroke="#d98a6c" strokeWidth="1.6" fill="none" />
      </G>

      {/* Decorative Foliage Leaves behind Phone */}
      <Path d="M132,238 C104,218 98,194 110,188 C120,184 132,204 136,226 Z" fill="#1e3a8a" opacity="0.7" />
      <Path d="M130,248 C96,238 88,218 100,212 C110,206 126,224 134,242 Z" fill="#2563eb" opacity="0.65" />
      <Path d="M208,238 C236,218 242,194 230,188 C220,184 208,204 204,226 Z" fill="#1e3a8a" opacity="0.7" />
      <Path d="M210,248 C244,238 252,218 240,212 C230,206 214,224 206,242 Z" fill="#2563eb" opacity="0.65" />

      {/* Central Smartphone with Growth Curve */}
      <G transform="translate(170, 174)">
        <Rect
          x="-38"
          y="-74"
          width="76"
          height="144"
          rx="12"
          fill="#090d16"
          stroke="#3b82f6"
          strokeWidth="2"
        />
        <Rect x="-10" y="-67" width="20" height="3" rx="1.5" fill="#1e293b" />

        {/* Area under growth curve */}
        <Path
          d="M-24,22 Q0,14 22,-32 L22,46 L-24,46 Z"
          fill="url(#chartArea)"
        />
        {/* Glowing Growth Curve + Arrowhead */}
        <Path
          d="M-24,22 Q0,14 22,-32"
          fill="none"
          stroke="#34d399"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <Path
          d="M15,-28 L22,-33 L24,-24"
          fill="none"
          stroke="#34d399"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Vertical dashed grid lines + dots */}
        {[-22, -11, 0, 11, 22].map((x, i) => (
          <G key={i}>
            <Line
              x1={x}
              y1={24 - i * 10}
              x2={x}
              y2={46}
              stroke="#34d399"
              strokeWidth="1"
              strokeDasharray="2 3"
              opacity="0.45"
            />
            <Circle cx={x} cy="48" r="1.8" fill="#34d399" />
          </G>
        ))}
      </G>
    </Svg>
  );
}

function SlideIllustration({ id }: { id: WelcomeSlide['id'] }) {
  switch (id) {
    case 'tap-network':
      return <TapShareIllustration />;
    case 'capture-leads':
      return <LeadScannerIllustration />;
    case 'turn-deals':
      return <NetworkDealsIllustration />;
  }
}

export function AuthWelcomeFeatureCarousel() {
  const [pageWidth, setPageWidth] = useState(0);
  const progress = useSharedValue(0);
  const scrollRef = useRef<ScrollViewInstance>(null);

  const { theme } = useThemeContext();
  const isDark = theme === 'dark';
  const tint = isDark ? Colors.dark.tint : Colors.light.tint;
  const inactiveDot = isDark ? 'rgba(148,163,184,0.35)' : 'rgba(148,163,184,0.45)';

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (pageWidth > 0) {
      progress.value = event.nativeEvent.contentOffset.x / pageWidth;
    }
  };

  return (
    <View
      className="flex-1 w-full"
      onLayout={(event) => {
        const width = Math.round(event.nativeEvent.layout.width);
        if (width > 0 && width !== pageWidth) {
          setPageWidth(width);
        }
      }}
    >
      {pageWidth > 0 ? (
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          bounces={false}
          style={{ width: pageWidth, flex: 1 }}
        >
          {WELCOME_SLIDES.map((slide) => (
            <View
              key={slide.id}
              style={{ width: pageWidth }}
              className="flex-1 justify-center px-6 pb-2 pt-2"
            >
              {/* Hero Illustration Card — taller & directly connected to the text below */}
              <View
                className={`w-full flex-1 overflow-hidden rounded-[28px] border ${
                  isDark
                    ? 'border-slate-800/90 bg-[#070d1e]'
                    : 'border-slate-200/90 bg-[#0a1128]'
                }`}
                style={{ minHeight: 240, maxHeight: 330 }}
              >
                <SlideIllustration id={slide.id} />
              </View>

              {/* Tightly Coupled Badge + Headline + Description directly below the image */}
              <View className="mt-5 w-full items-start">
                <View className="mb-2.5 rounded-full border border-sky-400/25 bg-sky-500/10 px-3 py-1">
                  <Text
                    variant="none"
                    className="text-[11px] font-bold tracking-wider text-sky-500 dark:text-sky-400"
                  >
                    {slide.badge}
                  </Text>
                </View>
                <Text
                  variant="none"
                  className="text-left text-[32px] font-extrabold leading-[38px] tracking-tight text-textPrimary dark:text-dark-textPrimary"
                >
                  {slide.headline}
                </Text>
                <Text
                  variant="none"
                  className="mt-2.5 text-left text-[15px] font-normal leading-[22px] text-slate-500 dark:text-slate-400"
                >
                  {slide.description}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View className="flex-1" />
      )}

      <View className="mt-3 items-center">
        <PaginationDots
          count={WELCOME_SLIDES.length}
          progress={progress}
          activeColor={tint}
          inactiveColor={inactiveDot}
        />
      </View>
    </View>
  );
}
