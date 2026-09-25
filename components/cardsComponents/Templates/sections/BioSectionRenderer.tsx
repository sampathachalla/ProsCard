import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Quote } from 'lucide-react-native';
import { Text } from '@/components/uiComponents/Text';
import type { CardDetailSection } from '../cardDetailTemplate';
import type { CardVisualTheme } from '../../types/card.types';
import { getCardFontFamily, getCardLetterSpacing } from '../cardTheme';
import { getGradientContrastPalette } from '@/utils/cardThemeColor';

type Props = {
  compact?: boolean;
  cardTheme: CardVisualTheme;
  gradient: [string, string];
  section: CardDetailSection;
  seamless?: boolean;
  showEmpty?: boolean;
};

export function BioSectionRenderer({
  compact = false,
  cardTheme,
  gradient,
  section,
  seamless = false,
  showEmpty = false,
}: Props) {
  const boxed = compact && !seamless;
  const bioText =
    section.fields.find((f) => f.id === 'bio')?.value?.trim() ||
    (showEmpty ? 'Short professional biography describing your background, mission, and achievements.' : 'No bio provided.');

  const fontFamily = getCardFontFamily(cardTheme.fontStyle);
  const letterSpacing = getCardLetterSpacing(cardTheme.fontStyle);
  const gradientContrast = getGradientContrastPalette(gradient);
  const sharedTextProps = {
    adjustsFontSizeToFit: compact,
    minimumFontScale: 0.76,
    numberOfLines: compact ? 4 : undefined,
  } as const;

  // Executive Statement: résumé-like copy with a strong vertical reading rail.
  if (section.templateId === 'minimal') {
    return (
      <View
        className={`justify-center overflow-hidden px-5 py-4 ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`}
        style={{
          backgroundColor: cardTheme.backgroundColor,
          borderColor: boxed ? cardTheme.accentColor : undefined,
          borderWidth: boxed ? 1 : 0,
          height: compact ? '100%' : undefined,
          minHeight: compact ? undefined : 116,
        }}
      >
        <View style={{ borderLeftColor: cardTheme.accentColor, borderLeftWidth: 4, paddingLeft: compact ? 12 : 18 }}>
          <Text
            {...sharedTextProps}
            className={`leading-relaxed ${compact ? 'text-xs font-semibold' : 'text-base font-semibold'}`}
            style={{ color: cardTheme.textColor, fontFamily, letterSpacing }}
          >
            {bioText}
          </Text>
        </View>
      </View>
    );
  }

  // Callout Banner: centered, borderless statement over the theme gradient.
  if (section.templateId === 'bold') {
    return (
      <LinearGradient
        colors={gradient}
        className={`items-center justify-center overflow-hidden px-6 py-5 ${boxed ? 'mb-5 rounded-[28px] shadow-lg' : ''}`}
        style={{ height: compact ? '100%' : undefined, minHeight: compact ? undefined : 132 }}
      >
        <View className="mb-3 h-1 w-12 rounded-full" style={{ backgroundColor: gradientContrast.primary }} />
        <Text
          {...sharedTextProps}
          className={`leading-relaxed ${compact ? 'text-center text-sm font-extrabold' : 'text-center text-lg font-extrabold'}`}
          style={{ color: gradientContrast.primary, fontFamily, letterSpacing }}
        >
          {bioText}
        </Text>
        <View className="mt-3 h-1 w-7 rounded-full" style={{ backgroundColor: cardTheme.accentColor }} />
        <View className="absolute left-3 top-2 opacity-20">
          <Quote color={gradientContrast.primary} size={compact ? 34 : 48} strokeWidth={1.4} />
        </View>
      </LinearGradient>
    );
  }

  // Frosted Parchment: a compact layered note floating above the theme.
  if (section.templateId === 'glass') {
    return (
      <LinearGradient
        colors={gradient}
        className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] shadow-md' : ''}`}
        style={{
          height: compact ? '100%' : undefined,
          minHeight: compact ? undefined : 148,
          padding: compact ? 12 : 16,
        }}
      >
        <View
          className="absolute"
          style={{
            backgroundColor: cardTheme.accentColor,
            borderRadius: 20,
            bottom: compact ? 8 : 10,
            left: compact ? 20 : 24,
            right: compact ? 8 : 10,
            top: compact ? 20 : 24,
          }}
        />
        <View
          className="flex-1 overflow-hidden"
          style={{
            backgroundColor: cardTheme.surfaceColor,
            borderColor: cardTheme.mutedTextColor,
            borderRadius: 20,
            borderWidth: 1,
            padding: compact ? 13 : 18,
          }}
        >
          <View className="mb-3 flex-row items-center justify-between">
            <View className="h-1 w-10 rounded-full" style={{ backgroundColor: cardTheme.accentColor }} />
            <Quote color={cardTheme.accentColor} size={compact ? 17 : 21} strokeWidth={2} />
          </View>
          <Text
            {...sharedTextProps}
            style={{
              color: cardTheme.textColor,
              fontFamily,
              fontSize: compact ? 12 : 15,
              letterSpacing,
              lineHeight: compact ? 18 : 23,
            }}
          >
            {bioText}
          </Text>
        </View>
      </LinearGradient>
    );
  }

  // Editorial Story: magazine-style quote gutter beside the narrative.
  return (
    <View
      className={`flex-row overflow-hidden px-4 py-5 ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`}
      style={{
        backgroundColor: cardTheme.surfaceColor,
        borderColor: boxed ? cardTheme.accentColor : undefined,
        height: compact ? '100%' : undefined,
        minHeight: compact ? undefined : 124,
      }}
    >
      <View className="mr-4 items-center">
        <Quote color={cardTheme.accentColor} size={compact ? 20 : 26} strokeWidth={2.2} />
        <View className="mt-2 w-0.5 flex-1 rounded-full" style={{ backgroundColor: cardTheme.accentColor }} />
      </View>
      <Text
        {...sharedTextProps}
        className={`flex-1 leading-relaxed ${compact ? 'text-xs' : 'text-base'}`}
        style={{ color: cardTheme.textColor, fontFamily, letterSpacing }}
      >
        {bioText}
      </Text>
    </View>
  );
}
