import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, Building2 } from 'lucide-react-native';
import { Text } from '@/components/uiComponents/Text';
import type { CardDetailSection } from '../cardDetailTemplate';
import type { CardVisualTheme, ResolvedLayoutSlots } from '../../types/card.types';
import { getCardFontFamily, getCardLetterSpacing } from '../cardTheme';
import {
  fitAccreditationsToViewport,
  fitTaglineToViewport,
  getResponsiveSingleLineFontSize,
} from '@/utils/cardTextLayout';
import { resolveLayoutColorSlots } from '@/utils/cardThemeColor';
import { BOXED_SHADOW_LG, BOXED_SHADOW_MD, BOXED_SHADOW_SM } from './SectionSharedComponents';

/** Shared minimum height across all 12 layouts so switching between them
 * (with or without an optional tagline) never visibly jumps in size. */
const PROFESSIONAL_MIN_HEIGHT = 160;
type Props = {
  compact?: boolean;
  cardTheme: CardVisualTheme;
  fullCardView?: boolean;
  gradient: [string, string];
  section: CardDetailSection;
  seamless?: boolean;
  showEmpty?: boolean;
  walletPass?: boolean;
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
  emphasized = false,
  name,
  slots,
}: SharedPieceProps & {
  accreditations?: string;
  align?: 'left' | 'center' | 'right';
  emphasized?: boolean;
  name: string;
}) {
  const displayName = [name, accreditations?.trim()].filter(Boolean).join(', ');
  return (
    <Text
      adjustsFontSizeToFit
      minimumFontScale={0.72}
      numberOfLines={compact ? 2 : 3}
      className={
        emphasized
          ? compact
            ? 'text-xl font-black leading-tight'
            : 'text-3xl font-black leading-tight'
          : compact
            ? 'text-base font-black leading-tight'
            : 'text-2xl font-black leading-tight'
      }
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
  emphasizedCompany = false,
  emphasizedTitle = false,
  companyFontSize,
  slots,
  title,
  titleFontSize,
}: SharedPieceProps & {
  align?: 'left' | 'center' | 'right';
  company: string;
  emphasizedCompany?: boolean;
  emphasizedTitle?: boolean;
  companyFontSize?: number;
  title: string;
  titleFontSize?: number;
}) {
  const alignmentClass = align === 'center' ? 'items-center' : align === 'right' ? 'items-end' : 'items-start';
  return (
    <View className={alignmentClass}>
      <Text
        adjustsFontSizeToFit={!titleFontSize}
        minimumFontScale={0.72}
        numberOfLines={compact ? 1 : 2}
        className={`font-extrabold ${emphasizedTitle ? (compact ? 'text-base' : 'text-lg') : compact ? 'text-xs' : 'text-base'}`}
        style={{
          color: slots.textPrimary,
          fontSize: titleFontSize,
          fontStyle: 'normal',
          fontWeight: titleFontSize ? '600' : undefined,
          lineHeight: titleFontSize ? Math.ceil(titleFontSize * 1.2) : undefined,
          fontFamily: titleFontSize ? undefined : getCardFontFamily(cardTheme.fontStyle),
          letterSpacing: getCardLetterSpacing(cardTheme.fontStyle),
          textAlign: align,
        }}
      >
        {title}
      </Text>
      <View className={`mt-0.5 max-w-full flex-row items-center ${align === 'right' ? 'justify-end' : ''}`}>
        <Building2 color={slots.textSecondary} size={compact ? 11 : 14} />
        <Text
          adjustsFontSizeToFit={!companyFontSize}
          minimumFontScale={0.72}
          numberOfLines={1}
          className={`ml-1.5 font-semibold ${emphasizedCompany ? (compact ? 'text-sm' : 'text-base') : compact ? 'text-[11px]' : 'text-sm'}`}
          style={{
            color: slots.textSecondary,
            fontSize: companyFontSize,
            flexShrink: 1,
            fontStyle: 'normal',
            fontWeight: '700',
            lineHeight: companyFontSize ? Math.ceil(companyFontSize * 1.2) : undefined,
            fontFamily: companyFontSize ? undefined : getCardFontFamily(cardTheme.fontStyle),
            letterSpacing: getCardLetterSpacing(cardTheme.fontStyle),
            textAlign: align,
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
  contrastOnGradient = false,
  emphasized = false,
  fontSize,
  numberOfLines,
  slots,
  tagline,
  centered = false,
}: SharedPieceProps & {
  tagline: string;
  centered?: boolean;
  contrastOnGradient?: boolean;
  emphasized?: boolean;
  fontSize?: number;
  numberOfLines?: number;
}) {
  if (!tagline) return null;
  const textSizeClass = emphasized
    ? compact
      ? 'text-lg leading-6'
      : 'text-xl leading-7'
    : compact
      ? 'text-base leading-6'
      : 'text-lg leading-7';
  const lineLimit = numberOfLines ?? (emphasized && compact ? 3 : compact ? 4 : 5);

  return (
    <View className={centered ? 'w-full items-center' : 'w-full'}>
      <Text
        numberOfLines={lineLimit}
        className={`font-bold italic ${textSizeClass} ${centered ? 'text-center' : ''}`}
        style={{
          color: slots.textPrimary,
          fontSize,
          lineHeight: fontSize ? Math.ceil(fontSize * 1.18) : undefined,
          fontFamily: getCardFontFamily(cardTheme.fontStyle),
          letterSpacing: getCardLetterSpacing(cardTheme.fontStyle),
          textAlign: centered ? 'center' : 'left',
          ...(contrastOnGradient
            ? {
                textShadowColor: 'rgba(0, 0, 0, 0.35)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }
            : {}),
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
  fullCardView = false,
  gradient,
  section,
  seamless = false,
  showEmpty = false,
  walletPass = false,
}: Props) {
  const { width: viewportWidth } = useWindowDimensions();
  const boxed = compact && !seamless;
  const getVal = (id: string) => section.fields.find((item) => item.id === id)?.value?.trim() || '';
  const tagline = fitTaglineToViewport(getVal('tagline'), viewportWidth);
  const singleLineTaglineFontSize = getResponsiveSingleLineFontSize(
    viewportWidth - (compact ? 32 : 48),
    tagline.length,
    16,
    26,
    0.5,
  );
  /** Wallet pass = section 2 core fields only (no tagline / bio-style quote). */
  const showTagline = !walletPass && Boolean(tagline);
  const accreditations = fitAccreditationsToViewport(getVal('accreditations'), viewportWidth);
  const title = getVal('title') || (showEmpty ? 'Job Title' : 'Professional Title');
  const company = getVal('company') || (showEmpty ? 'Company Name' : 'Company / Organization');
  const prefix = getVal('prefix');
  const suffix = getVal('suffix');
  const coreName = [getVal('firstName'), getVal('middleName'), getVal('lastName')].filter(Boolean).join(' ');
  const fullNameParts = [prefix, coreName, suffix].filter(Boolean);
  const professionalName = fullNameParts.length > 0 ? fullNameParts.join(' ') : showEmpty ? 'Professional Name' : title;
  const corporateNameText = coreName || (showEmpty ? 'Professional Name' : professionalName);
  const corporateLeftWidth = viewportWidth * 0.64 - (compact ? 24 : 32);
  const corporateRightWidth = viewportWidth * 0.36 - (compact ? 24 : 32);
  const corporateNameFontSize = getResponsiveSingleLineFontSize(
    corporateLeftWidth,
    corporateNameText.length,
    20,
    34,
    0.48,
  );
  const corporateTitleFontSize = getResponsiveSingleLineFontSize(corporateRightWidth, title.length, 16, 28, 0.68);
  const corporateCompanyFontSize = getResponsiveSingleLineFontSize(
    corporateRightWidth - 18,
    company.length,
    14,
    24,
    0.68,
  );
  const slots = resolveLayoutColorSlots({ templateId: section.templateId, theme: cardTheme });
  const shared = { cardTheme, compact, slots };
  const homePreview = compact && seamless && !fullCardView;
  const sectionBoundsStyle = compact
    ? ({
        flexShrink: 1,
        height: '100%',
        maxHeight: '100%',
        minHeight: 0,
        overflow: 'hidden',
        width: '100%',
      } as const)
    : ({ minHeight: PROFESSIONAL_MIN_HEIGHT } as const);
  const homeFillStyle = homePreview
    ? ({ ...sectionBoundsStyle, flex: 1 } as const)
    : compact
      ? sectionBoundsStyle
      : undefined;
  const homeCenterStyle = homePreview ? ({ justifyContent: 'center', alignItems: 'center' } as const) : undefined;

  const activeGridLayouts = ['classic', 'bold', 'spotlight', 'banner', 'badge', 'split', 'neon'];
  if (activeGridLayouts.includes(section.templateId)) {
    const isCorporate = section.templateId === 'classic';
    const isHero = section.templateId === 'bold';
    const isBanner = section.templateId === 'banner';
    const isBadge = section.templateId === 'badge';
    const isSplit = section.templateId === 'split';
    const isNeon = section.templateId === 'neon';
    const isSpotlight = section.templateId === 'spotlight';
    const gridBackground = slots.surface;
    const gridSlots = isCorporate
      ? { ...slots, surface: gridBackground }
      : isHero
        ? { ...slots, textPrimary: slots.gradientText, textSecondary: slots.isDark ? '#e2e8f0' : '#334155' }
        : slots;
    const topSlots = isBanner ? { ...gridSlots, textPrimary: '#ffffff', textSecondary: '#f8fafc' } : gridSlots;
    const dividerColor =
      isHero || isBanner ? 'rgba(255,255,255,0.28)' : isSpotlight ? 'transparent' : `${slots.accent}30`;
    const leftCellBackground = isSplit ? slots.background : 'transparent';
    const topCellBackground = isBanner
      ? slots.accent
      : section.templateId === 'spotlight'
        ? `${slots.accent}0D`
        : 'transparent';
    const rootStyle = {
      backgroundColor: gridBackground,
      borderColor: isNeon || isBadge ? slots.accent : boxed ? slots.accent : undefined,
      borderWidth: isNeon ? 2 : isBadge ? 1 : undefined,
      ...sectionBoundsStyle,
    };
    if (isCorporate) {
      return (
        <View
          className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
          style={[rootStyle, boxed ? BOXED_SHADOW_SM : null]}
        >
          <View className="flex-row" style={{ flex: 1 }}>
            <View className={`${compact ? 'p-3' : 'p-4'} w-[64%] justify-start`}>
              {prefix ? (
                <Text
                  numberOfLines={1}
                  className="mb-0.5 text-xs font-bold uppercase tracking-wider"
                  style={{ color: gridSlots.textSecondary }}
                >
                  {prefix}
                </Text>
              ) : null}
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.55}
                numberOfLines={1}
                className="font-black leading-tight"
                style={{
                  color: gridSlots.textPrimary,
                  fontSize: corporateNameFontSize,
                  lineHeight: Math.ceil(corporateNameFontSize * 1.1),
                  fontFamily: getCardFontFamily(cardTheme.fontStyle),
                  letterSpacing: getCardLetterSpacing(cardTheme.fontStyle),
                }}
              >
                {corporateNameText}
              </Text>
              {suffix || accreditations ? (
                <Text
                  adjustsFontSizeToFit
                  minimumFontScale={0.65}
                  numberOfLines={1}
                  className={compact ? 'mt-1 text-sm font-bold' : 'mt-1.5 text-base font-bold'}
                  style={{
                    color: slots.accent,
                    fontFamily: getCardFontFamily(cardTheme.fontStyle),
                    letterSpacing: getCardLetterSpacing(cardTheme.fontStyle),
                  }}
                >
                  {[suffix, accreditations].filter(Boolean).join(', ')}
                </Text>
              ) : null}
            </View>
            <View className={`${compact ? 'p-3' : 'p-4'} flex-1 items-end justify-start`}>
              <ProfessionalRole
                {...shared}
                align="right"
                emphasizedCompany
                emphasizedTitle
                companyFontSize={corporateCompanyFontSize}
                slots={gridSlots}
                title={title}
                titleFontSize={corporateTitleFontSize}
                company={company}
              />
            </View>
          </View>
          <View className={`${compact ? 'px-3 py-2.5' : 'p-4'} justify-center`} style={{ flex: 1 }}>
            {showTagline ? (
              <ProfessionalTagline
                {...shared}
                emphasized
                fontSize={singleLineTaglineFontSize}
                numberOfLines={1}
                slots={gridSlots}
                tagline={tagline}
              />
            ) : showEmpty ? (
              <Text className="text-xs font-semibold italic" style={{ color: gridSlots.textSecondary }}>
                Professional tagline
              </Text>
            ) : null}
          </View>
        </View>
      );
    }

    if (isHero) {
      const rawName = coreName || (showEmpty ? 'Professional Name' : professionalName);
      const formattedName = rawName
        .split(' ')
        .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : ''))
        .join(' ');
      const displayName = [formattedName, suffix].filter(Boolean).join(', ');

      return (
        <View
          className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
          style={[
            rootStyle,
            { backgroundColor: '#ffffff', borderColor: boxed ? slots.accent : '#e2e8f0' },
            boxed ? BOXED_SHADOW_SM : null,
          ]}
        >
          <View
            className={`flex-1 justify-between ${compact ? 'px-4 py-3' : 'px-6 py-4'}`}
            style={{ width: '100%', height: '100%' }}
          >
            {/* ZONE 1: Header Row (Company Affiliation + Accreditations Badge) */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 mr-3">
                <Building2 color={slots.accent} size={compact ? 16 : 18} />
                <Text
                  adjustsFontSizeToFit
                  minimumFontScale={0.75}
                  numberOfLines={1}
                  className={`ml-2 font-bold ${compact ? 'text-sm' : 'text-base'} text-slate-900`}
                  style={{
                    fontFamily: getCardFontFamily(cardTheme.fontStyle),
                    letterSpacing: getCardLetterSpacing(cardTheme.fontStyle),
                  }}
                >
                  {company}
                </Text>
              </View>

              {accreditations ? (
                <View
                  className="flex-row items-center rounded-full px-2.5 py-1"
                  style={{
                    backgroundColor: `${slots.accent}14`,
                    borderColor: `${slots.accent}30`,
                    borderWidth: 1,
                  }}
                >
                  <Award color={slots.accent} size={12} />
                  <Text
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                    numberOfLines={1}
                    className="ml-1 text-[11px] font-black uppercase tracking-wider"
                    style={{
                      color: slots.accent,
                      fontFamily: getCardFontFamily(cardTheme.fontStyle),
                      letterSpacing: getCardLetterSpacing(cardTheme.fontStyle),
                    }}
                  >
                    {accreditations}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* ZONE 2: Hero Identity & Job Title */}
            <View className="w-full items-center justify-center my-auto">
              {prefix ? (
                <Text
                  numberOfLines={1}
                  className="mb-0.5 text-xs font-bold uppercase tracking-widest text-center text-slate-400"
                  style={{
                    fontFamily: getCardFontFamily(cardTheme.fontStyle),
                    letterSpacing: getCardLetterSpacing(cardTheme.fontStyle),
                    textAlign: 'center',
                  }}
                >
                  {prefix}
                </Text>
              ) : null}

              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.68}
                numberOfLines={1}
                className="w-full font-black text-center"
                style={{
                  color: slots.accent,
                  fontFamily: getCardFontFamily(cardTheme.fontStyle),
                  fontSize: compact ? 34 : 42,
                  lineHeight: compact ? 38 : 48,
                  letterSpacing: getCardLetterSpacing(cardTheme.fontStyle),
                  textAlign: 'center',
                }}
              >
                {displayName}
              </Text>

              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.75}
                numberOfLines={1}
                className={`mt-1 font-extrabold uppercase tracking-widest text-center text-slate-800 ${compact ? 'text-xs' : 'text-sm'}`}
                style={{
                  fontFamily: getCardFontFamily(cardTheme.fontStyle),
                  letterSpacing: 2,
                  textAlign: 'center',
                }}
              >
                {title}
              </Text>
            </View>

            {/* ZONE 3: Mission Statement / Tagline Footer */}
            {showTagline ? (
              <View className="w-full border-t border-slate-100 pt-1.5 items-center justify-center">
                <Text
                  numberOfLines={2}
                  className={`font-semibold italic text-center ${compact ? 'text-xs leading-5' : 'text-sm leading-5'} text-slate-600`}
                  style={{
                    fontFamily: getCardFontFamily(cardTheme.fontStyle),
                    letterSpacing: getCardLetterSpacing(cardTheme.fontStyle),
                  }}
                >
                  “ {tagline} ”
                </Text>
              </View>
            ) : showEmpty ? (
              <View className="w-full border-t border-slate-100 pt-1.5 items-center justify-center">
                <Text className="text-xs font-semibold italic text-center text-slate-400">
                  “ Professional tagline ”
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      );
    }

    if (isSpotlight) {
      const spotlightRightWidth = viewportWidth * 0.62 - (compact ? 28 : 40);
      const spotlightNameFontSize = getResponsiveSingleLineFontSize(
        spotlightRightWidth,
        professionalName.length,
        18,
        30,
        0.5,
      );
      const spotlightLeftWidth = viewportWidth * 0.38 - (compact ? 24 : 32);
      const spotlightTitleFontSize = getResponsiveSingleLineFontSize(spotlightLeftWidth, title.length, 15, 22, 0.64);
      const spotlightCompanyFontSize = getResponsiveSingleLineFontSize(
        spotlightLeftWidth,
        company.length,
        16,
        24,
        0.58,
      );

      return (
        <View
          className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
          style={[{ ...rootStyle, backgroundColor: slots.surface }, boxed ? BOXED_SHADOW_MD : null]}
        >
          <View className="flex-row" style={{ flex: 1.45 }}>
            <View
              className={`${compact ? 'px-3 py-2' : 'p-4'} w-[38%] items-center justify-center`}
              style={{ backgroundColor: `${slots.accent}12` }}
            >
              <Text
                numberOfLines={1}
                className="text-center font-extrabold"
                style={{
                  color: slots.textPrimary,
                  fontSize: spotlightCompanyFontSize,
                  lineHeight: Math.ceil(spotlightCompanyFontSize * 1.15),
                }}
              >
                {company}
              </Text>
              <View className="my-1.5 h-0.5 w-10 rounded-full" style={{ backgroundColor: slots.accent }} />
              <Text
                numberOfLines={2}
                className="text-center font-semibold"
                style={{
                  color: slots.textSecondary,
                  fontSize: spotlightTitleFontSize,
                  lineHeight: Math.ceil(spotlightTitleFontSize * 1.18),
                }}
              >
                {title}
              </Text>
            </View>

            <View className={`${compact ? 'px-4 py-2.5' : 'p-5'} relative flex-1 justify-center`}>
              {prefix ? (
                <Text
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: slots.textSecondary }}
                >
                  {prefix}
                </Text>
              ) : null}
              <Text
                numberOfLines={1}
                className="font-black"
                style={{
                  color: slots.textPrimary,
                  fontSize: spotlightNameFontSize,
                  lineHeight: Math.ceil(spotlightNameFontSize * 1.14),
                }}
              >
                {coreName || professionalName}
              </Text>
              {suffix || accreditations ? (
                <View className="mt-1 flex-row items-center justify-between">
                  <Text
                    adjustsFontSizeToFit
                    minimumFontScale={0.68}
                    numberOfLines={1}
                    className="mr-2 flex-1 text-xs font-bold"
                    style={{ color: slots.textSecondary }}
                  >
                    {suffix}
                  </Text>
                  <Text
                    adjustsFontSizeToFit
                    minimumFontScale={0.68}
                    numberOfLines={1}
                    className="flex-1 text-right text-xs font-bold"
                    style={{ color: slots.accent }}
                  >
                    {accreditations}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <View
            className={`${compact ? 'px-4 py-2.5' : 'px-5 py-4'} justify-center`}
            style={{ flex: 0.75, backgroundColor: `${slots.accent}0B` }}
          >
            {showTagline ? (
              <ProfessionalTagline
                {...shared}
                emphasized
                fontSize={singleLineTaglineFontSize}
                numberOfLines={1}
                slots={gridSlots}
                tagline={tagline}
              />
            ) : showEmpty ? (
              <Text className="text-sm font-semibold italic" style={{ color: slots.textSecondary }}>
                Professional tagline
              </Text>
            ) : null}
          </View>
        </View>
      );
    }

    if (isBanner) {
      const bannerMainWidth = viewportWidth * 0.66 - (compact ? 24 : 32);
      const bannerTitleWidth = viewportWidth * 0.34 - (compact ? 24 : 32);
      const bannerNameFontSize = getResponsiveSingleLineFontSize(
        bannerMainWidth,
        coreName.length || professionalName.length,
        18,
        30,
        0.5,
      );
      const bannerTitleFontSize = getResponsiveSingleLineFontSize(bannerTitleWidth, title.length, 15, 23, 0.64);
      const bannerTaglineFontSize = getResponsiveSingleLineFontSize(
        viewportWidth - (compact ? 32 : 48),
        tagline.length,
        16,
        26,
        0.5,
      );

      return (
        <View
          className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
          style={[{ ...rootStyle, backgroundColor: slots.surface }, boxed ? BOXED_SHADOW_SM : null]}
        >
          <View
            className={`${compact ? 'px-3' : 'px-4'} flex-row items-center justify-between`}
            style={{ flex: 0.62, backgroundColor: slots.accent }}
          >
            <Text
              adjustsFontSizeToFit
              minimumFontScale={0.72}
              numberOfLines={1}
              className="mr-3 flex-1 text-sm font-black uppercase tracking-wider text-white"
            >
              {company}
            </Text>
            <Text
              adjustsFontSizeToFit
              minimumFontScale={0.68}
              numberOfLines={1}
              className="max-w-[44%] text-right text-xs font-bold text-white"
            >
              {title}
            </Text>
          </View>

          <View className={`${compact ? 'px-3 py-2' : 'px-4 py-3'} flex-row items-center`} style={{ flex: 1.05 }}>
            <View className="w-[72%] justify-center border-r pr-3" style={{ borderRightColor: `${slots.accent}35` }}>
              {prefix ? (
                <Text
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: slots.textSecondary }}
                >
                  {prefix}
                </Text>
              ) : null}
              <Text
                numberOfLines={1}
                className="font-black"
                style={{
                  color: slots.textPrimary,
                  fontSize: bannerNameFontSize,
                  lineHeight: Math.ceil(bannerNameFontSize * 1.13),
                }}
              >
                {coreName || professionalName}
              </Text>
              {suffix ? (
                <Text numberOfLines={1} className="mt-0.5 text-xs font-bold" style={{ color: slots.accent }}>
                  {suffix}
                </Text>
              ) : null}
            </View>
            <View className="flex-1 items-end justify-center pl-3">
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.68}
                numberOfLines={2}
                className="text-right font-bold"
                style={{
                  color: slots.accent,
                  fontSize: Math.max(13, Math.min(19, bannerTitleFontSize)),
                  lineHeight: Math.ceil(Math.max(13, Math.min(19, bannerTitleFontSize)) * 1.16),
                }}
              >
                {accreditations || (showEmpty ? 'Accreditations' : '')}
              </Text>
            </View>
          </View>

          <View
            className={`${compact ? 'px-3 py-2' : 'px-4 py-3'} justify-center border-t`}
            style={{ flex: 0.8, backgroundColor: `${slots.accent}0C`, borderTopColor: `${slots.accent}32` }}
          >
            {showTagline ? (
              <ProfessionalTagline
                {...shared}
                emphasized
                fontSize={bannerTaglineFontSize}
                numberOfLines={1}
                slots={gridSlots}
                tagline={tagline}
              />
            ) : showEmpty ? (
              <Text className="text-sm font-semibold italic" style={{ color: slots.textSecondary }}>
                Professional tagline
              </Text>
            ) : null}
          </View>
        </View>
      );
    }

    if (isBadge) {
      const badgeNameWidth = viewportWidth - (compact ? 72 : 96);
      const badgeRoleWidth = viewportWidth * 0.42 - (compact ? 24 : 32);
      const badgeNameFontSize = getResponsiveSingleLineFontSize(
        badgeNameWidth,
        coreName.length || professionalName.length,
        18,
        29,
        0.5,
      );
      const badgeTitleFontSize = getResponsiveSingleLineFontSize(badgeRoleWidth, title.length, 15, 22, 0.64);
      const badgeCompanyFontSize = getResponsiveSingleLineFontSize(
        viewportWidth * 0.58 - (compact ? 24 : 32),
        company.length,
        17,
        25,
        0.56,
      );
      return (
        <View
          className={`overflow-hidden border ${boxed ? 'mb-5 rounded-[28px]' : ''}`}
          style={[
            { ...rootStyle, backgroundColor: '#ffffff', borderColor: slots.accent, borderWidth: 1.5 },
            boxed ? BOXED_SHADOW_MD : null,
          ]}
        >
          <View className="items-center justify-center" style={{ flex: 0.16 }}>
            <View className="h-1.5 w-12 rounded-full" style={{ backgroundColor: `${slots.accent}55` }} />
          </View>

          <View className={`${compact ? 'px-3' : 'px-4'} flex-row items-start justify-between`} style={{ flex: 0.3 }}>
            <Text
              numberOfLines={1}
              className="mr-3 flex-1 font-semibold"
              style={{
                color: '#334155',
                fontSize: badgeTitleFontSize,
                lineHeight: Math.ceil(badgeTitleFontSize * 1.16),
              }}
            >
              {title}
            </Text>
            <Text
              numberOfLines={1}
              className="max-w-[58%] text-right font-black"
              style={{
                color: '#0f172a',
                fontSize: badgeCompanyFontSize,
                lineHeight: Math.ceil(badgeCompanyFontSize * 1.15),
              }}
            >
              {company}
            </Text>
          </View>

          <View
            className={`${compact ? 'px-4' : 'px-5'} items-center justify-center`}
            style={{ flex: 1.66, transform: [{ translateY: compact ? -8 : -12 }] }}
          >
            {prefix ? (
              <Text
                className="text-center text-[9px] font-bold uppercase tracking-widest"
                style={{ color: slots.textSecondary }}
              >
                {prefix}
              </Text>
            ) : null}
            <Text
              numberOfLines={1}
              className="text-center font-black"
              style={{ color: '#0f172a', fontSize: badgeNameFontSize, lineHeight: Math.ceil(badgeNameFontSize * 1.13) }}
            >
              {coreName || professionalName}
            </Text>
            {suffix ? (
              <Text numberOfLines={1} className="text-center text-xs font-bold" style={{ color: slots.accent }}>
                {suffix}
              </Text>
            ) : null}
            {accreditations ? (
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.68}
                numberOfLines={1}
                className="mt-0.5 text-right text-sm font-semibold"
                style={{ color: slots.textSecondary, width: '86%' }}
              >
                {accreditations}
              </Text>
            ) : null}
            {showTagline ? (
              <View className="mt-1 w-full items-center">
                <ProfessionalTagline
                  {...shared}
                  centered
                  emphasized
                  fontSize={singleLineTaglineFontSize}
                  numberOfLines={1}
                  slots={{ ...gridSlots, textPrimary: '#0f172a' }}
                  tagline={tagline}
                />
              </View>
            ) : showEmpty ? (
              <Text className="mt-1.5 text-center text-sm font-semibold italic" style={{ color: '#475569' }}>
                Professional tagline
              </Text>
            ) : null}
          </View>
        </View>
      );
    }

    const gridContent = (
      <>
        <View
          className="flex-1 flex-row border-b"
          style={{ borderBottomColor: dividerColor, backgroundColor: topCellBackground }}
        >
          <View
            className={`${compact ? 'p-3' : 'p-4'} w-1/2 justify-center border-r`}
            style={{
              borderRightColor: dividerColor,
              backgroundColor: isSpotlight ? `${slots.accent}12` : leftCellBackground,
            }}
          >
            {isBadge || isNeon ? (
              <Text className="mb-1 text-[9px] font-black uppercase tracking-widest" style={{ color: slots.accent }}>
                {isBadge ? 'Credential holder' : 'Identity node'}
              </Text>
            ) : null}
            <View
              className="mb-1 h-0.5 w-10 rounded-full"
              style={{ backgroundColor: isBanner ? '#ffffff' : slots.accent }}
            />
            <ProfessionalName {...shared} slots={topSlots} name={professionalName} />
          </View>
          <View
            className={`${compact ? 'p-3' : 'p-4'} w-1/2 items-end justify-center`}
            style={{ backgroundColor: isSplit ? slots.surface : 'transparent' }}
          >
            <View
              className={isSpotlight || isBadge ? 'rounded-full border px-3 py-1.5' : ''}
              style={
                isSpotlight || isBadge ? { borderColor: slots.accent, backgroundColor: `${slots.accent}10` } : undefined
              }
            >
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.7}
                numberOfLines={2}
                className={`${compact ? 'text-xs' : 'text-sm'} font-extrabold`}
                style={{
                  color: isBanner ? '#ffffff' : slots.accent,
                  fontFamily: getCardFontFamily(cardTheme.fontStyle),
                  letterSpacing: getCardLetterSpacing(cardTheme.fontStyle),
                  textAlign: 'right',
                }}
              >
                {accreditations || (showEmpty ? 'Accreditations' : '')}
              </Text>
            </View>
          </View>
        </View>
        <View className="flex-1 flex-row">
          <View
            className={`${compact ? 'p-3' : 'p-4'} w-1/2 justify-center border-r`}
            style={{
              borderRightColor: dividerColor,
              backgroundColor: isSpotlight ? slots.surface : leftCellBackground,
            }}
          >
            {isNeon ? (
              <Text className="mb-1 text-[9px] font-black uppercase tracking-widest" style={{ color: slots.accent }}>
                Role channel
              </Text>
            ) : null}
            <ProfessionalRole {...shared} slots={gridSlots} title={title} company={company} />
          </View>
          <View
            className={`${compact ? 'p-3' : 'p-4'} w-1/2 justify-center`}
            style={{ backgroundColor: isSpotlight ? `${slots.accent}12` : 'transparent' }}
          >
            {isBadge || isNeon ? (
              <Text className="mb-1 text-[9px] font-black uppercase tracking-widest" style={{ color: slots.accent }}>
                {isBadge ? 'Professional statement' : 'Signal statement'}
              </Text>
            ) : null}
            {showTagline ? (
              <ProfessionalTagline {...shared} contrastOnGradient={isHero} slots={gridSlots} tagline={tagline} />
            ) : showEmpty ? (
              <Text className="text-xs font-semibold italic" style={{ color: gridSlots.textSecondary }}>
                Professional tagline
              </Text>
            ) : null}
          </View>
        </View>
      </>
    );

    return (
      <View
        className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[rootStyle, boxed ? (isBadge ? BOXED_SHADOW_MD : BOXED_SHADOW_SM) : null]}
      >
        {gridContent}
      </View>
    );
  }

  // Homepage stacked card: one centered block (avoids empty band under content)
  if (homePreview && (section.templateId === 'classic' || section.templateId === 'minimal')) {
    const previewSlots = {
      ...slots,
      textPrimary: slots.gradientText ?? slots.textPrimary,
      textSecondary: slots.isDark ? '#e2e8f0' : '#475569',
    };
    return (
      <LinearGradient
        colors={gradient}
        style={[
          homeFillStyle,
          homeCenterStyle,
          {
            paddingHorizontal: walletPass ? 10 : 14,
            paddingVertical: walletPass ? 6 : 10,
          },
        ]}
      >
        <View className="w-full items-center">
          <ProfessionalName
            {...shared}
            slots={previewSlots}
            align="center"
            name={professionalName}
            accreditations={accreditations}
          />
          <View
            className={`${walletPass ? 'my-1' : 'my-2'} h-0.5 w-10 rounded-full`}
            style={{ backgroundColor: previewSlots.accent }}
          />
          <ProfessionalRole {...shared} slots={previewSlots} align="center" title={title} company={company} />
          {showTagline ? (
            <View className="mt-3 w-full max-w-[92%] border-t pt-3" style={{ borderColor: `${previewSlots.accent}55` }}>
              <ProfessionalTagline
                {...shared}
                contrastOnGradient
                slots={{ ...previewSlots, textPrimary: '#f8fafc' }}
                tagline={tagline}
                centered
              />
            </View>
          ) : null}
        </View>
      </LinearGradient>
    );
  }

  // Résumé layout (minimal): vertical editorial hierarchy with thick accent left rail
  if (section.templateId === 'minimal') {
    return (
      <View
        className={`justify-between overflow-hidden p-4 ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[
          {
            backgroundColor: slots.background,
            borderColor: boxed ? slots.accent : undefined,
            borderLeftColor: slots.accent,
            borderLeftWidth: 5,
            ...sectionBoundsStyle,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <View>
          <ProfessionalName {...shared} name={professionalName} accreditations={accreditations} />
          <View className={compact ? 'mt-2' : 'mt-4'}>
            <ProfessionalRole {...shared} title={title} company={company} />
          </View>
        </View>
        {showTagline ? (
          <View className={`border-t ${compact ? 'mt-2 pt-3' : 'mt-4 pt-4'}`} style={{ borderColor: slots.accent }}>
            <ProfessionalTagline {...shared} tagline={tagline} />
          </View>
        ) : null}
      </View>
    );
  }

  // Glass layout: layered vertical hierarchy on surface card with highlight border
  if (section.templateId === 'glass') {
    return (
      <View
        className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[
          { backgroundColor: slots.background, borderColor: slots.highlight, ...sectionBoundsStyle },
          boxed ? BOXED_SHADOW_MD : null,
        ]}
      >
        <View
          className={`flex-1 justify-between rounded-2xl border ${compact ? 'p-3.5' : 'p-5'}`}
          style={{ backgroundColor: slots.surface, borderColor: slots.highlight }}
        >
          <View>
            <ProfessionalName {...shared} name={professionalName} accreditations={accreditations} />
            <View className={compact ? 'my-2 h-px' : 'my-4 h-px'} style={{ backgroundColor: slots.highlight }} />
            <ProfessionalRole {...shared} title={title} company={company} />
          </View>
          {showTagline ? (
            <View
              className={`border-t ${compact ? 'mt-3 pt-3' : 'mt-4 pt-4'}`}
              style={{ borderColor: slots.highlight }}
            >
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
        className={`flex-row items-center justify-between overflow-hidden px-4 py-3 ${boxed ? 'mb-5 rounded-[24px] border' : ''}`}
        style={[
          { backgroundColor: slots.surface, borderColor: slots.highlight, ...sectionBoundsStyle },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <View className="min-w-0 flex-1">
          <Text numberOfLines={1} className="font-extrabold text-lg" style={{ color: slots.textPrimary }}>
            {professionalName}
          </Text>
          <Text numberOfLines={1} className="font-semibold text-sm mt-0.5" style={{ color: slots.accent }}>
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
        className={`overflow-hidden p-5 ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[
          { backgroundColor: slots.surface, borderColor: slots.highlight, ...sectionBoundsStyle },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <ProfessionalName {...shared} name={professionalName} accreditations={accreditations} />
        <View className="my-3 h-px w-full" style={{ backgroundColor: slots.accent }} />
        <ProfessionalRole {...shared} title={title} company={company} />
        {showTagline ? (
          <View className={`mt-4 border-t ${compact ? 'pt-3' : 'pt-4'}`} style={{ borderTopColor: slots.highlight }}>
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
        className={`items-center justify-center overflow-hidden p-5 ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[
          { backgroundColor: slots.surface, borderColor: slots.highlight, ...sectionBoundsStyle },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <ProfessionalName {...shared} align="center" name={professionalName} accreditations={accreditations} />
        <View
          className="my-3 rounded-full px-4 py-1.5"
          style={{ backgroundColor: `${slots.accent}18`, borderWidth: 1, borderColor: slots.accent }}
        >
          <Text className="text-xs font-black" style={{ color: slots.accent }}>
            {title}
          </Text>
        </View>
        <Text className="text-sm font-bold" style={{ color: slots.textSecondary }}>
          {company}
        </Text>
        {showTagline ? (
          <View
            className={`mt-4 w-full max-w-[94%] border-t ${compact ? 'pt-3' : 'pt-4'}`}
            style={{ borderColor: `${slots.accent}55` }}
          >
            <ProfessionalTagline {...shared} centered tagline={tagline} />
          </View>
        ) : null}
      </View>
    );
  }

  // Ribbon Header (banner): company ribbon at top, personal title in card body
  if (section.templateId === 'banner') {
    return (
      <View
        className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[
          { backgroundColor: slots.surface, borderColor: slots.highlight, ...sectionBoundsStyle },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <View className="flex-row items-center justify-between px-4 py-2.5" style={{ backgroundColor: slots.accent }}>
          <Text numberOfLines={1} className="text-xs font-black uppercase tracking-wider text-white flex-1 mr-2">
            {company}
          </Text>
          {accreditations ? <Text className="text-[10px] font-bold text-white/90">{accreditations}</Text> : null}
        </View>
        <View className="flex-1 p-4">
          <ProfessionalName {...shared} name={professionalName} />
          <View className="mt-2">
            <Text className="text-sm font-extrabold" style={{ color: slots.accent }}>
              {title}
            </Text>
          </View>
          {showTagline ? (
            <View className={`mt-4 border-t ${compact ? 'pt-3' : 'pt-4'}`} style={{ borderTopColor: slots.highlight }}>
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
      <View
        className={`overflow-hidden p-3 gap-2 ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[{ backgroundColor: slots.background, ...sectionBoundsStyle }, boxed ? BOXED_SHADOW_SM : null]}
      >
        <View
          className="rounded-2xl border p-3.5"
          style={{ backgroundColor: slots.surface, borderColor: slots.highlight }}
        >
          <ProfessionalName {...shared} name={professionalName} accreditations={accreditations} />
        </View>
        <View
          className="rounded-2xl border p-3.5"
          style={{ backgroundColor: slots.surface, borderColor: slots.highlight }}
        >
          <ProfessionalRole {...shared} title={title} company={company} />
          {showTagline ? (
            <View className={`mt-3 border-t ${compact ? 'pt-3' : 'pt-4'}`} style={{ borderTopColor: slots.highlight }}>
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
        className={`overflow-hidden p-4 ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[
          { backgroundColor: slots.surface, borderColor: slots.accent, ...sectionBoundsStyle },
          boxed ? BOXED_SHADOW_MD : null,
        ]}
      >
        <View
          className="flex-row items-center justify-between border-b pb-2 mb-3"
          style={{ borderBottomColor: slots.highlight }}
        >
          <Text className="text-[10px] font-black uppercase tracking-wider" style={{ color: slots.accent }}>
            CREDENTIAL RECORD
          </Text>
          <Text className="text-xs font-bold" style={{ color: slots.textSecondary }}>
            {company}
          </Text>
        </View>
        <ProfessionalName {...shared} name={professionalName} accreditations={accreditations} />
        <View
          className="mt-3 rounded-xl border p-2.5"
          style={{ backgroundColor: slots.background, borderColor: slots.highlight }}
        >
          <Text className="text-xs font-black uppercase" style={{ color: slots.accent }}>
            ROLE / TITLE
          </Text>
          <Text className="text-sm font-bold mt-0.5" style={{ color: slots.textPrimary }}>
            {title}
          </Text>
        </View>
        {showTagline ? (
          <View className={`mt-4 border-t ${compact ? 'pt-3' : 'pt-4'}`} style={{ borderTopColor: slots.highlight }}>
            <ProfessionalTagline {...shared} tagline={tagline} />
          </View>
        ) : null}
      </View>
    );
  }

  // 50/50 Dual Column (split): left column for role/company, right for accreditations/tagline
  if (section.templateId === 'split') {
    return (
      <View
        className={`flex-row overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[
          { backgroundColor: slots.surface, borderColor: slots.highlight, ...sectionBoundsStyle },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <View
          className="w-1/2 p-4 border-r"
          style={{ borderRightColor: slots.highlight, backgroundColor: slots.background }}
        >
          <ProfessionalName {...shared} name={professionalName} />
          <View className="mt-2">
            <Text className="text-sm font-extrabold" style={{ color: slots.accent }}>
              {title}
            </Text>
          </View>
        </View>
        <View className="w-1/2 p-4 justify-between" style={{ backgroundColor: slots.surface }}>
          <Text className="text-sm font-bold" style={{ color: slots.textSecondary }}>
            {company}
          </Text>
          {showTagline ? (
            <View className="mt-3">
              <ProfessionalTagline {...shared} tagline={tagline} centered />
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
        className={`overflow-hidden p-4 ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[
          { backgroundColor: slots.background, borderColor: slots.accent, borderWidth: 2, ...sectionBoundsStyle },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <ProfessionalName {...shared} name={professionalName} accreditations={accreditations} />
        <View className="my-3 h-0.5 w-full" style={{ backgroundColor: slots.accent }} />
        <ProfessionalRole {...shared} title={title} company={company} />
        {showTagline ? (
          <View className={`mt-4 border-t ${compact ? 'pt-3' : 'pt-4'}`} style={{ borderTopColor: slots.accent }}>
            <ProfessionalTagline {...shared} tagline={tagline} />
          </View>
        ) : null}
      </View>
    );
  }

  // Corporate Card: a restrained 2x2 information grid on a clean surface.
  const corporateSlots = {
    ...slots,
    surface: slots.surface,
  };
  return (
    <View
      className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
      style={[
        {
          backgroundColor: slots.surface,
          borderColor: boxed ? slots.accent : undefined,
          ...sectionBoundsStyle,
        },
        boxed ? BOXED_SHADOW_SM : null,
      ]}
    >
      <View className="flex-1 flex-row border-b" style={{ borderBottomColor: `${slots.accent}30` }}>
        <View
          className={`${compact ? 'p-3' : 'p-4'} w-1/2 justify-center border-r`}
          style={{ borderRightColor: `${slots.accent}30` }}
        >
          <View className="mb-1 h-0.5 w-10 rounded-full" style={{ backgroundColor: slots.accent }} />
          <ProfessionalName {...shared} slots={corporateSlots} name={professionalName} />
        </View>
        <View className={`${compact ? 'p-3' : 'p-4'} w-1/2 items-end justify-center`}>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            numberOfLines={2}
            className={`${compact ? 'text-xs' : 'text-sm'} font-extrabold`}
            style={{
              color: slots.accent,
              fontFamily: getCardFontFamily(cardTheme.fontStyle),
              letterSpacing: getCardLetterSpacing(cardTheme.fontStyle),
              textAlign: 'right',
            }}
          >
            {accreditations || (showEmpty ? 'Accreditations' : '')}
          </Text>
        </View>
      </View>
      <View className="flex-1 flex-row">
        <View
          className={`${compact ? 'p-3' : 'p-4'} w-1/2 justify-center border-r`}
          style={{ borderRightColor: `${slots.accent}30` }}
        >
          <ProfessionalRole {...shared} slots={corporateSlots} title={title} company={company} />
        </View>
        <View className={`${compact ? 'p-3' : 'p-4'} w-1/2 justify-center`}>
          {showTagline ? (
            <ProfessionalTagline {...shared} slots={corporateSlots} tagline={tagline} />
          ) : showEmpty ? (
            <Text className="text-xs font-semibold italic" style={{ color: corporateSlots.textSecondary }}>
              Professional tagline
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}
