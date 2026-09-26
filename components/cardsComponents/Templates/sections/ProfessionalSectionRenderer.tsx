import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Building2, Quote } from 'lucide-react-native';
import { Text } from '@/components/uiComponents/Text';
import type { CardDetailSection } from '../cardDetailTemplate';
import type { CardVisualTheme, ResolvedLayoutSlots } from '../../types/card.types';
import { getCardFontFamily, getCardLetterSpacing } from '../cardTheme';
import { fitAccreditationsToViewport, fitTaglineToViewport } from '@/utils/cardTextLayout';
import { resolveLayoutColorSlots } from '@/utils/cardThemeColor';

type Props = {
  compact?: boolean;
  cardTheme: CardVisualTheme;
  gradient: [string, string];
  section: CardDetailSection;
  seamless?: boolean;
  showEmpty?: boolean;
};

type SharedPieceProps = {
  cardTheme: CardVisualTheme;
  slots: ResolvedLayoutSlots;
  compact: boolean;
};

function ProfessionalName({
  accreditations,
  align = 'left',
  cardTheme,
  compact,
  name,
  slots,
}: SharedPieceProps & {
  accreditations?: string;
  align?: 'left' | 'center' | 'right';
  name: string;
}) {
  const displayName = [name, accreditations?.trim()].filter(Boolean).join(', ');
  return (
    <Text
      adjustsFontSizeToFit
      minimumFontScale={0.72}
      numberOfLines={compact ? 2 : 3}
      className={compact ? 'text-base font-black leading-tight' : 'text-2xl font-black leading-tight'}
      style={{
        color: slots.textPrimary,
        fontFamily: getCardFontFamily(cardTheme.fontStyle),
        letterSpacing: getCardLetterSpacing(cardTheme.fontStyle),
        textAlign: align,
      }}
    >
      {displayName}
    </Text>
  );
}

function ProfessionalRole({
  align = 'left',
  cardTheme,
  company,
  compact,
  slots,
  title,
}: SharedPieceProps & {
  align?: 'left' | 'center' | 'right';
  company: string;
  title: string;
}) {
  const alignmentClass = align === 'center' ? 'items-center' : align === 'right' ? 'items-end' : 'items-start';
  return (
    <View className={alignmentClass}>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.72}
        numberOfLines={compact ? 1 : 2}
        className={`font-extrabold ${compact ? 'text-xs' : 'text-base'}`}
        style={{
          color: slots.textPrimary,
          fontFamily: getCardFontFamily(cardTheme.fontStyle),
          letterSpacing: getCardLetterSpacing(cardTheme.fontStyle),
          textAlign: align,
        }}
      >
        {title}
      </Text>
      <View className="mt-0.5 flex-row items-center">
        <Building2 color={slots.textSecondary} size={compact ? 11 : 14} />
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.72}
          numberOfLines={1}
          className={`ml-1.5 font-semibold ${compact ? 'text-[11px]' : 'text-sm'}`}
          style={{
            color: slots.textSecondary,
            fontFamily: getCardFontFamily(cardTheme.fontStyle),
            letterSpacing: getCardLetterSpacing(cardTheme.fontStyle),
          }}
        >
          {company}
        </Text>
      </View>
    </View>
  );
}

function ProfessionalTagline({
  cardTheme,
  compact,
  slots,
  tagline,
}: SharedPieceProps & { tagline: string }) {
  if (!tagline) return null;
  return (
    <View className="flex-row items-center">
      <View
        className="mr-2 self-stretch rounded-full"
        style={{ backgroundColor: slots.accent, width: 3 }}
      />
      <Quote color={slots.accent} size={compact ? 14 : 17} strokeWidth={2.4} />
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.78}
        numberOfLines={1}
        className={`ml-2 flex-1 font-bold italic ${compact ? 'text-[11px]' : 'text-sm'}`}
        style={{
          color: slots.textPrimary,
          fontFamily: getCardFontFamily(cardTheme.fontStyle),
          letterSpacing: getCardLetterSpacing(cardTheme.fontStyle),
        }}
      >
        {tagline}
      </Text>
    </View>
  );
}

export function ProfessionalSectionRenderer({
  compact = false,
  cardTheme,
  gradient,
  section,
  seamless = false,
  showEmpty = false,
}: Props) {
  const { width: viewportWidth } = useWindowDimensions();
  const boxed = compact && !seamless;
  const getVal = (id: string) => section.fields.find((item) => item.id === id)?.value?.trim() || '';
  const tagline = fitTaglineToViewport(getVal('tagline'), viewportWidth);
  const accreditations = fitAccreditationsToViewport(getVal('accreditations'), viewportWidth);
  const title = getVal('title') || (showEmpty ? 'Job Title' : 'Professional Title');
  const company = getVal('company') || (showEmpty ? 'Company Name' : 'Company / Organization');
  const fullNameParts = [getVal('prefix'), getVal('firstName'), getVal('middleName'), getVal('lastName'), getVal('suffix')].filter(Boolean);
  const professionalName = fullNameParts.length > 0 ? fullNameParts.join(' ') : showEmpty ? 'Professional Name' : title;
  const slots = resolveLayoutColorSlots({ templateId: section.templateId, theme: cardTheme });
  const shared = { cardTheme, compact, slots };

  // Résumé layout (minimal): vertical editorial hierarchy with thick accent left rail
  if (section.templateId === 'minimal') {
    return (
      <View
        className={`justify-between overflow-hidden p-4 ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`}
        style={{
          backgroundColor: slots.background,
          borderColor: boxed ? slots.accent : undefined,
          borderLeftColor: slots.accent,
          borderLeftWidth: 5,
          height: compact ? '100%' : undefined,
        }}
      >
        <View>
          <ProfessionalName {...shared} name={professionalName} accreditations={accreditations} />
          <View className={compact ? 'mt-2' : 'mt-4'}>
            <ProfessionalRole {...shared} title={title} company={company} />
          </View>
        </View>
        <View className={`border-t ${compact ? 'mt-2 pt-2' : 'mt-4 pt-3'}`} style={{ borderColor: slots.accent }}>
          <ProfessionalTagline {...shared} tagline={tagline} />
        </View>
      </View>
    );
  }

  // Bold layout: centered networking-card statement over gradient
  if (section.templateId === 'bold') {
    return (
      <LinearGradient
        colors={gradient}
        className={`items-center justify-center overflow-hidden p-4 ${boxed ? 'mb-5 rounded-[28px] shadow-lg' : ''}`}
        style={{ height: compact ? '100%' : undefined }}
      >
        <View className="w-full items-center">
          <ProfessionalName {...shared} align="center" name={professionalName} accreditations={accreditations} />
          <View className={compact ? 'mt-2' : 'mt-4'}>
            <ProfessionalRole {...shared} align="center" title={title} company={company} />
          </View>
          {tagline ? (
            <View className={`w-full ${compact ? 'mt-2' : 'mt-4'}`}>
              <ProfessionalTagline {...shared} tagline={tagline} />
            </View>
          ) : null}
        </View>
      </LinearGradient>
    );
  }

  // Glass layout: layered vertical hierarchy on surface card with highlight border
  if (section.templateId === 'glass') {
    return (
      <View
        className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border shadow-md' : ''}`}
        style={{ backgroundColor: slots.background, borderColor: slots.highlight, height: compact ? '100%' : undefined }}
      >
        <View
          className={`flex-1 justify-between rounded-2xl border ${compact ? 'p-3.5' : 'p-5'}`}
          style={{ backgroundColor: slots.surface, borderColor: slots.highlight }}
        >
          <View>
            <ProfessionalName {...shared} name={professionalName} accreditations={accreditations} />
            <View
              className={compact ? 'my-2 h-px' : 'my-4 h-px'}
              style={{ backgroundColor: slots.highlight }}
            />
            <ProfessionalRole {...shared} title={title} company={company} />
          </View>
          {tagline ? (
            <View className={compact ? 'mt-2' : 'mt-4'}>
              <ProfessionalTagline {...shared} tagline={tagline} />
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  // Pocket Pass (compact): dense horizontal layout
  if (section.templateId === 'compact') {
    return (
      <View
        className={`flex-row items-center justify-between overflow-hidden px-4 py-3 ${boxed ? 'mb-5 rounded-[24px] border shadow-sm' : ''}`}
        style={{ backgroundColor: slots.surface, borderColor: slots.highlight }}
      >
        <View className="min-w-0 flex-1">
          <Text numberOfLines={1} className="font-extrabold text-sm" style={{ color: slots.textPrimary }}>
            {professionalName}
          </Text>
          <Text numberOfLines={1} className="font-semibold text-xs mt-0.5" style={{ color: slots.accent }}>
            {title} · {company}
          </Text>
        </View>
      </View>
    );
  }

  // Magazine Monograph (editorial): serif hierarchy with hairline rules
  if (section.templateId === 'editorial') {
    return (
      <View
        className={`overflow-hidden p-5 ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`}
        style={{ backgroundColor: slots.surface, borderColor: slots.highlight }}
      >
        <ProfessionalName {...shared} name={professionalName} accreditations={accreditations} />
        <View className="my-3 h-px w-full" style={{ backgroundColor: slots.accent }} />
        <ProfessionalRole {...shared} title={title} company={company} />
        {tagline ? (
          <View className="mt-3 border-t pt-2" style={{ borderTopColor: slots.highlight }}>
            <ProfessionalTagline {...shared} tagline={tagline} />
          </View>
        ) : null}
      </View>
    );
  }

  // Avatar & Focus (spotlight): centered role with highlight pill
  if (section.templateId === 'spotlight') {
    return (
      <View
        className={`items-center justify-center overflow-hidden p-5 ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`}
        style={{ backgroundColor: slots.surface, borderColor: slots.highlight }}
      >
        <ProfessionalName {...shared} align="center" name={professionalName} accreditations={accreditations} />
        <View className="my-3 rounded-full px-4 py-1.5" style={{ backgroundColor: `${slots.accent}18`, borderWidth: 1, borderColor: slots.accent }}>
          <Text className="text-xs font-black" style={{ color: slots.accent }}>{title}</Text>
        </View>
        <Text className="text-sm font-bold" style={{ color: slots.textSecondary }}>{company}</Text>
        {tagline ? (
          <View className="mt-3 w-full">
            <ProfessionalTagline {...shared} tagline={tagline} />
          </View>
        ) : null}
      </View>
    );
  }

  // Ribbon Header (banner): company ribbon at top, personal title in card body
  if (section.templateId === 'banner') {
    return (
      <View className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`} style={{ backgroundColor: slots.surface, borderColor: slots.highlight }}>
        <View className="flex-row items-center justify-between px-4 py-2.5" style={{ backgroundColor: slots.accent }}>
          <Text numberOfLines={1} className="text-xs font-black uppercase tracking-wider text-white flex-1 mr-2">{company}</Text>
          {accreditations ? <Text className="text-[10px] font-bold text-white/90">{accreditations}</Text> : null}
        </View>
        <View className="p-4">
          <ProfessionalName {...shared} name={professionalName} />
          <View className="mt-2">
            <Text className="text-sm font-extrabold" style={{ color: slots.accent }}>{title}</Text>
          </View>
          {tagline ? (
            <View className="mt-3 border-t pt-2" style={{ borderTopColor: slots.highlight }}>
              <ProfessionalTagline {...shared} tagline={tagline} />
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  // Modular Bento (cards): dual cardlets for role & company
  if (section.templateId === 'cards') {
    return (
      <View className={`overflow-hidden p-3 gap-2 ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`} style={{ backgroundColor: slots.background }}>
        <View className="rounded-2xl border p-3.5" style={{ backgroundColor: slots.surface, borderColor: slots.highlight }}>
          <ProfessionalName {...shared} name={professionalName} accreditations={accreditations} />
        </View>
        <View className="rounded-2xl border p-3.5" style={{ backgroundColor: slots.surface, borderColor: slots.highlight }}>
          <ProfessionalRole {...shared} title={title} company={company} />
          {tagline ? (
            <View className="mt-2.5 border-t pt-2" style={{ borderTopColor: slots.highlight }}>
              <ProfessionalTagline {...shared} tagline={tagline} />
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  // Conference ID Pass (badge): official credential format
  if (section.templateId === 'badge') {
    return (
      <View
        className={`overflow-hidden p-4 ${boxed ? 'mb-5 rounded-[28px] border shadow-md' : ''}`}
        style={{ backgroundColor: slots.surface, borderColor: slots.accent }}
      >
        <View className="flex-row items-center justify-between border-b pb-2 mb-3" style={{ borderBottomColor: slots.highlight }}>
          <Text className="text-[10px] font-black uppercase tracking-wider" style={{ color: slots.accent }}>CREDENTIAL RECORD</Text>
          <Text className="text-[10px] font-bold" style={{ color: slots.textSecondary }}>{company}</Text>
        </View>
        <ProfessionalName {...shared} name={professionalName} accreditations={accreditations} />
        <View className="mt-3 rounded-xl border p-2.5" style={{ backgroundColor: slots.background, borderColor: slots.highlight }}>
          <Text className="text-xs font-black uppercase" style={{ color: slots.accent }}>ROLE / TITLE</Text>
          <Text className="text-sm font-bold mt-0.5" style={{ color: slots.textPrimary }}>{title}</Text>
        </View>
        {tagline ? (
          <View className="mt-3">
            <ProfessionalTagline {...shared} tagline={tagline} />
          </View>
        ) : null}
      </View>
    );
  }

  // 50/50 Dual Column (split): left column for role/company, right for accreditations/tagline
  if (section.templateId === 'split') {
    return (
      <View className={`flex-row overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`} style={{ backgroundColor: slots.surface, borderColor: slots.highlight }}>
        <View className="w-1/2 p-4 border-r" style={{ borderRightColor: slots.highlight, backgroundColor: slots.background }}>
          <ProfessionalName {...shared} name={professionalName} />
          <View className="mt-2">
            <Text className="text-xs font-extrabold" style={{ color: slots.accent }}>{title}</Text>
          </View>
        </View>
        <View className="w-1/2 p-4 justify-between" style={{ backgroundColor: slots.surface }}>
          <Text className="text-xs font-bold" style={{ color: slots.textSecondary }}>{company}</Text>
          {tagline ? (
            <View className="mt-2">
              <Text numberOfLines={2} className="text-[11px] italic" style={{ color: slots.textPrimary }}>"{tagline}"</Text>
            </View>
          ) : null}
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
        <ProfessionalName {...shared} name={professionalName} accreditations={accreditations} />
        <View className="my-3 h-0.5 w-full" style={{ backgroundColor: slots.accent }} />
        <ProfessionalRole {...shared} title={title} company={company} />
        {tagline ? (
          <View className="mt-3 border-t pt-2" style={{ borderTopColor: slots.accent }}>
            <ProfessionalTagline {...shared} tagline={tagline} />
          </View>
        ) : null}
      </View>
    );
  }

  // Classic layout: business card rows on clean surface
  return (
    <View
      className={`justify-between overflow-hidden p-4 ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`}
      style={{ backgroundColor: slots.surface, borderColor: boxed ? slots.accent : undefined, height: compact ? '100%' : undefined }}
    >
      <View>
        <ProfessionalName {...shared} name={professionalName} accreditations={accreditations} />
        <View
          className={compact ? 'my-2 h-0.5 w-12 rounded-full' : 'my-3 h-0.5 w-16 rounded-full'}
          style={{ backgroundColor: slots.accent }}
        />
        <ProfessionalRole {...shared} title={title} company={company} />
      </View>
      {tagline ? (
        <View className={`border-t ${compact ? 'mt-2 pt-2' : 'mt-5 pt-3'}`} style={{ borderColor: slots.accent }}>
          <ProfessionalTagline {...shared} tagline={tagline} />
        </View>
      ) : null}
    </View>
  );
}
