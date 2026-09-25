import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Building2, Quote } from 'lucide-react-native';
import { Text } from '@/components/uiComponents/Text';
import type { CardDetailSection } from '../cardDetailTemplate';
import type { CardTemplateId, CardVisualTheme } from '../../types/card.types';
import { getCardFontFamily, getCardLetterSpacing } from '../cardTheme';
import { fitAccreditationsToViewport, fitTaglineToViewport } from '@/utils/cardTextLayout';
import { getCardThemeContrastPalette, getGradientContrastPalette } from '@/utils/cardThemeColor';

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
  colors: ProfessionalColorRoles;
  compact: boolean;
};

type ProfessionalColorRoles = {
  background: string;
  company: string;
  decoration: string;
  header: string;
  tagline: string;
  title: string;
};

function resolveProfessionalColorRoles(
  cardTheme: CardVisualTheme,
  templateId: CardTemplateId,
): ProfessionalColorRoles {
  const contrast = templateId === 'bold'
    ? getGradientContrastPalette(cardTheme.gradient)
    : getCardThemeContrastPalette(cardTheme);
  return {
    background: cardTheme.backgroundColor,
    company: contrast.secondary,
    decoration: cardTheme.accentColor,
    header: contrast.primary,
    tagline: contrast.primary,
    title: contrast.primary,
  };
}

function ProfessionalName({
  accreditations,
  align = 'left',
  cardTheme,
  colors,
  compact,
  name,
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
        color: colors.header,
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
  colors,
  company,
  compact,
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
          color: colors.title,
          fontFamily: getCardFontFamily(cardTheme.fontStyle),
          letterSpacing: getCardLetterSpacing(cardTheme.fontStyle),
          textAlign: align,
        }}
      >
        {title}
      </Text>
      <View className="mt-0.5 flex-row items-center">
        <Building2 color={colors.company} size={compact ? 11 : 14} />
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.72}
          numberOfLines={1}
          className={`ml-1.5 font-semibold ${compact ? 'text-[11px]' : 'text-sm'}`}
          style={{
            color: colors.company,
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
  colors,
  compact,
  tagline,
}: SharedPieceProps & { tagline: string }) {
  if (!tagline) return null;
  return (
    <View className="flex-row items-center">
      <View
        className="mr-2 self-stretch rounded-full"
        style={{ backgroundColor: colors.decoration, width: 3 }}
      />
      <Quote color={colors.decoration} size={compact ? 14 : 17} strokeWidth={2.4} />
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.78}
        numberOfLines={1}
        className={`ml-2 flex-1 font-bold italic ${compact ? 'text-[11px]' : 'text-sm'}`}
        style={{
          color: colors.tagline,
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
  const colors = resolveProfessionalColorRoles(cardTheme, section.templateId);
  const shared = { cardTheme, colors, compact };

  // Résumé layout: a vertical editorial hierarchy with a strong left rule.
  if (section.templateId === 'minimal') {
    return (
      <View
        className={`justify-between overflow-hidden p-4 ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`}
        style={{
          backgroundColor: colors.background,
          borderColor: boxed ? colors.decoration : undefined,
          borderLeftColor: colors.decoration,
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
        <View className={`border-t ${compact ? 'mt-2 pt-2' : 'mt-4 pt-3'}`} style={{ borderColor: colors.decoration }}>
          <ProfessionalTagline {...shared} tagline={tagline} />
        </View>
      </View>
    );
  }

  // Bold layout: a centered networking-card statement.
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

  // Glass layout: a layered vertical hierarchy avoids narrow text columns.
  if (section.templateId === 'glass') {
    return (
      <View
        className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border shadow-md' : ''}`}
        style={{ backgroundColor: colors.background, borderColor: colors.decoration, height: compact ? '100%' : undefined }}
      >
        <View className={`flex-1 justify-between ${compact ? 'p-3.5' : 'p-5'}`}>
          <View>
            <ProfessionalName {...shared} name={professionalName} accreditations={accreditations} />
            <View
              className={compact ? 'my-2 h-px' : 'my-4 h-px'}
              style={{ backgroundColor: colors.decoration }}
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

  // Classic layout: full-width business-card rows with a restrained footer.
  return (
    <View
      className={`justify-between overflow-hidden p-4 ${boxed ? 'mb-5 rounded-[28px] border shadow-sm' : ''}`}
      style={{ backgroundColor: colors.background, borderColor: boxed ? colors.decoration : undefined, height: compact ? '100%' : undefined }}
    >
      <View>
        <ProfessionalName {...shared} name={professionalName} accreditations={accreditations} />
        <View
          className={compact ? 'my-2 h-0.5 w-12 rounded-full' : 'my-3 h-0.5 w-16 rounded-full'}
          style={{ backgroundColor: colors.decoration }}
        />
        <ProfessionalRole {...shared} title={title} company={company} />
      </View>
      {tagline ? (
        <View className={`border-t ${compact ? 'mt-2 pt-2' : 'mt-5 pt-3'}`} style={{ borderColor: colors.decoration }}>
          <ProfessionalTagline {...shared} tagline={tagline} />
        </View>
      ) : null}
    </View>
  );
}
