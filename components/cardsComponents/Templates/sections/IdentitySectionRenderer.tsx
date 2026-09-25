import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/uiComponents/Text';
import type { CardDetailSection } from '../cardDetailTemplate';
import type { CardTemplateId, CardVisualTheme } from '../../types/card.types';
import { getCardFontFamily, getCardLetterSpacing } from '../cardTheme';
import { IdentityImage } from './SectionSharedComponents';
import { getCardThemeContrastPalette, getGradientContrastPalette } from '@/utils/cardThemeColor';

type Props = {
  compact?: boolean;
  cardTheme: CardVisualTheme;
  gradient: [string, string];
  section: CardDetailSection;
  seamless?: boolean;
  showEmpty?: boolean;
};

type IdentityColorRoles = {
  background: string;
  decoration: string;
  header: string;
  imagePlaceholder: string;
  secondary: string;
  surface: string;
};

function resolveIdentityColorRoles(
  cardTheme: CardVisualTheme,
  templateId: CardTemplateId,
): IdentityColorRoles {
  const contrast = templateId === 'bold'
    ? getGradientContrastPalette(cardTheme.gradient)
    : getCardThemeContrastPalette(cardTheme);
  return {
    background: cardTheme.backgroundColor,
    decoration: cardTheme.accentColor,
    header: contrast.primary,
    imagePlaceholder: cardTheme.surfaceColor,
    secondary: contrast.secondary,
    surface: cardTheme.surfaceColor,
  };
}

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
        textShadowColor: shadow ? 'rgba(0, 0, 0, 0.9)' : undefined,
        textShadowOffset: shadow ? { width: 0, height: 1 } : undefined,
        textShadowRadius: shadow ? 4 : undefined,
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
  const colors = resolveIdentityColorRoles(cardTheme, section.templateId);
  const profileSize = compact ? 52 : 96;
  const logoWidth = compact ? 74 : 128;
  const logoHeight = compact ? 30 : 50;
  const shellStyle = {
    backgroundColor: colors.background,
    borderColor: boxed ? colors.decoration : undefined,
    height: compact ? ('100%' as const) : undefined,
    minHeight: compact ? undefined : 260,
  };
  const imageColors = {
    iconColor: colors.secondary,
    placeholderColor: colors.imagePlaceholder,
  };

  // Split profile: media column left, identity content right.
  if (section.templateId === 'minimal') {
    return (
      <View className={`flex-row overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`} style={shellStyle}>
        <View className="w-[40%] items-center justify-center overflow-hidden p-2" style={{ backgroundColor: colors.background }}>
          <IdentityImage field={cover} {...imageColors} style={{ position: 'absolute', inset: 0 }} />
          <IdentityImage
            field={profile}
            {...imageColors}
            style={{
              width: profileSize,
              height: profileSize,
              borderRadius: profileSize / 2,
              borderWidth: compact ? 2.5 : 3.5,
              borderColor: colors.decoration,
            }}
          />
        </View>
        <View className="flex-1 justify-between p-3.5" style={{ backgroundColor: colors.surface }}>
          <IdentityImage field={logo} {...imageColors} fit="contain" style={{ width: logoWidth, height: logoHeight }} />
          <IdentityName cardTheme={cardTheme} color={colors.header} compact={compact} name={name} />
        </View>
      </View>
    );
  }

  // Hero banner: preserve the cover as uninterrupted full-bleed media.
  if (section.templateId === 'bold') {
    return (
      <View
        className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border shadow-lg' : ''}`}
        style={shellStyle}
      >
        <IdentityImage
          field={cover}
          {...imageColors}
          style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }}
        />
        <View className="absolute right-3 top-3">
          <IdentityImage
            field={logo}
            {...imageColors}
            fit="contain"
            style={{ width: logoWidth, height: logoHeight }}
          />
        </View>
        <View className="absolute bottom-0 left-0 right-0 flex-row items-end px-4 pb-4">
          <View>
            <IdentityImage
              field={profile}
              {...imageColors}
              style={{
                width: profileSize,
                height: profileSize,
                borderRadius: compact ? 16 : 22,
                borderWidth: compact ? 2.5 : 3.5,
                borderColor: colors.decoration,
              }}
            />
          </View>
          <View className="ml-3 min-w-0 flex-1 pb-1">
            <IdentityName cardTheme={cardTheme} color={colors.header} compact={compact} name={name} shadow />
          </View>
        </View>
      </View>
    );
  }

  // Layered profile: cover band above a solid styling surface.
  if (section.templateId === 'glass') {
    return (
      <View className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border shadow-md' : ''}`} style={shellStyle}>
        <IdentityImage field={cover} {...imageColors} style={{ width: '100%', height: compact ? '42%' : 130 }} />
        <View className="flex-1 items-center justify-end px-4 pb-4" style={{ backgroundColor: colors.surface }}>
          <View style={{ marginTop: -(profileSize / 2) }}>
            <IdentityImage
              field={profile}
              {...imageColors}
              style={{
                width: profileSize,
                height: profileSize,
                borderRadius: profileSize / 2,
                borderWidth: compact ? 2.5 : 3.5,
                borderColor: colors.decoration,
              }}
            />
          </View>
          <IdentityImage field={logo} {...imageColors} fit="contain" style={{ width: logoWidth, height: logoHeight }} />
          <View className="mt-1 w-full">
            <IdentityName align="center" cardTheme={cardTheme} color={colors.header} compact={compact} name={name} />
          </View>
        </View>
      </View>
    );
  }

  // Editorial cover: cover first, then a clean identity row.
  return (
    <View className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`} style={shellStyle}>
      <View className="relative" style={{ height: compact ? '48%' : 150 }}>
        <IdentityImage field={cover} {...imageColors} style={{ width: '100%', height: '100%' }} />
        <View className="absolute left-3 top-3 p-1.5" style={{ backgroundColor: colors.surface }}>
          <IdentityImage field={logo} {...imageColors} fit="contain" style={{ width: logoWidth, height: logoHeight }} />
        </View>
      </View>
      <View className="flex-1 flex-row items-center px-3.5" style={{ backgroundColor: colors.surface }}>
        <IdentityImage
          field={profile}
          {...imageColors}
          style={{
            width: profileSize,
            height: profileSize,
            marginTop: compact ? -18 : -36,
            borderRadius: profileSize / 2,
            borderWidth: compact ? 2.5 : 3.5,
            borderColor: colors.decoration,
          }}
        />
        <View className="ml-3 min-w-0 flex-1">
          <IdentityName cardTheme={cardTheme} color={colors.header} compact={compact} name={name} />
        </View>
      </View>
    </View>
  );
}
