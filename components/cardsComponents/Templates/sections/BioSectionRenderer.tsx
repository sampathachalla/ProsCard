import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Quote } from 'lucide-react-native';
import { Text } from '@/components/uiComponents/Text';
import type { CardDetailSection } from '../cardDetailTemplate';
import type { CardVisualTheme } from '../../types/card.types';
import { getCardFontFamily, getCardLetterSpacing } from '../cardTheme';
import { resolveLayoutColorSlots } from '@/utils/cardThemeColor';

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
  const slots = resolveLayoutColorSlots({ templateId: section.templateId, theme: cardTheme });
  const sharedTextProps = {
    adjustsFontSizeToFit: compact,
    minimumFontScale: 0.76,
    numberOfLines: compact ? 4 : undefined,
  } as const;

  // Executive Statement (minimal): left accent rail with clean typography
  if (section.templateId === 'minimal') {
    return (
      <View
        className={`justify-center overflow-hidden px-5 py-4 ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`}
        style={{
          backgroundColor: slots.background,
          borderColor: boxed ? slots.accent : undefined,
          borderWidth: boxed ? 1 : 0,
          height: compact ? '100%' : undefined,
          minHeight: compact ? undefined : 116,
        }}
      >
        <View style={{ borderLeftColor: slots.accent, borderLeftWidth: 4, paddingLeft: compact ? 12 : 18 }}>
          <Text
            {...sharedTextProps}
            className={`leading-relaxed ${compact ? 'text-xs font-semibold' : 'text-base font-semibold'}`}
            style={{ color: slots.textPrimary, fontFamily, letterSpacing }}
          >
            {bioText}
          </Text>
        </View>
      </View>
    );
  }

  // Callout Banner (bold): centered statement over theme gradient
  if (section.templateId === 'bold') {
    return (
      <LinearGradient
        colors={gradient}
        className={`items-center justify-center overflow-hidden px-6 py-5 ${boxed ? 'mb-5 rounded-[28px] shadow-lg' : ''}`}
        style={{ height: compact ? '100%' : undefined, minHeight: compact ? undefined : 132 }}
      >
        <View className="mb-3 h-1 w-12 rounded-full" style={{ backgroundColor: slots.gradientText }} />
        <Text
          {...sharedTextProps}
          className={`leading-relaxed ${compact ? 'text-center text-sm font-extrabold' : 'text-center text-lg font-extrabold'}`}
          style={{ color: slots.gradientText, fontFamily, letterSpacing }}
        >
          {bioText}
        </Text>
        <View className="mt-3 h-1 w-7 rounded-full" style={{ backgroundColor: slots.highlight }} />
        <View className="absolute left-3 top-2 opacity-20">
          <Quote color={slots.gradientText} size={compact ? 34 : 48} strokeWidth={1.4} />
        </View>
      </LinearGradient>
    );
  }

  // Frosted Parchment (glass): floating note with highlight border
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
            backgroundColor: slots.accent,
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
            backgroundColor: slots.surface,
            borderColor: slots.highlight,
            borderRadius: 20,
            borderWidth: 1,
            padding: compact ? 13 : 18,
          }}
        >
          <View className="mb-3 flex-row items-center justify-between">
            <View className="h-1 w-10 rounded-full" style={{ backgroundColor: slots.accent }} />
            <Quote color={slots.accent} size={compact ? 17 : 21} strokeWidth={2} />
          </View>
          <Text
            {...sharedTextProps}
            style={{
              color: slots.textPrimary,
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

  // Pocket Pass (compact): dense preview note
  if (section.templateId === 'compact') {
    return (
      <View
        className={`flex-row items-center overflow-hidden px-4 py-3 ${boxed ? 'mb-5 rounded-[24px] border shadow-sm' : ''}`}
        style={{ backgroundColor: slots.surface, borderColor: slots.highlight }}
      >
        <Quote color={slots.accent} size={14} strokeWidth={2.4} />
        <Text
          numberOfLines={2}
          className="ml-2.5 flex-1 text-xs font-semibold leading-relaxed"
          style={{ color: slots.textPrimary, fontFamily, letterSpacing }}
        >
          {bioText}
        </Text>
      </View>
    );
  }

  // Magazine Monograph (editorial): editorial drop-quote style
  if (section.templateId === 'editorial') {
    return (
      <View
        className={`overflow-hidden p-5 ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`}
        style={{ backgroundColor: slots.surface, borderColor: slots.highlight }}
      >
        <View className="mb-2 flex-row items-center justify-between border-b pb-2" style={{ borderBottomColor: slots.highlight }}>
          <Text className="text-[10px] font-black uppercase tracking-wider" style={{ color: slots.accent }}>ABOUT</Text>
          <Quote color={slots.accent} size={16} />
        </View>
        <Text
          {...sharedTextProps}
          className={`leading-relaxed italic ${compact ? 'text-xs' : 'text-sm'}`}
          style={{ color: slots.textPrimary, fontFamily, letterSpacing }}
        >
          "{bioText}"
        </Text>
      </View>
    );
  }

  // Centered Focus (spotlight): centered quote card with decorative dots
  if (section.templateId === 'spotlight') {
    return (
      <View
        className={`items-center justify-center overflow-hidden p-5 ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`}
        style={{ backgroundColor: slots.surface, borderColor: slots.highlight }}
      >
        <Quote color={slots.accent} size={22} strokeWidth={2} />
        <Text
          {...sharedTextProps}
          className={`my-3 text-center leading-relaxed font-medium ${compact ? 'text-xs' : 'text-sm'}`}
          style={{ color: slots.textPrimary, fontFamily, letterSpacing }}
        >
          {bioText}
        </Text>
        <View className="flex-row gap-1.5">
          <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: slots.accent }} />
          <View className="h-1.5 w-4 rounded-full" style={{ backgroundColor: slots.accent }} />
          <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: slots.accent }} />
        </View>
      </View>
    );
  }

  // Ribbon Header (banner): top ribbon header with card body
  if (section.templateId === 'banner') {
    return (
      <View className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`} style={{ backgroundColor: slots.surface, borderColor: slots.highlight }}>
        <View className="px-4 py-2" style={{ backgroundColor: slots.accent }}>
          <Text className="text-xs font-black uppercase tracking-wider text-white">Executive Profile</Text>
        </View>
        <View className="p-4">
          <Text
            {...sharedTextProps}
            className={`leading-relaxed ${compact ? 'text-xs' : 'text-sm'}`}
            style={{ color: slots.textPrimary, fontFamily, letterSpacing }}
          >
            {bioText}
          </Text>
        </View>
      </View>
    );
  }

  // Modular Bento (cards): inset floating cardlet
  if (section.templateId === 'cards') {
    return (
      <View className={`overflow-hidden p-3 ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`} style={{ backgroundColor: slots.background }}>
        <View className="rounded-2xl border p-4 shadow-sm" style={{ backgroundColor: slots.surface, borderColor: slots.highlight }}>
          <View className="mb-2.5 flex-row items-center justify-between">
            <Text className="text-[10px] font-black uppercase tracking-wider" style={{ color: slots.accent }}>SUMMARY</Text>
            <Quote color={slots.accent} size={15} />
          </View>
          <Text
            {...sharedTextProps}
            className={`leading-relaxed ${compact ? 'text-xs' : 'text-sm'}`}
            style={{ color: slots.textPrimary, fontFamily, letterSpacing }}
          >
            {bioText}
          </Text>
        </View>
      </View>
    );
  }

  // Conference ID Pass (badge): verification card
  if (section.templateId === 'badge') {
    return (
      <View
        className={`overflow-hidden p-4 ${boxed ? 'mb-5 rounded-[28px] border shadow-md' : ''}`}
        style={{ backgroundColor: slots.surface, borderColor: slots.accent }}
      >
        <View className="mb-2 flex-row items-center justify-between border-b pb-2" style={{ borderBottomColor: slots.highlight }}>
          <Text className="text-[10px] font-black uppercase tracking-wider" style={{ color: slots.accent }}>VERIFIED BIOGRAPHY</Text>
          <View className="h-2 w-2 rounded-full" style={{ backgroundColor: slots.accent }} />
        </View>
        <Text
          {...sharedTextProps}
          className={`leading-relaxed ${compact ? 'text-xs' : 'text-sm'}`}
          style={{ color: slots.textPrimary, fontFamily, letterSpacing }}
        >
          {bioText}
        </Text>
      </View>
    );
  }

  // 50/50 Dual Column (split): left emblem column, right text
  if (section.templateId === 'split') {
    return (
      <View className={`flex-row overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`} style={{ backgroundColor: slots.surface, borderColor: slots.highlight }}>
        <View className="w-1/4 items-center justify-center p-3 border-r" style={{ borderRightColor: slots.highlight, backgroundColor: slots.background }}>
          <Quote color={slots.accent} size={28} strokeWidth={2} />
        </View>
        <View className="flex-1 p-4 justify-center" style={{ backgroundColor: slots.surface }}>
          <Text
            {...sharedTextProps}
            className={`leading-relaxed ${compact ? 'text-xs' : 'text-sm'}`}
            style={{ color: slots.textPrimary, fontFamily, letterSpacing }}
          >
            {bioText}
          </Text>
        </View>
      </View>
    );
  }

  // Framed Outline (neon): high-contrast wireframe
  if (section.templateId === 'neon') {
    return (
      <View
        className={`overflow-hidden p-4 ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`}
        style={{ backgroundColor: slots.background, borderColor: slots.accent, borderWidth: 2 }}
      >
        <View className="mb-2 flex-row items-center justify-between">
          <Quote color={slots.accent} size={18} />
          <Text className="text-[10px] font-black uppercase tracking-wider" style={{ color: slots.accent }}>BIO // STATEMENT</Text>
        </View>
        <Text
          {...sharedTextProps}
          className={`leading-relaxed ${compact ? 'text-xs' : 'text-sm'}`}
          style={{ color: slots.textPrimary, fontFamily, letterSpacing }}
        >
          {bioText}
        </Text>
      </View>
    );
  }

  // Editorial Story (classic): magazine-style quote gutter beside narrative
  return (
    <View
      className={`flex-row overflow-hidden px-4 py-5 ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`}
      style={{
        backgroundColor: slots.surface,
        borderColor: boxed ? slots.accent : undefined,
        height: compact ? '100%' : undefined,
        minHeight: compact ? undefined : 124,
      }}
    >
      <View className="mr-4 items-center">
        <Quote color={slots.accent} size={compact ? 20 : 26} strokeWidth={2.2} />
        <View className="mt-2 w-0.5 flex-1 rounded-full" style={{ backgroundColor: slots.accent }} />
      </View>
      <Text
        {...sharedTextProps}
        className={`flex-1 leading-relaxed ${compact ? 'text-xs' : 'text-base'}`}
        style={{ color: slots.textPrimary, fontFamily, letterSpacing }}
      >
        {bioText}
      </Text>
    </View>
  );
}
