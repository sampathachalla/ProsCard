import React from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Share2 } from 'lucide-react-native';
import { MediaImage } from '@/common/ui/MediaImage';
import { Text } from '@/common/ui/Text';
import type { CardDetailSection } from '../cardDetailTemplate';
import { resolveIdentityTemplateId, type CardVisualTheme } from '../../types/card.types';
import {
  BOXED_SHADOW_MD,
  BOXED_SHADOW_SM,
  IdentityImage,
  UniversalLogoBadge,
} from './SectionSharedComponents';
import { resolveLayoutColorSlots } from '@/utils/cardThemeColor';
import { identitySectionHeight } from '../../cardSectionLayout';
import { getCardSectionSpacing } from './cardSectionSpacing';

type Props = {
  compact?: boolean;
  cardTheme: CardVisualTheme;
  gradient: [string, string];
  section: CardDetailSection;
  seamless?: boolean;
  showEmpty?: boolean;
  walletPass?: boolean;
  /** Edit / scrollable full card (not home carousel face). */
  fullCardView?: boolean;
  interactiveActions?: boolean;
  onShareCard?: () => void;
};

export function IdentitySectionRenderer({
  compact = false,
  cardTheme,
  section,
  seamless = false,
  walletPass = false,
  fullCardView = false,
  interactiveActions,
  onShareCard,
}: Props) {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const spacing = getCardSectionSpacing(windowWidth);
  const boxed = compact && !seamless;
  const field = (id: string) => section.fields.find((item) => item.id === id);
  const cover = field('coverPhoto');
  const profile = field('profilePhoto');
  const logo = field('logo');
  const layoutId = resolveIdentityTemplateId(section.templateId);
  const slots = resolveLayoutColorSlots({
    templateId: layoutId,
    theme: cardTheme,
  });
  const fullCardIdentityHeight = identitySectionHeight(windowHeight);
  const classicProfileSize = walletPass
    ? 48
    : fullCardView
      ? Math.max(64, Math.min(104, Math.round(fullCardIdentityHeight * 0.48)))
      : compact
        ? 80
        : 96;
  const homePreview = compact && seamless;
  const shellStyle = {
    backgroundColor: slots.background,
    borderColor: boxed ? slots.accent : undefined,
    flex: homePreview ? 1 : undefined,
    height: compact ? ('100%' as const) : undefined,
    minHeight: compact ? undefined : 180,
    width: homePreview ? ('100%' as const) : undefined,
  };
  const imageColors = {
    iconColor: slots.textSecondary,
    placeholderColor: slots.surface,
  };

  // 1. Split profile (minimal): cover/avatar on the left and logo on the right.
  if (layoutId === 'minimal') {
    const minimalProfileSize = walletPass
      ? 44
      : fullCardView
        ? Math.max(68, Math.min(96, Math.round(fullCardIdentityHeight * 0.45)))
        : compact
          ? 70
          : 88;
    const minimalLogoWidth = fullCardView
      ? Math.max(148, Math.min(168, Math.round(windowWidth * 0.38)))
      : compact
        ? 132
        : 168;
    return (
      <View
        className={`flex-row overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[shellStyle, boxed ? BOXED_SHADOW_SM : null]}
      >
        {/* Left: Full-bleed Cover Backdrop + Elevated Avatar with Specular Ring & Shadow */}
        <View
          className="w-1/2 items-center justify-center overflow-hidden"
          style={{
            backgroundColor: slots.background,
            borderRightWidth: StyleSheet.hairlineWidth,
            borderRightColor: slots.highlight || 'rgba(255,255,255,0.2)',
            padding: spacing.gap,
          }}
        >
          <IdentityImage field={cover} {...imageColors} style={StyleSheet.absoluteFill} />
          {/* Ambient Lighting Vignette */}
          <LinearGradient colors={['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.38)']} style={StyleSheet.absoluteFill} />
          {/* Dual-ring elevated avatar frame */}
          <View
            style={{
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 10,
              elevation: 8,
            }}
          >
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.22)',
                borderColor: 'rgba(255,255,255,0.45)',
                borderRadius: (minimalProfileSize + 8) / 2,
                borderWidth: 1.5,
                padding: 3,
              }}
            >
              <IdentityImage
                field={profile}
                {...imageColors}
                style={{
                  width: minimalProfileSize,
                  height: minimalProfileSize,
                  borderRadius: minimalProfileSize / 2,
                  borderWidth: 2,
                  borderColor: '#ffffff',
                }}
              />
            </View>
          </View>
        </View>

        {/* Right: Clean Identity Pane */}
        <View
          className="w-1/2 items-center justify-center"
          style={{
            backgroundColor: slots.surface,
            padding: spacing.horizontal,
          }}
        >
          <View className="items-center">
            <UniversalLogoBadge
              bare
              cardTheme={cardTheme}
              compact={compact}
              field={logo}
              logoSize={{
                width: minimalLogoWidth,
                height: Math.round(minimalLogoWidth * (56 / 152)),
              }}
              placement="on-surface"
              slots={slots}
              templateId={layoutId}
            />
          </View>
        </View>
      </View>
    );
  }

  // 1b. Side Profile (New) - Welcome Page Midnight Aesthetic
  if (layoutId === 'minimal-new') {
    const minimalProfileSize = walletPass
      ? 44
      : fullCardView
        ? Math.max(68, Math.min(96, Math.round(fullCardIdentityHeight * 0.45)))
        : compact
          ? 70
          : 88;
    const minimalLogoWidth = fullCardView
      ? Math.max(148, Math.min(168, Math.round(windowWidth * 0.38)))
      : compact
        ? 132
        : 168;
    return (
      <View
        className={`flex-row overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[
          shellStyle,
          {
            backgroundColor: '#070d1e',
            borderColor: 'rgba(56, 189, 248, 0.25)',
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        {/* Left: Midnight Cover + Glowing Cyan Ring Avatar */}
        <View
          className="w-1/2 items-center justify-center overflow-hidden"
          style={{
            backgroundColor: '#070d1e',
            borderRightWidth: 1,
            borderRightColor: 'rgba(56, 189, 248, 0.2)',
            padding: spacing.gap,
          }}
        >
          <IdentityImage field={cover} {...imageColors} style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={['rgba(37,99,235,0.22)', 'rgba(7,13,30,0.92)']}
            style={StyleSheet.absoluteFill}
          />
          {/* Welcome Signature Glowing Halo Avatar */}
          <View
            style={{
              shadowColor: '#38bdf8',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 10,
              elevation: 8,
            }}
          >
            <View
              style={{
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                borderColor: '#38bdf8',
                borderRadius: (minimalProfileSize + 10) / 2,
                borderWidth: 2,
                padding: 3,
              }}
            >
              <IdentityImage
                field={profile}
                {...imageColors}
                style={{
                  width: minimalProfileSize,
                  height: minimalProfileSize,
                  borderRadius: minimalProfileSize / 2,
                  borderWidth: 2,
                  borderColor: '#ffffff',
                }}
              />
            </View>
          </View>
        </View>

        {/* Right: Midnight Slate Pane with Micro-Chip and Logo */}
        <View
          className="w-1/2 items-center justify-center"
          style={{
            backgroundColor: '#0a1128',
            padding: spacing.horizontal,
          }}
        >
          <View className="mb-2 rounded-full border border-sky-400/25 bg-sky-500/10 px-2.5 py-0.5">
            <Text
              variant="none"
              className="text-[10px] font-bold tracking-wider text-sky-400"
            >
              PRO IDENTITY
            </Text>
          </View>
          <View className="items-center">
            <UniversalLogoBadge
              bare
              cardTheme={cardTheme}
              compact={compact}
              field={logo}
              logoSize={{
                width: minimalLogoWidth,
                height: Math.round(minimalLogoWidth * (56 / 152)),
              }}
              placement="on-surface"
              slots={slots}
              templateId={layoutId}
            />
          </View>
        </View>
      </View>
    );
  }

  // 2. Magazine Monograph (editorial): full cover, bare logo, then portrait row.
  if (layoutId === 'editorial') {
    const editorialProfileSize = fullCardView
      ? Math.max(68, Math.min(92, Math.round(fullCardIdentityHeight * 0.4)))
      : compact
        ? 68
        : 88;
    const editorialLogoWidth = fullCardView
      ? Math.max(170, Math.min(240, Math.round(windowWidth * 0.52)))
      : compact
        ? 148
        : 200;
    const editorialLogoHeight = Math.round(editorialLogoWidth * (56 / 152));
    return (
      <View
        className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[shellStyle, boxed ? BOXED_SHADOW_SM : null]}
      >
        <IdentityImage field={cover} {...imageColors} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={['rgba(2,6,23,0.18)', 'rgba(2,6,23,0.78)']} style={StyleSheet.absoluteFill} />
        <View className="h-full w-full items-center justify-center px-4">
          <View
            className="w-full items-center justify-center"
            style={{
              transform: [{ translateY: fullCardView ? -18 : compact ? -12 : -16 }],
            }}
          >
            <UniversalLogoBadge
              bare
              cardTheme={cardTheme}
              field={logo}
              logoSize={{
                width: editorialLogoWidth,
                height: editorialLogoHeight,
              }}
              placement="on-cover"
              slots={slots}
              templateId={layoutId}
            />
          </View>
        </View>
        <View className="absolute bottom-3 left-3">
          <IdentityImage
            field={profile}
            {...imageColors}
            style={{
              width: editorialProfileSize,
              height: editorialProfileSize,
              borderRadius: 16,
              borderWidth: 2,
              borderColor: 'rgba(255,255,255,0.78)',
            }}
          />
        </View>
      </View>
    );
  }

  // 2b. Monograph (New) - Welcome Page Editorial Specular Design
  if (layoutId === 'editorial-new') {
    const editorialProfileSize = fullCardView
      ? Math.max(68, Math.min(92, Math.round(fullCardIdentityHeight * 0.4)))
      : compact
        ? 68
        : 88;
    const editorialLogoWidth = fullCardView
      ? Math.max(170, Math.min(240, Math.round(windowWidth * 0.52)))
      : compact
        ? 148
        : 200;
    const editorialLogoHeight = Math.round(editorialLogoWidth * (56 / 152));
    return (
      <View
        className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[
          shellStyle,
          {
            backgroundColor: '#070d1e',
            borderColor: 'rgba(56, 189, 248, 0.25)',
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <IdentityImage field={cover} {...imageColors} style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={['rgba(7,13,30,0.3)', 'rgba(7,13,30,0.95)']}
          style={StyleSheet.absoluteFill}
        />
        {/* Top Micro-chip */}
        <View className="absolute right-3.5 top-3.5 z-10 rounded-full border border-sky-400/25 bg-sky-500/10 px-2.5 py-0.5">
          <Text
            variant="none"
            className="text-[10px] font-bold tracking-wider text-sky-400"
          >
            PORTFOLIO
          </Text>
        </View>
        <View className="h-full w-full items-center justify-center px-4">
          <View
            className="w-full items-center justify-center"
            style={{
              transform: [{ translateY: fullCardView ? -18 : compact ? -12 : -16 }],
            }}
          >
            <UniversalLogoBadge
              bare
              cardTheme={cardTheme}
              field={logo}
              logoSize={{
                width: editorialLogoWidth,
                height: editorialLogoHeight,
              }}
              placement="on-cover"
              slots={slots}
              templateId={layoutId}
            />
          </View>
        </View>
        {/* Welcome-styled Rounded-2xl Avatar with Glowing Rim */}
        <View
          className="absolute bottom-3 left-3"
          style={{
            shadowColor: '#38bdf8',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <View
            style={{
              backgroundColor: 'rgba(56, 189, 248, 0.2)',
              borderColor: '#38bdf8',
              borderRadius: 18,
              borderWidth: 1.5,
              padding: 2,
            }}
          >
            <IdentityImage
              field={profile}
              {...imageColors}
              style={{
                width: editorialProfileSize,
                height: editorialProfileSize,
                borderRadius: 16,
                borderWidth: 1.5,
                borderColor: '#ffffff',
              }}
            />
          </View>
        </View>
      </View>
    );
  }

  // 3. Brand Spotlight (spotlight): full cover photo with a large bare logo.
  if (layoutId === 'spotlight') {
    const spotlightLogoWidth = fullCardView
      ? Math.max(180, Math.min(280, Math.round(windowWidth * 0.58)))
      : compact
        ? 170
        : 230;
    const spotlightLogoHeight = Math.round(spotlightLogoWidth * (56 / 152));
    const spotlightProfileSize = fullCardView
      ? Math.max(62, Math.min(88, Math.round(fullCardIdentityHeight * 0.38)))
      : compact
        ? 64
        : 82;
    return (
      <View
        className={`items-center justify-center overflow-hidden px-5 ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[shellStyle, { borderColor: slots.accent }, boxed ? BOXED_SHADOW_MD : null]}
      >
        <IdentityImage field={cover} {...imageColors} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={['rgba(2,6,23,0.25)', 'rgba(2,6,23,0.72)']} style={StyleSheet.absoluteFill} />
        <View className="h-full w-full items-center justify-center px-4">
          <View
            className="w-full items-center justify-center"
            style={{
              transform: [{ translateY: fullCardView ? -18 : compact ? -12 : -16 }],
            }}
          >
            <UniversalLogoBadge
              bare
              cardTheme={cardTheme}
              field={logo}
              logoSize={{
                width: spotlightLogoWidth,
                height: spotlightLogoHeight,
              }}
              placement="on-cover"
              slots={slots}
              templateId={layoutId}
            />
          </View>
        </View>
        <View className="absolute bottom-2 left-3">
          <IdentityImage
            field={profile}
            {...imageColors}
            style={{
              width: spotlightProfileSize,
              height: spotlightProfileSize,
              borderRadius: spotlightProfileSize / 2,
              borderWidth: 3,
              borderColor: slots.accent,
            }}
          />
        </View>
      </View>
    );
  }

  // 3b. Halo Spotlight (New) - Welcome Page Ambient Cyan Spotlight
  if (layoutId === 'spotlight-new') {
    const spotlightLogoWidth = fullCardView
      ? Math.max(180, Math.min(280, Math.round(windowWidth * 0.58)))
      : compact
        ? 170
        : 230;
    const spotlightLogoHeight = Math.round(spotlightLogoWidth * (56 / 152));
    const spotlightProfileSize = fullCardView
      ? Math.max(62, Math.min(88, Math.round(fullCardIdentityHeight * 0.38)))
      : compact
        ? 64
        : 82;
    return (
      <View
        className={`items-center justify-center overflow-hidden px-5 ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[
          shellStyle,
          {
            backgroundColor: '#070d1e',
            borderColor: 'rgba(56, 189, 248, 0.3)',
          },
          boxed ? BOXED_SHADOW_MD : null,
        ]}
      >
        <IdentityImage field={cover} {...imageColors} style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={['rgba(7,13,30,0.3)', 'rgba(7,13,30,0.95)']}
          style={StyleSheet.absoluteFill}
        />
        {/* Ambient Center Glow */}
        <View
          className="absolute h-40 w-40 rounded-full"
          style={{
            backgroundColor: 'rgba(56, 189, 248, 0.12)',
            transform: [{ scale: 1.5 }],
          }}
        />
        <View className="h-full w-full items-center justify-center px-4">
          <View
            className="w-full items-center justify-center"
            style={{
              transform: [{ translateY: fullCardView ? -18 : compact ? -12 : -16 }],
            }}
          >
            <UniversalLogoBadge
              bare
              cardTheme={cardTheme}
              field={logo}
              logoSize={{
                width: spotlightLogoWidth,
                height: spotlightLogoHeight,
              }}
              placement="on-cover"
              slots={slots}
              templateId={layoutId}
            />
          </View>
        </View>
        {/* Dual Ring Halo Avatar */}
        <View
          className="absolute bottom-2 left-3"
          style={{
            shadowColor: '#38bdf8',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 10,
            elevation: 8,
          }}
        >
          <View
            style={{
              backgroundColor: 'rgba(37,99,235,0.25)',
              borderColor: '#38bdf8',
              borderRadius: (spotlightProfileSize + 8) / 2,
              borderWidth: 2,
              padding: 2.5,
            }}
          >
            <IdentityImage
              field={profile}
              {...imageColors}
              style={{
                width: spotlightProfileSize,
                height: spotlightProfileSize,
                borderRadius: spotlightProfileSize / 2,
                borderWidth: 2,
                borderColor: '#ffffff',
              }}
            />
          </View>
        </View>
      </View>
    );
  }

  const classicTopHeight = fullCardView ? '66%' : '62%';
  const classicLogoWidth = walletPass
    ? 116
    : fullCardView
      ? Math.max(140, Math.min(190, Math.round(windowWidth * 0.34)))
      : compact
        ? 132
        : 172;

  // 1b. Cover Overlay (New) - Welcome Page Midnight Aesthetic with Popl Left-Overlapping Avatar
  if (layoutId === 'classic-new') {
    const nestedLogoSize = Math.round(classicProfileSize * 0.42);
    return (
      <View
        className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[
          shellStyle,
          {
            backgroundColor: '#070d1e',
            borderColor: 'rgba(56, 189, 248, 0.25)',
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <View
          className="relative h-full w-full"
          style={{
            flex: homePreview ? 1 : undefined,
            height: compact && !homePreview ? ('100%' as const) : undefined,
            minHeight: compact ? undefined : 180,
          }}
        >
          <View className="w-full overflow-hidden" style={{ height: classicTopHeight }}>
            <IdentityImage field={cover} {...imageColors} style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={['rgba(7,13,30,0.15)', 'rgba(7,13,30,0.7)']}
              style={StyleSheet.absoluteFill}
            />
            {/* Floating Share Button on Cover */}
            {onShareCard ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Share card"
                onPress={onShareCard}
                className="absolute right-3.5 top-3.5 z-20 h-9 w-9 items-center justify-center rounded-full bg-[#070d1e]/80 border border-sky-400/30 shadow-md active:opacity-75"
              >
                <Share2 color="#38bdf8" size={17} strokeWidth={2.2} />
              </Pressable>
            ) : null}
          </View>
          <View
            className={`w-full flex-1 items-center ${fullCardView ? 'justify-start' : 'justify-center'}`}
            style={{
              backgroundColor: '#070d1e',
              borderTopWidth: 1,
              borderTopColor: 'rgba(56, 189, 248, 0.2)',
              paddingHorizontal: walletPass ? 10 : spacing.horizontal,
              paddingBottom: walletPass ? 4 : spacing.tightVertical,
              paddingTop: fullCardView ? 0 : walletPass ? 4 : spacing.tightVertical,
            }}
          />
          {/* Welcome Signature Glowing Halo Avatar - Left Aligned Popl Style */}
          <View
            className="absolute z-10"
            style={{
              left: spacing.horizontal,
              top: classicTopHeight,
              transform: [{ translateY: -classicProfileSize / 2 }],
            }}
          >
            <View
              style={{
                shadowColor: '#38bdf8',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.45,
                shadowRadius: 10,
                elevation: 8,
              }}
            >
              <View
                style={{
                  backgroundColor: 'rgba(56, 189, 248, 0.18)',
                  borderColor: '#38bdf8',
                  borderRadius: (classicProfileSize + 10) / 2,
                  borderWidth: 2,
                  padding: 3,
                }}
              >
                <IdentityImage
                  field={profile}
                  {...imageColors}
                  style={{
                    width: classicProfileSize,
                    height: classicProfileSize,
                    borderRadius: classicProfileSize / 2,
                    borderWidth: 2,
                    borderColor: '#ffffff',
                  }}
                />
              </View>
            </View>

            {/* Nested Circular Logo Badge at 4:30 o'clock */}
            {logo?.value ? (
              <View
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -4,
                  width: nestedLogoSize,
                  height: nestedLogoSize,
                  borderRadius: nestedLogoSize / 2,
                  borderWidth: 2.5,
                  borderColor: '#ffffff',
                  backgroundColor: '#0a1128',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  shadowColor: '#38bdf8',
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 6,
                }}
              >
                <MediaImage
                  sourceUrl={logo.value}
                  contentFit="cover"
                  style={{
                    width: nestedLogoSize,
                    height: nestedLogoSize,
                    borderRadius: nestedLogoSize / 2,
                  }}
                />
              </View>
            ) : null}
          </View>
        </View>
      </View>
    );
  }

  // 1. Classic (layout-1): Popl Signature Left-Overlapping Avatar + Nested Circular Logo Badge
  const nestedLogoSize = Math.round(classicProfileSize * 0.42);
  return (
    <View
      className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
      style={[shellStyle, boxed ? BOXED_SHADOW_SM : null]}
    >
      <View
        className="relative h-full w-full"
        style={{
          flex: homePreview ? 1 : undefined,
          height: compact && !homePreview ? ('100%' as const) : undefined,
          minHeight: compact ? undefined : 180,
        }}
      >
        <View className="w-full overflow-hidden" style={{ height: classicTopHeight }}>
          <IdentityImage field={cover} {...imageColors} style={StyleSheet.absoluteFill} />
          {/* Top-Right Floating Share Button */}
          {onShareCard ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Share card"
              onPress={onShareCard}
              className="absolute right-3.5 top-3.5 z-20 h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md active:opacity-75"
              style={{
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.18,
                shadowRadius: 5,
                elevation: 4,
              }}
            >
              <Share2 color="#0f172a" size={17} strokeWidth={2.2} />
            </Pressable>
          ) : (
            <View className={`absolute ${walletPass ? 'right-2 top-2' : 'right-3 top-3'}`}>
              <UniversalLogoBadge
                bare
                cardTheme={cardTheme}
                compact={compact || walletPass}
                field={logo}
                logoSize={{
                  width: classicLogoWidth,
                  height: Math.round(classicLogoWidth * (56 / 152)),
                }}
                placement="on-cover"
                slots={slots}
                templateId={layoutId}
              />
            </View>
          )}
        </View>
        <View
          className={`w-full flex-1 items-center ${fullCardView ? 'justify-start' : 'justify-center'}`}
          style={{
            backgroundColor: slots.surface,
            paddingHorizontal: walletPass ? 10 : spacing.horizontal,
            paddingBottom: walletPass ? 4 : spacing.tightVertical,
            paddingTop: fullCardView ? 0 : walletPass ? 4 : spacing.tightVertical,
          }}
        />
        {/* Left-Aligned Overlapping Avatar with Nested Logo Badge */}
        <View
          className="absolute z-10"
          style={{
            left: spacing.horizontal,
            top: classicTopHeight,
            transform: [{ translateY: -classicProfileSize / 2 }],
          }}
        >
          {/* Avatar with Elevation Shadow and Crisp Border Ring */}
          <View
            style={{
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.22,
              shadowRadius: 10,
              elevation: 8,
            }}
          >
            <IdentityImage
              field={profile}
              {...imageColors}
              style={{
                width: classicProfileSize,
                height: classicProfileSize,
                borderRadius: classicProfileSize / 2,
                borderWidth: walletPass ? 2.5 : compact ? 3.5 : 4,
                borderColor: '#ffffff',
              }}
            />
          </View>

          {/* Nested Circular Logo Badge at 4:30 o'clock */}
          {logo?.value ? (
            <View
              style={{
                position: 'absolute',
                bottom: -2,
                right: -4,
                width: nestedLogoSize,
                height: nestedLogoSize,
                borderRadius: nestedLogoSize / 2,
                borderWidth: 2.5,
                borderColor: '#ffffff',
                backgroundColor: slots.surface || '#ffffff',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.22,
                shadowRadius: 6,
                elevation: 6,
              }}
            >
              <MediaImage
                sourceUrl={logo.value}
                contentFit="cover"
                style={{
                  width: nestedLogoSize,
                  height: nestedLogoSize,
                  borderRadius: nestedLogoSize / 2,
                }}
              />
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
