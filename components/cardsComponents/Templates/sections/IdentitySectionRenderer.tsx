import React from 'react';
import { Platform, View } from 'react-native';
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

  // Split profile (minimal): 40/60 horizontal split
  if (section.templateId === 'minimal') {
    return (
      <View className={`flex-row overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`} style={shellStyle}>
        <View className="w-[40%] items-center justify-center overflow-hidden p-2" style={{ backgroundColor: slots.background }}>
          <IdentityImage field={cover} {...imageColors} style={{ position: 'absolute', inset: 0 }} />
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
            <UniversalLogoBadge compact={compact} field={logo} />
          </View>
          <IdentityName cardTheme={cardTheme} color={slots.textPrimary} compact={compact} name={name} />
        </View>
      </View>
    );
  }

  // Hero banner (bold): full-bleed media
  if (section.templateId === 'bold') {
    return (
      <View className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border shadow-lg' : ''}`} style={shellStyle}>
        <IdentityImage field={cover} {...imageColors} style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }} />
        <View className="absolute right-3 top-3">
          <UniversalLogoBadge compact={compact} field={logo} />
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
            <IdentityName cardTheme={cardTheme} color={slots.textPrimary} compact={compact} name={name} shadow />
          </View>
        </View>
      </View>
    );
  }

  // Layered profile (glass): cover band above surface card
  if (section.templateId === 'glass') {
    return (
      <View className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border shadow-md' : ''}`} style={shellStyle}>
        <IdentityImage field={cover} {...imageColors} style={{ width: '100%', height: compact ? '42%' : 130 }} />
        <View className="flex-1 items-center justify-end px-4 pb-4" style={{ backgroundColor: slots.surface }}>
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
          <View className="mt-1.5 items-center">
            <UniversalLogoBadge compact={compact} field={logo} />
          </View>
          <View className="mt-1 w-full">
            <IdentityName align="center" cardTheme={cardTheme} color={slots.textPrimary} compact={compact} name={name} />
          </View>
        </View>
      </View>
    );
  }

  // Pocket Pass (compact): dense horizontal single-row flow
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
        <UniversalLogoBadge compact field={logo} />
      </View>
    );
  }

  // Magazine Monograph (editorial): top cover band with offset square avatar and serif title
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
                borderRadius: 12,
                borderWidth: 3,
                borderColor: slots.surface,
              }}
            />
            <UniversalLogoBadge compact={compact} field={logo} />
          </View>
          <View className="mt-3">
            <IdentityName cardTheme={cardTheme} color={slots.textPrimary} compact={compact} name={name} />
          </View>
        </View>
      </View>
    );
  }

  // Avatar & Halo Focus (spotlight): centered avatar with glowing halo ring
  if (section.templateId === 'spotlight') {
    return (
      <View
        className={`items-center justify-center overflow-hidden p-5 ${boxed ? 'mb-5 rounded-[28px] border shadow-md' : ''}`}
        style={{ backgroundColor: slots.surface, borderColor: slots.highlight, minHeight: compact ? 180 : 250 }}
      >
        <View className="mb-2">
          <UniversalLogoBadge compact field={logo} />
        </View>
        <View
          className="my-2 items-center justify-center rounded-full p-1.5"
          style={{ backgroundColor: `${slots.accent}22`, borderWidth: 2, borderColor: slots.accent }}
        >
          <IdentityImage
            field={profile}
            {...imageColors}
            style={{
              width: profileSize,
              height: profileSize,
              borderRadius: profileSize / 2,
            }}
          />
        </View>
        <View className="mt-2 w-full items-center">
          <IdentityName align="center" cardTheme={cardTheme} color={slots.textPrimary} compact={compact} name={name} />
        </View>
      </View>
    );
  }

  // Ribbon Header (banner): dedicated top ribbon containing logo, avatar and name below
  if (section.templateId === 'banner') {
    return (
      <View className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`} style={shellStyle}>
        <View className="flex-row items-center justify-between px-4 py-3" style={{ backgroundColor: slots.accent }}>
          <Text className="text-xs font-black uppercase tracking-wider text-white">Identity Pass</Text>
          <UniversalLogoBadge compact field={logo} />
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
            <IdentityName cardTheme={cardTheme} color={slots.textPrimary} compact={compact} name={name} />
          </View>
        </View>
      </View>
    );
  }

  // Modular Bento (cards): floating identity cardlet over background
  if (section.templateId === 'cards') {
    return (
      <View className={`overflow-hidden p-3 ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`} style={shellStyle}>
        <View
          className="flex-1 rounded-2xl border p-4 shadow-sm"
          style={{ backgroundColor: slots.surface, borderColor: slots.highlight }}
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
            <UniversalLogoBadge compact={compact} field={logo} />
          </View>
          <View className="mt-4">
            <IdentityName cardTheme={cardTheme} color={slots.textPrimary} compact={compact} name={name} />
          </View>
        </View>
      </View>
    );
  }

  // Conference ID Pass (badge): vertical lanyard badge simulation
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
          <UniversalLogoBadge compact={compact} field={logo} />
          <View className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: `${slots.accent}20` }}>
            <Text className="text-[10px] font-bold" style={{ color: slots.accent }}>OFFICIAL PASS</Text>
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
          <IdentityName align="center" cardTheme={cardTheme} color={slots.textPrimary} compact={compact} name={name} />
        </View>
      </View>
    );
  }

  // 50/50 Dual Column (split): left pane for avatar/logo, right for preferred name
  if (section.templateId === 'split') {
    return (
      <View className={`flex-row overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`} style={shellStyle}>
        <View className="w-1/2 items-center justify-center p-4" style={{ backgroundColor: slots.background, borderRightWidth: 1, borderRightColor: slots.highlight }}>
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
            <UniversalLogoBadge compact field={logo} />
          </View>
        </View>
        <View className="w-1/2 justify-center p-4" style={{ backgroundColor: slots.surface }}>
          <IdentityName cardTheme={cardTheme} color={slots.textPrimary} compact={compact} name={name} />
        </View>
      </View>
    );
  }

  // Framed Outline (neon): sharp glowing border wireframe
  if (section.templateId === 'neon') {
    return (
      <View
        className={`overflow-hidden p-4 ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`}
        style={{ backgroundColor: slots.background, borderColor: slots.accent, borderWidth: 2, minHeight: compact ? 180 : 250 }}
      >
        <View className="flex-row items-center justify-between border-b pb-3" style={{ borderBottomColor: slots.accent }}>
          <UniversalLogoBadge compact={compact} field={logo} />
          <View className="h-2 w-2 rounded-full" style={{ backgroundColor: slots.accent }} />
        </View>
        <View className="my-4 flex-row items-center">
          <IdentityImage
            field={profile}
            {...imageColors}
            style={{
              width: profileSize,
              height: profileSize,
              borderRadius: 8,
              borderWidth: 2,
              borderColor: slots.accent,
            }}
          />
          <View className="ml-4 min-w-0 flex-1">
            <IdentityName cardTheme={cardTheme} color={slots.textPrimary} compact={compact} name={name} />
          </View>
        </View>
      </View>
    );
  }

  // Editorial cover (classic): cover first, then clean identity row
  return (
    <View className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`} style={shellStyle}>
      <View className="relative" style={{ height: compact ? '48%' : 150 }}>
        <IdentityImage field={cover} {...imageColors} style={{ width: '100%', height: '100%' }} />
        <View className="absolute left-3 top-3">
          <UniversalLogoBadge compact={compact} field={logo} />
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
          <IdentityName cardTheme={cardTheme} color={slots.textPrimary} compact={compact} name={name} />
        </View>
      </View>
    </View>
  );
}
