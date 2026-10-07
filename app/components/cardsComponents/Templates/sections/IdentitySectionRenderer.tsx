import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { CardDetailSection } from '../cardDetailTemplate';
import { resolveIdentityTemplateId, type CardVisualTheme } from '../../types/card.types';
import {
  BOXED_SHADOW_LG,
  BOXED_SHADOW_MD,
  BOXED_SHADOW_SM,
  BOXED_SHADOW_XL,
  IdentityImage,
  UniversalLogoBadge,
} from './SectionSharedComponents';
import { resolveLayoutColorSlots } from '@/utils/cardThemeColor';
import { identitySectionHeight } from '../../cardSectionLayout';

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
};

export function IdentitySectionRenderer({
  compact = false,
  cardTheme,
  section,
  seamless = false,
  walletPass = false,
  fullCardView = false,
}: Props) {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const boxed = compact && !seamless;
  const field = (id: string) => section.fields.find((item) => item.id === id);
  const cover = field('coverPhoto');
  const profile = field('profilePhoto');
  const logo = field('logo');
  const layoutId = resolveIdentityTemplateId(section.templateId);
  const slots = resolveLayoutColorSlots({ templateId: layoutId, theme: cardTheme });
  const fullCardIdentityHeight = identitySectionHeight(windowHeight);
  const classicProfileSize = walletPass
    ? 48
    : fullCardView
      ? Math.max(56, Math.min(88, Math.round(fullCardIdentityHeight * 0.42)))
      : compact
        ? 72
        : 88;
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
    const minimalProfileSize = walletPass ? 44 : fullCardView ? 72 : compact ? 64 : 80;
    return (
      <View
        className={`flex-row overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[shellStyle, boxed ? BOXED_SHADOW_SM : null]}
      >
        {/* Left: Full-bleed Cover Backdrop + Elevated Avatar with Specular Ring & Shadow */}
        <View
          className="w-1/2 items-center justify-center overflow-hidden p-2"
          style={{
            backgroundColor: slots.background,
            borderRightWidth: StyleSheet.hairlineWidth,
            borderRightColor: slots.highlight || 'rgba(255,255,255,0.2)',
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
        <View className="w-1/2 items-center justify-center p-4" style={{ backgroundColor: slots.surface }}>
          <View className="items-center">
            <UniversalLogoBadge
              bare
              cardTheme={cardTheme}
              compact={compact}
              field={logo}
              placement="on-surface"
              slots={slots}
              templateId={layoutId}
            />
          </View>
        </View>
      </View>
    );
  }

  // 2. Hero banner (bold): full-bleed media
  if (layoutId === 'bold') {
    const boldProfileSize = fullCardView
      ? fullCardIdentityHeight < 220
        ? Math.max(72, Math.min(88, Math.round(fullCardIdentityHeight * 0.4)))
        : Math.max(88, Math.min(112, Math.round(fullCardIdentityHeight * 0.42)))
      : compact
        ? 64
        : 104;
    const boldEdgeInset = fullCardView ? 20 : 12;
    const boldBottomInset = fullCardView ? 20 : 12;
    return (
      <View
        className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[shellStyle, boxed ? BOXED_SHADOW_LG : null]}
      >
        <IdentityImage
          field={cover}
          {...imageColors}
          style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }}
        />
        <LinearGradient
          colors={['rgba(2,6,23,0.08)', 'rgba(2,6,23,0.34)', 'rgba(2,6,23,0.88)']}
          locations={[0, 0.52, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View className="absolute" style={{ right: boldEdgeInset, top: boldEdgeInset }}>
          <UniversalLogoBadge
            bare
            cardTheme={cardTheme}
            compact
            field={logo}
            placement="on-cover"
            slots={slots}
            templateId={layoutId}
          />
        </View>
        <View
          className="absolute flex-row items-center"
          style={{ bottom: boldBottomInset, left: boldEdgeInset, right: boldEdgeInset }}
        >
          <IdentityImage
            field={profile}
            {...imageColors}
            style={{
              width: boldProfileSize,
              height: boldProfileSize,
              borderRadius: fullCardView ? 16 : compact ? 14 : 18,
              borderWidth: 2,
              borderColor: 'rgba(255,255,255,0.72)',
            }}
          />
        </View>
      </View>
    );
  }

  // 3. Magazine Monograph (editorial): full cover, bare logo, then portrait row.
  if (layoutId === 'editorial') {
    const editorialProfileSize = fullCardView
      ? Math.max(80, Math.min(108, Math.round(fullCardIdentityHeight * 0.4)))
      : compact
        ? 72
        : 96;
    const editorialLogoWidth = fullCardView
      ? Math.max(220, Math.min(300, Math.round(windowWidth * 0.7)))
      : compact
        ? 180
        : 240;
    const editorialLogoHeight = Math.round(editorialLogoWidth * (56 / 152));
    return (
      <View
        className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[shellStyle, boxed ? BOXED_SHADOW_SM : null]}
      >
        <IdentityImage field={cover} {...imageColors} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={['rgba(2,6,23,0.18)', 'rgba(2,6,23,0.78)']} style={StyleSheet.absoluteFill} />
        <View className="h-full w-full px-4 pb-3 pt-2">
          <View className="w-full items-center justify-center" style={{ height: '44%' }}>
            <UniversalLogoBadge
              bare
              cardTheme={cardTheme}
              field={logo}
              logoSize={{ width: editorialLogoWidth, height: editorialLogoHeight }}
              placement="on-cover"
              slots={slots}
              templateId={layoutId}
            />
          </View>
          <View className="w-full flex-1 flex-row items-center">
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
      </View>
    );
  }

  // 4. Brand Spotlight (spotlight): full cover photo with a large bare logo.
  if (layoutId === 'spotlight') {
    const spotlightLogoWidth = fullCardView
      ? Math.max(220, Math.min(360, Math.round(windowWidth * 0.72)))
      : compact
        ? 220
        : 260;
    const spotlightLogoHeight = Math.round(spotlightLogoWidth * (56 / 152));
    return (
      <View
        className={`items-center justify-center overflow-hidden px-5 ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[shellStyle, { borderColor: slots.accent }, boxed ? BOXED_SHADOW_MD : null]}
      >
        <IdentityImage field={cover} {...imageColors} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={['rgba(2,6,23,0.25)', 'rgba(2,6,23,0.72)']} style={StyleSheet.absoluteFill} />
        <View className="h-full w-full items-center justify-center px-4">
          <View className="w-full items-center justify-center">
            <UniversalLogoBadge
              bare
              cardTheme={cardTheme}
              field={logo}
              logoSize={{ width: spotlightLogoWidth, height: spotlightLogoHeight }}
              placement="on-cover"
              slots={slots}
              templateId={layoutId}
            />
          </View>
        </View>
      </View>
    );
  }

  // 5. Dual Column (split): 30% full-height cover with identity content in the 70% right pane.
  if (layoutId === 'split') {
    const splitProfileSize = fullCardView
      ? fullCardIdentityHeight < 220
        ? Math.max(60, Math.min(76, Math.round(fullCardIdentityHeight * 0.35)))
        : Math.max(76, Math.min(96, Math.round(fullCardIdentityHeight * 0.34)))
      : compact
        ? 64
        : 96;
    const splitContentTopPadding = fullCardView ? (fullCardIdentityHeight < 220 ? 36 : 48) : 12;
    return (
      <View
        className={`flex-row overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[shellStyle, boxed ? BOXED_SHADOW_SM : null]}
      >
        <View
          className="h-full w-[30%] overflow-hidden"
          style={{ backgroundColor: slots.background, borderRightWidth: 1, borderRightColor: slots.highlight }}
        >
          <IdentityImage field={cover} {...imageColors} style={StyleSheet.absoluteFill} />
        </View>
        <View
          className="relative flex-1 justify-start px-4 pb-3"
          style={{ backgroundColor: slots.surface, paddingTop: splitContentTopPadding }}
        >
          <View className="absolute right-3 top-3 z-10">
            <UniversalLogoBadge
              bare
              cardTheme={cardTheme}
              compact
              field={logo}
              placement="on-surface"
              slots={slots}
              templateId={layoutId}
            />
          </View>
          <View className="w-full items-start">
            <IdentityImage
              field={profile}
              {...imageColors}
              style={{
                width: splitProfileSize,
                height: splitProfileSize,
                borderRadius: splitProfileSize / 2,
                borderWidth: fullCardView ? 3.5 : 2.5,
                borderColor: slots.accent,
              }}
            />
          </View>
        </View>
      </View>
    );
  }

  const classicTopHeight = fullCardView ? '48%' : '60%';
  // 1. Classic (layout-1): cover with an overlapping profile image and no name field.
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
          <View className={`absolute ${walletPass ? 'right-2 top-2' : 'right-3 top-3'}`}>
            <UniversalLogoBadge
              bare
              cardTheme={cardTheme}
              compact={compact || walletPass}
              field={logo}
              placement="on-cover"
              slots={slots}
              templateId={layoutId}
            />
          </View>
        </View>
        <View
          className={`w-full flex-1 items-center ${fullCardView ? 'justify-start px-4' : `justify-center ${walletPass ? 'px-2.5 py-1' : compact ? 'px-3 pb-2' : 'px-4 py-3'}`}`}
          style={{
            backgroundColor: slots.surface,
            paddingTop: 0,
          }}
        />
        <View
          className="absolute left-0 right-0 z-10 items-center"
          style={{ top: classicTopHeight, transform: [{ translateY: -classicProfileSize / 2 }] }}
        >
          <IdentityImage
            field={profile}
            {...imageColors}
            style={{
              width: classicProfileSize,
              height: classicProfileSize,
              borderRadius: classicProfileSize / 2,
              borderWidth: walletPass ? 2.5 : compact ? 3 : 4,
              borderColor: slots.accent,
            }}
          />
        </View>
      </View>
    </View>
  );
}
