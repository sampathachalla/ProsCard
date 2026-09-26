import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/uiComponents/Text';
import type { CardDetailSection } from '../cardDetailTemplate';
import type { CardVisualTheme } from '../../types/card.types';
import { getCardFontFamily, getCardLetterSpacing } from '../cardTheme';
import { IdentityImage, UniversalLogoBadge } from './SectionSharedComponents';
import { resolveLayoutColorSlots } from '@/utils/cardThemeColor';

type Props = {
  compact?: boolean;
  cardTheme: CardVisualTheme;
  gradient: [string, string];
  section: CardDetailSection;
  seamless?: boolean;
  showEmpty?: boolean;
};

function IdentityName({
  align = 'left',
  cardTheme,
  color,
  compact,
  name,
  shadow = false,
}: {
  align?: 'left' | 'center';
  cardTheme: CardVisualTheme;
  color: string;
  compact: boolean;
  name: string;
  shadow?: boolean;
}) {
  return (
    <Text
      adjustsFontSizeToFit
      minimumFontScale={0.72}
      numberOfLines={2}
      className={compact ? 'text-base font-black leading-tight' : 'text-2xl font-black leading-tight'}
      style={{
        color,
        fontFamily: getCardFontFamily(cardTheme.fontStyle),
        letterSpacing: getCardLetterSpacing(cardTheme.fontStyle),
        textAlign: align,
        ...Platform.select({
          web: shadow ? ({ textShadow: '0px 1px 4px rgba(0, 0, 0, 0.9)' } as any) : {},
          default: shadow
            ? {
                textShadowColor: 'rgba(0, 0, 0, 0.9)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 4,
              }
            : {},
        }),
      }}
    >
      {name}
    </Text>
  );
}

export function IdentitySectionRenderer({
  compact = false,
  cardTheme,
  section,
  seamless = false,
  showEmpty = false,
}: Props) {
  const boxed = compact && !seamless;
  const field = (id: string) => section.fields.find((item) => item.id === id);
  const cover = field('coverPhoto');
  const profile = field('profilePhoto');
  const logo = field('logo');
  const name = field('preferredName')?.value || (showEmpty ? 'Preferred Name' : 'No Name Added');
  const slots = resolveLayoutColorSlots({ templateId: section.templateId, theme: cardTheme });
  const profileSize = compact ? 52 : 96;
  const shellStyle = {
    backgroundColor: slots.background,
    borderColor: boxed ? slots.accent : undefined,
    height: compact ? ('100%' as const) : undefined,
    minHeight: compact ? undefined : 260,
  };
  const imageColors = {
    iconColor: slots.textSecondary,
    placeholderColor: slots.surface,
  };

  // 1. Split profile (minimal): 40/60 horizontal split
  if (section.templateId === 'minimal') {
    return (
      <View className={`flex-row overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`} style={shellStyle}>
        <View className="w-[40%] items-center justify-center overflow-hidden p-2" style={{ backgroundColor: slots.background }}>
          <IdentityImage field={cover} {...imageColors} style={{ position: 'absolute', inset: 0 }} />
          <View className="absolute inset-0 bg-black/20" />
          <IdentityImage
            field={profile}
            {...imageColors}
            style={{
              width: profileSize,
              height: profileSize,
              borderRadius: profileSize / 2,
              borderWidth: compact ? 2.5 : 3.5,
              borderColor: slots.accent,
            }}
          />
        </View>
        <View className="flex-1 justify-between p-3.5" style={{ backgroundColor: slots.surface }}>
          <View className="items-start">
            <UniversalLogoBadge
              cardTheme={cardTheme}
              compact={compact}
              field={logo}
              placement="on-surface"
              slots={slots}
              templateId={section.templateId}
            />
          </View>
          <IdentityName cardTheme={cardTheme} color={slots.textPrimary} compact={compact} name={name} />
        </View>
      </View>
    );
  }

  // 2. Hero banner (bold): full-bleed media
  if (section.templateId === 'bold') {
    return (
      <View className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border shadow-lg' : ''}`} style={shellStyle}>
        <IdentityImage field={cover} {...imageColors} style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }} />
        <LinearGradient
          colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.85)']}
          style={StyleSheet.absoluteFill}
        />
        <View className="absolute right-3 top-3">
          <UniversalLogoBadge
            cardTheme={cardTheme}
            compact={compact}
            field={logo}
            placement="on-cover"
            slots={slots}
            templateId={section.templateId}
          />
        </View>
        <View className="absolute bottom-0 left-0 right-0 flex-row items-end px-4 pb-4">
          <IdentityImage
            field={profile}
            {...imageColors}
            style={{
              width: profileSize,
              height: profileSize,
              borderRadius: compact ? 16 : 22,
              borderWidth: compact ? 2.5 : 3.5,
              borderColor: slots.accent,
            }}
          />
          <View className="ml-3 min-w-0 flex-1 pb-1">
            <IdentityName cardTheme={cardTheme} color="#ffffff" compact={compact} name={name} shadow />
          </View>
        </View>
      </View>
    );
  }

  // 3. Layered profile (glass): cover photo backdrop with floating frosted glass card
  if (section.templateId === 'glass') {
    return (
      <View className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border shadow-md' : ''}`} style={shellStyle}>
        <IdentityImage field={cover} {...imageColors} style={{ position: 'absolute', inset: 0 }} />
        <LinearGradient
          colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.65)']}
          style={StyleSheet.absoluteFill}
        />
        <View className="flex-1 items-center justify-end p-4">
          <View
            className="w-full items-center rounded-2xl border p-4 shadow-xl backdrop-blur-md"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', borderColor: slots.accent }}
          >
            <View style={{ marginTop: -(profileSize / 2) }}>
              <IdentityImage
                field={profile}
                {...imageColors}
                style={{
                  width: profileSize,
                  height: profileSize,
                  borderRadius: profileSize / 2,
                  borderWidth: compact ? 2.5 : 3.5,
                  borderColor: slots.accent,
                }}
              />
            </View>
            <View className="mt-2 items-center">
              <UniversalLogoBadge
                cardTheme={cardTheme}
                compact={compact}
                field={logo}
                placement="glass"
                slots={slots}
                templateId={section.templateId}
              />
            </View>
            <View className="mt-2 w-full">
              <IdentityName align="center" cardTheme={cardTheme} color="#ffffff" compact={compact} name={name} shadow />
            </View>
          </View>
        </View>
      </View>
    );
  }

  // 4. Pocket Pass (compact): dense horizontal single-row flow with cover background accent
  if (section.templateId === 'compact') {
    return (
      <View
        className={`flex-row items-center justify-between overflow-hidden px-4 py-3 ${boxed ? 'mb-5 rounded-[24px] border shadow-sm' : ''}`}
        style={{ backgroundColor: slots.surface, borderColor: slots.highlight, minHeight: compact ? 64 : 84 }}
      >
        <View className="flex-row items-center min-w-0 flex-1 mr-3">
          <IdentityImage
            field={profile}
            {...imageColors}
            style={{
              width: compact ? 40 : 54,
              height: compact ? 40 : 54,
              borderRadius: compact ? 20 : 27,
              borderWidth: 2,
              borderColor: slots.accent,
            }}
          />
          <View className="ml-3 min-w-0 flex-1">
            <IdentityName cardTheme={cardTheme} color={slots.textPrimary} compact name={name} />
          </View>
        </View>
        <UniversalLogoBadge
          cardTheme={cardTheme}
          compact
          field={logo}
          placement="on-surface"
          slots={slots}
          templateId={section.templateId}
        />
      </View>
    );
  }

  // 5. Magazine Monograph (editorial): top cover band with offset square avatar and serif title
  if (section.templateId === 'editorial') {
    return (
      <View className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`} style={shellStyle}>
        <View style={{ height: compact ? 90 : 130 }}>
          <IdentityImage field={cover} {...imageColors} style={{ width: '100%', height: '100%' }} />
        </View>
        <View className="flex-1 px-4 pb-4 pt-2" style={{ backgroundColor: slots.surface }}>
          <View className="flex-row items-end justify-between" style={{ marginTop: -(profileSize * 0.45) }}>
            <IdentityImage
              field={profile}
              {...imageColors}
              style={{
                width: profileSize,
                height: profileSize,
                borderRadius: 14,
                borderWidth: 3,
                borderColor: slots.surface,
              }}
            />
            <UniversalLogoBadge
              cardTheme={cardTheme}
              compact={compact}
              field={logo}
              placement="on-surface"
              slots={slots}
              templateId={section.templateId}
            />
          </View>
          <View className="mt-3">
            <IdentityName cardTheme={cardTheme} color={slots.textPrimary} compact={compact} name={name} />
          </View>
        </View>
      </View>
    );
  }

  // 6. Avatar & Halo Focus (spotlight): Full cover photo backdrop with glowing halo ring
  if (section.templateId === 'spotlight') {
    return (
      <View
        className={`items-center justify-center overflow-hidden p-5 ${boxed ? 'mb-5 rounded-[28px] border shadow-md' : ''}`}
        style={{ minHeight: compact ? 180 : 260, borderColor: slots.accent }}
      >
        {/* Full Cover Photo Background */}
        <IdentityImage field={cover} {...imageColors} style={{ position: 'absolute', inset: 0 }} />
        {/* Atmospheric Dark Gradient Overlay */}
        <LinearGradient
          colors={['rgba(2, 6, 23, 0.45)', 'rgba(2, 6, 23, 0.88)']}
          style={StyleSheet.absoluteFill}
        />

        <View className="mb-2">
          <UniversalLogoBadge
            cardTheme={cardTheme}
            compact
            field={logo}
            placement="on-cover"
            slots={slots}
            templateId={section.templateId}
          />
        </View>

        {/* Halo Spotlight Center Avatar */}
        <View
          className="my-2 items-center justify-center rounded-full p-2"
          style={{ backgroundColor: `${slots.accent}33`, borderWidth: 2.5, borderColor: slots.accent }}
        >
          <IdentityImage
            field={profile}
            {...imageColors}
            style={{
              width: profileSize,
              height: profileSize,
              borderRadius: profileSize / 2,
              borderWidth: 2,
              borderColor: '#ffffff',
            }}
          />
        </View>

        <View className="mt-2 w-full items-center">
          <IdentityName align="center" cardTheme={cardTheme} color="#ffffff" compact={compact} name={name} shadow />
        </View>
      </View>
    );
  }

  // 7. Ribbon Header (banner): dedicated top ribbon containing logo, cover band and avatar
  if (section.templateId === 'banner') {
    return (
      <View className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`} style={shellStyle}>
        <View className="flex-row items-center justify-between px-4 py-3" style={{ backgroundColor: slots.accent }}>
          <Text className="text-xs font-black uppercase tracking-wider" style={{ color: slots.accentText }}>Identity Pass</Text>
          <UniversalLogoBadge
            cardTheme={cardTheme}
            compact
            field={logo}
            placement="banner"
            slots={slots}
            templateId={section.templateId}
          />
        </View>
        <View style={{ height: compact ? 64 : 88 }}>
          <IdentityImage field={cover} {...imageColors} style={{ width: '100%', height: '100%' }} />
        </View>
        <View className="flex-1 flex-row items-center px-4 py-4" style={{ backgroundColor: slots.surface }}>
          <IdentityImage
            field={profile}
            {...imageColors}
            style={{
              width: profileSize,
              height: profileSize,
              borderRadius: 16,
              borderWidth: 2,
              borderColor: slots.highlight,
            }}
          />
          <View className="ml-3.5 min-w-0 flex-1">
            <IdentityName cardTheme={cardTheme} color={slots.surfaceTextPrimary} compact={compact} name={name} />
          </View>
        </View>
      </View>
    );
  }

  // 8. Modular Bento (cards): floating identity cardlet over cover photo background
  if (section.templateId === 'cards') {
    return (
      <View className={`overflow-hidden p-3 ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`} style={shellStyle}>
        <IdentityImage field={cover} {...imageColors} style={{ position: 'absolute', inset: 0 }} />
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.75)']}
          style={StyleSheet.absoluteFill}
        />
        <View
          className="flex-1 rounded-2xl border p-4 shadow-xl"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.88)', borderColor: slots.accent }}
        >
          <View className="flex-row items-center justify-between">
            <IdentityImage
              field={profile}
              {...imageColors}
              style={{
                width: profileSize,
                height: profileSize,
                borderRadius: 20,
                borderWidth: 2,
                borderColor: slots.accent,
              }}
            />
            <UniversalLogoBadge
              cardTheme={cardTheme}
              compact={compact}
              field={logo}
              placement="floating"
              slots={slots}
              templateId={section.templateId}
            />
          </View>
          <View className="mt-4">
            <IdentityName cardTheme={cardTheme} color="#ffffff" compact={compact} name={name} shadow />
          </View>
        </View>
      </View>
    );
  }

  // 9. Conference ID Pass (badge): vertical lanyard badge simulation with cover photo ribbon
  if (section.templateId === 'badge') {
    return (
      <View
        className={`overflow-hidden p-4 ${boxed ? 'mb-5 rounded-[28px] border shadow-md' : ''}`}
        style={{ backgroundColor: slots.surface, borderColor: slots.accent, minHeight: compact ? 200 : 270 }}
      >
        <View className="mb-3 items-center">
          <View className="h-1.5 w-14 rounded-full" style={{ backgroundColor: slots.highlight }} />
        </View>
        <View className="flex-row items-center justify-between">
          <UniversalLogoBadge
            cardTheme={cardTheme}
            compact={compact}
            field={logo}
            placement="badge"
            slots={slots}
            templateId={section.templateId}
          />
          <View className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: `${slots.accent}20` }}>
            <Text className="text-[10px] font-bold" style={{ color: slots.isDark ? slots.highlight : slots.accent }}>OFFICIAL PASS</Text>
          </View>
        </View>
        <View className="my-3 items-center">
          <IdentityImage
            field={profile}
            {...imageColors}
            style={{
              width: profileSize + 8,
              height: profileSize + 8,
              borderRadius: 18,
              borderWidth: 3,
              borderColor: slots.accent,
            }}
          />
        </View>
        <View className="items-center">
          <IdentityName align="center" cardTheme={cardTheme} color={slots.surfaceTextPrimary} compact={compact} name={name} />
        </View>
      </View>
    );
  }

  // 10. 50/50 Dual Column (split): left pane for cover photo with avatar & logo, right for preferred name
  if (section.templateId === 'split') {
    return (
      <View className={`flex-row overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`} style={shellStyle}>
        <View className="w-1/2 items-center justify-center p-4 overflow-hidden" style={{ backgroundColor: slots.background, borderRightWidth: 1, borderRightColor: slots.highlight }}>
          <IdentityImage field={cover} {...imageColors} style={{ position: 'absolute', inset: 0 }} />
          <View className="absolute inset-0 bg-black/35" />
          <IdentityImage
            field={profile}
            {...imageColors}
            style={{
              width: profileSize,
              height: profileSize,
              borderRadius: profileSize / 2,
              borderWidth: 3,
              borderColor: slots.accent,
            }}
          />
          <View className="mt-3">
            <UniversalLogoBadge
              cardTheme={cardTheme}
              compact
              field={logo}
              placement="on-cover"
              slots={slots}
              templateId={section.templateId}
            />
          </View>
        </View>
        <View className="w-1/2 justify-center p-4" style={{ backgroundColor: slots.surface }}>
          <IdentityName cardTheme={cardTheme} color={slots.surfaceTextPrimary} compact={compact} name={name} />
        </View>
      </View>
    );
  }

  // 11. Framed Outline (neon): cyber wireframe with cover backdrop
  if (section.templateId === 'neon') {
    return (
      <View
        className={`overflow-hidden p-4 ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`}
        style={{ backgroundColor: '#090d16', borderColor: slots.accent, borderWidth: 2, minHeight: compact ? 180 : 250 }}
      >
        <IdentityImage field={cover} {...imageColors} style={{ position: 'absolute', inset: 0, opacity: 0.22 }} />
        <View className="flex-row items-center justify-between border-b pb-3" style={{ borderBottomColor: slots.accent }}>
          <UniversalLogoBadge
            cardTheme={cardTheme}
            compact={compact}
            field={logo}
            placement="neon"
            slots={slots}
            templateId={section.templateId}
          />
          <View className="h-2.5 w-2.5 rounded-full shadow-sm" style={{ backgroundColor: slots.accent }} />
        </View>
        <View className="my-4 flex-row items-center">
          <IdentityImage
            field={profile}
            {...imageColors}
            style={{
              width: profileSize,
              height: profileSize,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: slots.accent,
            }}
          />
          <View className="ml-4 min-w-0 flex-1">
            <IdentityName cardTheme={cardTheme} color="#ffffff" compact={compact} name={name} shadow />
          </View>
        </View>
      </View>
    );
  }

  // 12. Editorial cover (classic): cover first, then clean identity row with overlapping avatar
  return (
    <View className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`} style={shellStyle}>
      <View className="relative" style={{ height: compact ? '48%' : 150 }}>
        <IdentityImage field={cover} {...imageColors} style={{ width: '100%', height: '100%' }} />
        <View className="absolute left-3 top-3">
          <UniversalLogoBadge
            cardTheme={cardTheme}
            compact={compact}
            field={logo}
            placement="on-cover"
            slots={slots}
            templateId={section.templateId}
          />
        </View>
      </View>
      <View className="flex-1 flex-row items-center px-3.5" style={{ backgroundColor: slots.surface }}>
        <IdentityImage
          field={profile}
          {...imageColors}
          style={{
            width: profileSize,
            height: profileSize,
            marginTop: compact ? -18 : -36,
            borderRadius: profileSize / 2,
            borderWidth: compact ? 2.5 : 3.5,
            borderColor: slots.accent,
          }}
        />
        <View className="ml-3 min-w-0 flex-1">
          <IdentityName cardTheme={cardTheme} color={slots.surfaceTextPrimary} compact={compact} name={name} />
        </View>
      </View>
    </View>
  );
}
