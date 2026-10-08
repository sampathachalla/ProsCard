import React, { useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, Building2 } from 'lucide-react-native';
import { Text } from '@/components/uiComponents/Text';
import type { CardDetailSection } from '../cardDetailTemplate';
import type { CardTemplateId, CardVisualTheme, ResolvedLayoutSlots } from '../../types/card.types';
import { getCardFontFamily, getCardLetterSpacing } from '../cardTheme';
import {
  fitAccreditationsToViewport,
  fitTaglineToViewport,
  getResponsiveSingleLineFontSize,
} from '@/utils/cardTextLayout';
import { resolveLayoutColorSlots } from '@/utils/cardThemeColor';
import { BOXED_SHADOW_LG, BOXED_SHADOW_MD, BOXED_SHADOW_SM } from './SectionSharedComponents';
import { getCardSectionSpacing } from './cardSectionSpacing';

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
  fontSize,
  name,
  numberOfLines,
  slots,
}: SharedPieceProps & {
  accreditations?: string;
  align?: 'left' | 'center' | 'right';
  emphasized?: boolean;
  fontSize?: number;
  name: string;
  numberOfLines?: number;
}) {
  const displayName = [name, accreditations?.trim()].filter(Boolean).join(', ');
  return (
    <Text
      variant="none"
      adjustsFontSizeToFit
      minimumFontScale={0.72}
      numberOfLines={numberOfLines ?? (compact ? 2 : 3)}
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
        fontSize,
        fontFamily: getCardFontFamily(cardTheme.fontStyle),
        letterSpacing: getCardLetterSpacing(cardTheme.fontStyle),
        lineHeight: fontSize ? Math.ceil(fontSize * 1.14) : undefined,
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
        variant="none"
        adjustsFontSizeToFit={!titleFontSize}
        minimumFontScale={0.72}
        numberOfLines={compact ? 1 : 2}
        className={`font-extrabold ${emphasizedTitle ? (compact ? 'text-base' : 'text-lg') : compact ? 'text-sm' : 'text-base'}`}
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
          variant="none"
          adjustsFontSizeToFit={!companyFontSize}
          minimumFontScale={0.72}
          numberOfLines={1}
          className={`ml-1.5 font-semibold ${emphasizedCompany ? (compact ? 'text-sm' : 'text-base') : compact ? 'text-[13px]' : 'text-sm'}`}
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
  lineHeight,
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
  lineHeight?: number;
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
        variant="none"
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        numberOfLines={lineLimit}
        className={`font-bold italic ${textSizeClass} ${centered ? 'text-center' : ''}`}
        style={{
          color: slots.textPrimary,
          fontSize,
          lineHeight: lineHeight ?? (fontSize ? Math.ceil(fontSize * 1.18) : undefined),
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

function ProfessionalTaglineFooter({
  centered = false,
  compact,
  fillGap = false,
  fullCardView,
  horizontalPadding,
  mark,
  shared,
  tagline,
}: {
  centered?: boolean;
  compact: boolean;
  fillGap?: boolean;
  fullCardView: boolean;
  horizontalPadding: number;
  mark: 'quote' | 'diamond' | 'chevron' | 'star';
  shared: SharedPieceProps;
  tagline: string;
}) {
  if (!tagline) return null;
  const accent = shared.slots.accent;
  const fontSize = fillGap ? (compact ? 22 : 26) : compact ? 17 : 18;
  const quoteSize = fillGap ? (compact ? 40 : 48) : compact ? 28 : 34;
  const chevronSize = fillGap ? (compact ? 36 : 44) : compact ? 26 : 32;
  const starSize = compact ? 22 : 26;
  const diamondSize = compact ? 16 : 18;
  const symbol =
    mark === 'quote' ? (
      <Text
        variant="none"
        style={{
          color: accent,
          fontFamily: getCardFontFamily(shared.cardTheme.fontStyle),
          fontSize: quoteSize,
          lineHeight: quoteSize,
          opacity: 0.55,
        }}
      >
        “
      </Text>
    ) : mark === 'diamond' ? (
      <Text variant="none" style={{ color: accent, fontSize: diamondSize, lineHeight: diamondSize + 4, opacity: 0.85 }}>
        ◆
      </Text>
    ) : mark === 'chevron' ? (
      <Text variant="none" style={{ color: accent, fontSize: chevronSize, lineHeight: chevronSize, opacity: 0.55 }}>
        »
      </Text>
    ) : (
      <Text variant="none" style={{ color: accent, fontSize: starSize, lineHeight: starSize + 4, opacity: 0.7 }}>
        ✦
      </Text>
    );

  return (
    <View
      style={{
        alignItems: 'center',
        flex: fillGap ? 1 : undefined,
        flexDirection: 'row',
        justifyContent: centered ? 'center' : 'flex-start',
        marginTop: fillGap ? 0 : 8,
        paddingBottom: fillGap ? 10 : 4,
        paddingLeft: horizontalPadding,
        paddingRight: fullCardView ? 36 : horizontalPadding,
        paddingTop: fillGap ? 8 : 0,
      }}
    >
      <View style={{ marginRight: 8 }}>{symbol}</View>
      <View style={{ flex: centered ? undefined : 1, maxWidth: centered ? '78%' : undefined }}>
        <ProfessionalTagline
          {...shared}
          centered={centered}
          fontSize={fontSize}
          lineHeight={fillGap ? (compact ? 28 : 32) : compact ? 22 : 24}
          numberOfLines={fillGap ? 2 : 1}
          slots={{ ...shared.slots, textPrimary: shared.slots.textSecondary }}
          tagline={tagline}
        />
      </View>
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
  const { height: viewportHeight, width: viewportWidth } = useWindowDimensions();
  const [companyFocusMeasuredHeight, setCompanyFocusMeasuredHeight] = useState(0);
  const spacing = getCardSectionSpacing(viewportWidth);
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
  const slots = resolveLayoutColorSlots({
    templateId: section.templateId,
    theme: cardTheme,
  });
  const shared = { cardTheme, compact, slots };
  const inFixedCardSlot = compact && (fullCardView || seamless);
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
  const responsiveNameFontSize = getResponsiveSingleLineFontSize(
    viewportWidth - (compact ? 40 : 56),
    professionalName.length,
    compact ? 20 : 24,
    compact ? 30 : 36,
    0.52,
  );
  const companyFocusTextWidth = viewportWidth - (compact ? 32 : 48);
  const companyFocusSlotBudget = Math.max(
    52,
    (companyFocusMeasuredHeight || Math.round(viewportHeight * 0.075)) - (compact ? 0 : spacing.tightVertical * 2),
  );
  const fitCompanyFocusSize = (size: number, share: number, lineHeightRatio: number) =>
    compact ? Math.min(size, Math.max(11, Math.floor((companyFocusSlotBudget * share) / lineHeightRatio))) : size;
  const companyFocusNameShare = showTagline ? 0.24 : 0.3;
  const companyFocusAccreditationShare = showTagline ? 0.16 : 0.2;
  const companyFocusTitleShare = showTagline ? 0.18 : 0.22;
  const companyFocusNameFontSize = fitCompanyFocusSize(
    getResponsiveSingleLineFontSize(
      companyFocusTextWidth,
      professionalName.length,
      compact ? 18 : 28,
      compact ? 23 : 38,
      0.5,
    ),
    companyFocusNameShare,
    1.05,
  );
  const companyFocusAccreditationFontSize = fitCompanyFocusSize(
    getResponsiveSingleLineFontSize(
      companyFocusTextWidth * 0.68,
      Math.max(accreditations.length, 1),
      compact ? 13 : 15,
      compact ? 16 : 20,
      0.55,
    ),
    companyFocusAccreditationShare,
    1.1,
  );
  const companyFocusCompanyFontSize = fitCompanyFocusSize(
    getResponsiveSingleLineFontSize(
      companyFocusTextWidth - (compact ? 28 : 44),
      company.length,
      compact ? 21 : 26,
      compact ? 28 : 40,
      0.56,
    ),
    0.28,
    1.05,
  );
  const companyFocusTitleFontSize = fitCompanyFocusSize(
    getResponsiveSingleLineFontSize(
      companyFocusTextWidth * 0.72,
      title.length,
      compact ? 14 : 18,
      compact ? 17 : 26,
      0.52,
    ),
    companyFocusTitleShare,
    1.1,
  );
  const credentialCompanyFontSize = getResponsiveSingleLineFontSize(
    viewportWidth - (compact ? 68 : 92),
    company.length,
    compact ? 16 : 18,
    compact ? 18 : 22,
    0.58,
  );

  const executiveDisplayFontSize = getResponsiveSingleLineFontSize(
    viewportWidth - (compact ? 40 : 56),
    professionalName.length,
    compact ? 22 : 28,
    compact ? 26 : 34,
    0.48,
  );
  const executiveRoleFontSize = compact ? 17 : 18;

  // Layout 1 — Executive Minimal: restrained hierarchy with one accent and generous whitespace.
  if (section.templateId === 'classic') {
    return (
      <View
        className={`justify-start overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[
          {
            ...sectionBoundsStyle,
            backgroundColor: slots.surface,
            borderColor: slots.highlight,
            paddingBottom: showTagline ? 0 : inFixedCardSlot ? Math.max(spacing.vertical, 12) : spacing.tightVertical,
            paddingHorizontal: 0,
            paddingTop: 0,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <View
          style={{
            paddingHorizontal: spacing.horizontal,
            paddingTop: spacing.tightVertical,
          }}
        >
          <Text
            variant="none"
            adjustsFontSizeToFit
            minimumFontScale={0.72}
            numberOfLines={1}
            className="font-black"
            style={{
              color: slots.textPrimary,
              fontSize: executiveDisplayFontSize,
              fontFamily: getCardFontFamily(cardTheme.fontStyle),
              letterSpacing: getCardLetterSpacing(cardTheme.fontStyle),
              lineHeight: Math.ceil(executiveDisplayFontSize * 1.12),
            }}
          >
            {professionalName}
          </Text>
          <View className="mt-2 flex-row items-center">
            <View className="min-w-0 flex-1">
              <Text
                variant="none"
                adjustsFontSizeToFit
                minimumFontScale={0.75}
                numberOfLines={1}
                className="font-bold"
                style={{
                  color: slots.textPrimary,
                  fontFamily: getCardFontFamily(cardTheme.fontStyle),
                  fontSize: executiveRoleFontSize,
                  lineHeight: Math.ceil(executiveRoleFontSize * 1.2),
                }}
              >
                {title}
              </Text>
              <View className="mt-0.5 flex-row items-center">
                <Building2 color={slots.textSecondary} size={compact ? 14 : 16} />
                <Text
                  variant="none"
                  adjustsFontSizeToFit
                  minimumFontScale={0.75}
                  numberOfLines={1}
                  className="ml-1.5 flex-1 font-semibold"
                  style={{
                    color: slots.textSecondary,
                    fontFamily: getCardFontFamily(cardTheme.fontStyle),
                    fontSize: compact ? 16 : 18,
                    lineHeight: compact ? 20 : 22,
                  }}
                >
                  {company}
                </Text>
              </View>
            </View>
            {accreditations ? (
              <Text
                variant="none"
                adjustsFontSizeToFit
                minimumFontScale={0.7}
                numberOfLines={2}
                className="ml-3 max-w-[34%] text-right text-[11px] font-bold uppercase"
                style={{
                  color: slots.accent,
                  fontFamily: getCardFontFamily(cardTheme.fontStyle),
                  textAlign: 'right',
                }}
              >
                {accreditations}
              </Text>
            ) : null}
          </View>
        </View>
        {showTagline ? (
          <ProfessionalTaglineFooter
            compact={compact}
            fillGap
            fullCardView={fullCardView}
            horizontalPadding={spacing.horizontal}
            mark="quote"
            shared={shared}
            tagline={tagline}
          />
        ) : null}
      </View>
    );
  }

  // Layout 2 — Enterprise Spotlight: a centered credential composition with a bottom detail dock.
  // Fixed card slots (home + full-card edit) use the Enterprise Split grid below instead.
  if (section.templateId === 'spotlight' && !inFixedCardSlot) {
    return (
      <View
        className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[
          {
            ...sectionBoundsStyle,
            backgroundColor: slots.surface,
            borderColor: slots.highlight,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <View
          className={showTagline ? 'justify-start' : 'flex-1 justify-start'}
          style={{
            paddingHorizontal: spacing.horizontal,
            paddingVertical: spacing.tightVertical,
          }}
        >
          <View className="items-center">
            <ProfessionalName
              {...shared}
              align="center"
              emphasized
              fontSize={responsiveNameFontSize}
              name={professionalName}
              numberOfLines={1}
            />
            <View className="mt-0.5 max-w-full flex-row items-center justify-center">
              <Building2 color={slots.textSecondary} size={14} />
              <Text
                variant="none"
                adjustsFontSizeToFit
                minimumFontScale={0.72}
                numberOfLines={1}
                className="ml-2 font-semibold"
                style={{
                  color: slots.textSecondary,
                  fontFamily: getCardFontFamily(cardTheme.fontStyle),
                  fontSize: credentialCompanyFontSize,
                  lineHeight: Math.ceil(credentialCompanyFontSize * 1.2),
                  maxWidth: '88%',
                  textAlign: 'center',
                }}
              >
                {company}
              </Text>
            </View>
          </View>
          <View className="mt-3 flex-row items-center justify-between">
            <View
              className={`${accreditations ? 'max-w-[55%]' : 'max-w-full'} rounded-full border px-3 py-1.5`}
              style={{
                backgroundColor: `${slots.accent}0D`,
                borderColor: `${slots.accent}35`,
              }}
            >
              <Text
                variant="none"
                adjustsFontSizeToFit
                minimumFontScale={0.72}
                numberOfLines={1}
                className="text-sm font-bold"
                style={{
                  color: slots.textSecondary,
                  fontFamily: getCardFontFamily(cardTheme.fontStyle),
                }}
              >
                {title}
              </Text>
            </View>
            {accreditations ? (
              <View
                className="ml-3 max-w-[42%] rounded-full border px-3 py-1.5"
                style={{
                  backgroundColor: `${slots.accent}0D`,
                  borderColor: `${slots.accent}35`,
                }}
              >
                <Text
                  variant="none"
                  adjustsFontSizeToFit
                  minimumFontScale={0.72}
                  numberOfLines={1}
                  className="text-right text-xs font-bold"
                  style={{ color: slots.accent }}
                >
                  {accreditations}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
        {showTagline ? (
          <ProfessionalTaglineFooter
            centered
            compact={compact}
            fullCardView={fullCardView}
            horizontalPadding={spacing.horizontal}
            mark="diamond"
            shared={shared}
            tagline={tagline}
          />
        ) : null}
      </View>
    );
  }

  // Layout 3 — Company Focus: name, then right-aligned credentials; company, then a right-aligned title.
  if (section.templateId === 'banner') {
    const nameLineHeight = Math.ceil(companyFocusNameFontSize * (compact ? 1.05 : 1.12));
    const accreditationLineHeight = Math.ceil(companyFocusAccreditationFontSize * (compact ? 1.1 : 1.15));
    const companyLineHeight = Math.ceil(companyFocusCompanyFontSize * (compact ? 1.05 : 1.12));
    const titleLineHeight = Math.ceil(companyFocusTitleFontSize * (compact ? 1.1 : 1.15));
    return (
      <View
        className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        onLayout={(event) => {
          const nextHeight = Math.round(event.nativeEvent.layout.height);
          setCompanyFocusMeasuredHeight((current) => (current === nextHeight ? current : nextHeight));
        }}
        style={[
          {
            ...sectionBoundsStyle,
            backgroundColor: slots.surface,
            borderColor: slots.highlight,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <View
          className={showTagline ? 'min-h-0 justify-start' : 'min-h-0 flex-1 justify-start'}
          style={{
            paddingHorizontal: spacing.horizontal,
            paddingTop: spacing.tightVertical,
          }}
        >
          <Text
            variant="none"
            adjustsFontSizeToFit
            minimumFontScale={0.65}
            numberOfLines={1}
            className="font-bold"
            style={{
              color: slots.textPrimary,
              fontFamily: getCardFontFamily(cardTheme.fontStyle),
              fontSize: companyFocusNameFontSize,
              lineHeight: nameLineHeight,
            }}
          >
            {professionalName}
          </Text>
          {accreditations ? (
            <Text
              variant="none"
              adjustsFontSizeToFit
              minimumFontScale={0.65}
              numberOfLines={1}
              className="self-end text-right font-semibold"
              style={{
                color: slots.accent,
                fontFamily: getCardFontFamily(cardTheme.fontStyle),
                fontSize: companyFocusAccreditationFontSize,
                lineHeight: accreditationLineHeight,
                maxWidth: '68%',
                textAlign: 'right',
              }}
            >
              {accreditations}
            </Text>
          ) : null}
          <View
            className="min-w-0 flex-row items-center"
            style={{ marginTop: compact ? 0 : spacing.gap }}
          >
            <View
              className={`${compact ? 'mr-1.5 size-4' : 'mr-3 size-9'} items-center justify-center rounded-md`}
              style={{ backgroundColor: `${slots.accent}14` }}
            >
              <Building2 color={slots.accent} size={compact ? 10 : 18} />
            </View>
            <Text
              variant="none"
              adjustsFontSizeToFit
              minimumFontScale={0.65}
              numberOfLines={1}
              className="min-w-0 flex-1 font-black"
              style={{
                color: slots.textPrimary,
                fontFamily: getCardFontFamily(cardTheme.fontStyle),
                fontSize: companyFocusCompanyFontSize,
                lineHeight: companyLineHeight,
              }}
            >
              {company}
            </Text>
          </View>
          <Text
            variant="none"
            adjustsFontSizeToFit
            minimumFontScale={0.65}
            numberOfLines={compact ? 1 : 2}
            className="self-end text-right font-bold"
            style={{
              color: slots.textSecondary,
              fontFamily: getCardFontFamily(cardTheme.fontStyle),
              fontSize: companyFocusTitleFontSize,
              lineHeight: titleLineHeight,
              maxWidth: '72%',
              textAlign: 'right',
            }}
          >
            {title}
          </Text>
        </View>
        {showTagline ? (
          <ProfessionalTaglineFooter
            compact={compact}
            fillGap
            fullCardView={fullCardView}
            horizontalPadding={spacing.horizontal}
            mark="chevron"
            shared={shared}
            tagline={tagline}
          />
        ) : null}
      </View>
    );
  }

  // Layout 4 — Credential Rail: accreditation panel beside an enterprise identity stack.
  if (section.templateId === 'badge') {
    return (
      <View
        className={`overflow-hidden border ${boxed ? 'mb-5 rounded-[28px]' : ''}`}
        style={[
          {
            ...sectionBoundsStyle,
            backgroundColor: slots.surface,
            borderColor: slots.highlight,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <View className="min-h-0 flex-1 flex-row">
          <View
            className="w-[30%] items-center justify-center border-r"
            style={{
              backgroundColor: `${slots.accent}0D`,
              borderRightColor: `${slots.accent}35`,
              paddingHorizontal: spacing.gap,
              paddingVertical: spacing.tightVertical,
            }}
          >
            <View
              className={`${compact ? 'size-8' : 'size-10'} items-center justify-center rounded-full`}
              style={{ backgroundColor: `${slots.accent}18` }}
            >
              <Award color={slots.accent} size={compact ? 22 : 26} />
            </View>
            <Text
              variant="none"
              adjustsFontSizeToFit
              minimumFontScale={0.72}
              numberOfLines={2}
              className="mt-1.5 text-center text-xs font-bold uppercase"
              style={{
                color: slots.accent,
                fontFamily: getCardFontFamily(cardTheme.fontStyle),
              }}
            >
              {accreditations || 'Credentials'}
            </Text>
          </View>
          <View
            className="flex-1 justify-center"
            style={{
              paddingHorizontal: spacing.horizontal,
              paddingVertical: spacing.tightVertical,
            }}
          >
            <ProfessionalName
              {...shared}
              emphasized
              fontSize={getResponsiveSingleLineFontSize(
                viewportWidth * 0.7 - (compact ? 32 : 48),
                professionalName.length,
                compact ? 22 : 26,
                compact ? 26 : 32,
                0.48,
              )}
              name={professionalName}
              numberOfLines={1}
            />
            <View className="mt-1 flex-row items-center">
              <Building2 color={slots.textSecondary} size={14} />
              <Text
                variant="none"
                adjustsFontSizeToFit
                minimumFontScale={0.72}
                numberOfLines={1}
                className="ml-2 flex-1 font-semibold"
                style={{
                  color: slots.textSecondary,
                  fontFamily: getCardFontFamily(cardTheme.fontStyle),
                  fontSize: credentialCompanyFontSize,
                  lineHeight: Math.ceil(credentialCompanyFontSize * 1.2),
                }}
              >
                {company}
              </Text>
            </View>
            <View
              className="mt-2 self-start rounded-full border px-3 py-1.5"
              style={{
                backgroundColor: `${slots.accent}0D`,
                borderColor: `${slots.accent}35`,
              }}
            >
              <Text
                variant="none"
                adjustsFontSizeToFit
                minimumFontScale={0.72}
                numberOfLines={1}
                className="font-bold"
                style={{
                  color: slots.textSecondary,
                  fontFamily: getCardFontFamily(cardTheme.fontStyle),
                  fontSize: compact ? 16 : 18,
                }}
              >
                {title}
              </Text>
            </View>
            {showTagline ? (
              <ProfessionalTaglineFooter
                compact={compact}
                fullCardView={fullCardView}
                horizontalPadding={0}
                mark="star"
                shared={shared}
                tagline={tagline}
              />
            ) : null}
          </View>
        </View>
      </View>
    );
  }

  const remainingTemplateId = section.templateId as CardTemplateId;
  const activeGridLayouts = ['classic', 'bold', 'spotlight', 'banner', 'badge', 'split', 'neon'];
  if (activeGridLayouts.includes(remainingTemplateId)) {
    const isCorporate = remainingTemplateId === 'classic';
    const isHero = remainingTemplateId === 'bold';
    const isBanner = remainingTemplateId === 'banner';
    const isBadge = remainingTemplateId === 'badge';
    const isSplit = remainingTemplateId === 'split';
    const isNeon = remainingTemplateId === 'neon';
    const isSpotlight = remainingTemplateId === 'spotlight';
    const gridBackground = slots.surface;
    const gridSlots = isCorporate
      ? { ...slots, surface: gridBackground }
      : isHero
        ? {
            ...slots,
            textPrimary: slots.gradientText,
            textSecondary: slots.isDark ? '#e2e8f0' : '#334155',
          }
        : slots;
    const topSlots = isBanner ? { ...gridSlots, textPrimary: '#ffffff', textSecondary: '#f8fafc' } : gridSlots;
    const dividerColor =
      isHero || isBanner ? 'rgba(255,255,255,0.28)' : isSpotlight ? 'transparent' : `${slots.accent}30`;
    const leftCellBackground = isSplit ? slots.background : 'transparent';
    const topCellBackground = isBanner
      ? slots.accent
      : remainingTemplateId === 'spotlight'
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
                  variant="none"
                  numberOfLines={1}
                  className="mb-0.5 text-xs font-bold uppercase"
                  style={{ color: gridSlots.textSecondary }}
                >
                  {prefix}
                </Text>
              ) : null}
              <Text
                variant="none"
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
                  variant="none"
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
              <Text variant="none" className="text-xs font-semibold italic" style={{ color: gridSlots.textSecondary }}>
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
            {
              backgroundColor: '#ffffff',
              borderColor: boxed ? slots.accent : '#e2e8f0',
            },
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
                  variant="none"
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
                    variant="none"
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                    numberOfLines={1}
                    className="ml-1 text-[11px] font-black uppercase"
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
                  variant="none"
                  numberOfLines={1}
                  className="mb-0.5 text-xs font-bold uppercase text-center text-slate-400"
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
                variant="none"
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
                variant="none"
                adjustsFontSizeToFit
                minimumFontScale={0.75}
                numberOfLines={1}
                className={`mt-1 font-extrabold uppercase text-center text-slate-800 ${compact ? 'text-xs' : 'text-sm'}`}
                style={{
                  fontFamily: getCardFontFamily(cardTheme.fontStyle),
                  letterSpacing: getCardLetterSpacing(cardTheme.fontStyle),
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
                  variant="none"
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
                <Text variant="none" className="text-xs font-semibold italic text-center text-slate-400">
                  “ Professional tagline ”
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      );
    }

    if (isSpotlight) {
      const spotlightName = [prefix, coreName, suffix].filter(Boolean).join(' ') || professionalName;
      const bandPadding = spacing.tightVertical + 2;
      const spotlightRightWidth = viewportWidth * 0.58 - spacing.horizontal * 2;
      const spotlightNameFontSize = getResponsiveSingleLineFontSize(
        spotlightRightWidth,
        spotlightName.length,
        compact ? 22 : 26,
        compact ? 26 : 32,
        0.48,
      );
      const spotlightLeftWidth = viewportWidth * 0.34 - spacing.gap * 2;
      const spotlightTitleFontSize = getResponsiveSingleLineFontSize(
        spotlightLeftWidth,
        title.length,
        compact ? 16 : 18,
        compact ? 18 : 22,
        0.55,
      );
      const spotlightCompanyFontSize = getResponsiveSingleLineFontSize(
        spotlightLeftWidth,
        company.length,
        compact ? 18 : 20,
        compact ? 22 : 26,
        0.5,
      );

      return (
        <View
          className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
          style={[{ ...rootStyle, backgroundColor: slots.surface }, boxed ? BOXED_SHADOW_MD : null]}
        >
          <View style={{ alignItems: 'stretch', flex: 1, flexDirection: 'row', minHeight: 0 }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: `${slots.accent}12`,
                justifyContent: 'center',
                paddingHorizontal: spacing.gap,
                paddingVertical: bandPadding,
                width: '38%',
              }}
            >
              <Text
                variant="none"
                adjustsFontSizeToFit
                maxFontSizeMultiplier={1}
                minimumFontScale={0.72}
                numberOfLines={1}
                className="text-center font-extrabold"
                style={{
                  color: slots.textPrimary,
                  fontFamily: getCardFontFamily(cardTheme.fontStyle),
                  fontSize: spotlightCompanyFontSize,
                  lineHeight: Math.ceil(spotlightCompanyFontSize * 1.1),
                }}
              >
                {company}
              </Text>
              <View
                style={{
                  backgroundColor: slots.accent,
                  borderRadius: 999,
                  height: 2,
                  marginVertical: 4,
                  width: 28,
                }}
              />
              <Text
                variant="none"
                adjustsFontSizeToFit
                maxFontSizeMultiplier={1}
                minimumFontScale={0.72}
                numberOfLines={2}
                className="text-center font-semibold"
                style={{
                  color: slots.textSecondary,
                  fontFamily: getCardFontFamily(cardTheme.fontStyle),
                  fontSize: spotlightTitleFontSize,
                  lineHeight: Math.ceil(spotlightTitleFontSize * 1.15),
                  textAlign: 'center',
                }}
              >
                {title}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                minWidth: 0,
                paddingHorizontal: spacing.horizontal,
                paddingVertical: bandPadding,
              }}
            >
              <Text
                variant="none"
                adjustsFontSizeToFit
                maxFontSizeMultiplier={1}
                minimumFontScale={0.62}
                numberOfLines={1}
                className="font-black"
                style={{
                  color: slots.textPrimary,
                  fontFamily: getCardFontFamily(cardTheme.fontStyle),
                  fontSize: spotlightNameFontSize,
                  letterSpacing: getCardLetterSpacing(cardTheme.fontStyle),
                  lineHeight: Math.ceil(spotlightNameFontSize * 1.1),
                }}
              >
                {spotlightName}
              </Text>
              {accreditations ? (
                <Text
                  variant="none"
                  adjustsFontSizeToFit
                  maxFontSizeMultiplier={1}
                  minimumFontScale={0.7}
                  numberOfLines={1}
                  className="text-right text-[11px] font-bold"
                  style={{
                    color: slots.accent,
                    fontFamily: getCardFontFamily(cardTheme.fontStyle),
                    marginTop: 4,
                    textAlign: 'right',
                  }}
                >
                  {accreditations}
                </Text>
              ) : null}
            </View>
          </View>

          {showTagline || showEmpty ? (
            <ProfessionalTaglineFooter
              compact={compact}
              fullCardView={fullCardView}
              horizontalPadding={spacing.horizontal}
              mark="diamond"
              shared={shared}
              tagline={showTagline ? tagline : 'Professional tagline'}
            />
          ) : null}
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
              variant="none"
              adjustsFontSizeToFit
              minimumFontScale={0.72}
              numberOfLines={1}
              className="mr-3 flex-1 text-sm font-black uppercase text-white"
            >
              {company}
            </Text>
            <Text
              variant="none"
              adjustsFontSizeToFit
              minimumFontScale={0.68}
              numberOfLines={1}
              className="max-w-[44%] text-right text-sm font-bold text-white"
            >
              {title}
            </Text>
          </View>

          <View className={`${compact ? 'px-3 py-2' : 'px-4 py-3'} flex-row items-center`} style={{ flex: 1.05 }}>
            <View className="w-[72%] justify-center border-r pr-3" style={{ borderRightColor: `${slots.accent}35` }}>
              {prefix ? (
                <Text
                  variant="none"
                  className="text-[11px] font-bold uppercase"
                  style={{ color: slots.textSecondary }}
                >
                  {prefix}
                </Text>
              ) : null}
              <Text
                variant="none"
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
                <Text variant="none" numberOfLines={1} className="mt-0.5 text-xs font-bold" style={{ color: slots.accent }}>
                  {suffix}
                </Text>
              ) : null}
            </View>
            <View className="flex-1 items-end justify-center pl-3">
              <Text
                variant="none"
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
            style={{
              flex: 0.8,
              backgroundColor: `${slots.accent}0C`,
              borderTopColor: `${slots.accent}32`,
            }}
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
              <Text variant="none" className="text-sm font-semibold italic" style={{ color: slots.textSecondary }}>
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
            {
              ...rootStyle,
              backgroundColor: '#ffffff',
              borderColor: slots.accent,
              borderWidth: 1.5,
            },
            boxed ? BOXED_SHADOW_MD : null,
          ]}
        >
          <View className="items-center justify-center" style={{ flex: 0.16 }}>
            <View className="h-1.5 w-12 rounded-full" style={{ backgroundColor: `${slots.accent}55` }} />
          </View>

          <View className={`${compact ? 'px-3' : 'px-4'} flex-row items-start justify-between`} style={{ flex: 0.3 }}>
            <Text
              variant="none"
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
              variant="none"
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
            style={{
              flex: 1.66,
              transform: [{ translateY: compact ? -8 : -12 }],
            }}
          >
            {prefix ? (
              <Text
                variant="none"
                className="text-center text-[11px] font-bold uppercase"
                style={{ color: slots.textSecondary }}
              >
                {prefix}
              </Text>
            ) : null}
            <Text
              variant="none"
              numberOfLines={1}
              className="text-center font-black"
              style={{
                color: '#0f172a',
                fontSize: badgeNameFontSize,
                lineHeight: Math.ceil(badgeNameFontSize * 1.13),
              }}
            >
              {coreName || professionalName}
            </Text>
            {suffix ? (
              <Text variant="none" numberOfLines={1} className="text-center text-xs font-bold" style={{ color: slots.accent }}>
                {suffix}
              </Text>
            ) : null}
            {accreditations ? (
              <Text
                variant="none"
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
              <Text variant="none" className="mt-1.5 text-center text-sm font-semibold italic" style={{ color: '#475569' }}>
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
          style={{
            borderBottomColor: dividerColor,
            backgroundColor: topCellBackground,
          }}
        >
          <View
            className={`${compact ? 'p-3' : 'p-4'} w-1/2 justify-center border-r`}
            style={{
              borderRightColor: dividerColor,
              backgroundColor: isSpotlight ? `${slots.accent}12` : leftCellBackground,
            }}
          >
            {isBadge || isNeon ? (
              <Text variant="none" className="mb-1 text-[11px] font-black uppercase" style={{ color: slots.accent }}>
                {isBadge ? 'Credential holder' : 'Name'}
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
                isSpotlight || isBadge
                  ? {
                      borderColor: slots.accent,
                      backgroundColor: `${slots.accent}10`,
                    }
                  : undefined
              }
            >
              <Text
                variant="none"
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
              <Text variant="none" className="mb-1 text-[11px] font-black uppercase" style={{ color: slots.accent }}>
                Role
              </Text>
            ) : null}
            <ProfessionalRole {...shared} slots={gridSlots} title={title} company={company} />
          </View>
          <View
            className={`${compact ? 'p-3' : 'p-4'} w-1/2 justify-center`}
            style={{
              backgroundColor: isSpotlight ? `${slots.accent}12` : 'transparent',
            }}
          >
            {isBadge || isNeon ? (
              <Text variant="none" className="mb-1 text-[11px] font-black uppercase" style={{ color: slots.accent }}>
                {isBadge ? 'Professional statement' : 'Statement'}
              </Text>
            ) : null}
            {showTagline ? (
              <ProfessionalTagline {...shared} contrastOnGradient={isHero} slots={gridSlots} tagline={tagline} />
            ) : showEmpty ? (
              <Text variant="none" className="text-xs font-semibold italic" style={{ color: gridSlots.textSecondary }}>
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
  if (homePreview && (remainingTemplateId === 'classic' || remainingTemplateId === 'minimal')) {
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
  if (remainingTemplateId === 'minimal') {
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
  if (remainingTemplateId === 'glass') {
    return (
      <View
        className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[
          {
            backgroundColor: slots.background,
            borderColor: slots.highlight,
            ...sectionBoundsStyle,
          },
          boxed ? BOXED_SHADOW_MD : null,
        ]}
      >
        <View
          className={`flex-1 justify-between rounded-2xl border ${compact ? 'p-3.5' : 'p-5'}`}
          style={{
            backgroundColor: slots.surface,
            borderColor: slots.highlight,
          }}
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
  if (remainingTemplateId === 'compact') {
    return (
      <View
        className={`flex-row items-center justify-between overflow-hidden px-4 py-3 ${boxed ? 'mb-5 rounded-[24px] border' : ''}`}
        style={[
          {
            backgroundColor: slots.surface,
            borderColor: slots.highlight,
            ...sectionBoundsStyle,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <View className="min-w-0 flex-1">
          <Text variant="none" numberOfLines={1} className="font-extrabold text-lg" style={{ color: slots.textPrimary }}>
            {professionalName}
          </Text>
          <Text variant="none" numberOfLines={1} className="font-semibold text-sm mt-0.5" style={{ color: slots.accent }}>
            {title} · {company}
          </Text>
        </View>
      </View>
    );
  }

  // Magazine Monograph (editorial): serif hierarchy with hairline rules
  if (remainingTemplateId === 'editorial') {
    return (
      <View
        className={`overflow-hidden p-5 ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[
          {
            backgroundColor: slots.surface,
            borderColor: slots.highlight,
            ...sectionBoundsStyle,
          },
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
  if (remainingTemplateId === 'spotlight') {
    return (
      <View
        className={`items-center justify-center overflow-hidden p-5 ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[
          {
            backgroundColor: slots.surface,
            borderColor: slots.highlight,
            ...sectionBoundsStyle,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <ProfessionalName {...shared} align="center" name={professionalName} accreditations={accreditations} />
        <View
          className="my-3 rounded-full px-4 py-1.5"
          style={{
            backgroundColor: `${slots.accent}18`,
            borderWidth: 1,
            borderColor: slots.accent,
          }}
        >
          <Text variant="none" className="text-xs font-black" style={{ color: slots.accent }}>
            {title}
          </Text>
        </View>
        <Text variant="none" className="text-sm font-bold" style={{ color: slots.textSecondary }}>
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
  if (remainingTemplateId === 'banner') {
    return (
      <View
        className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[
          {
            backgroundColor: slots.surface,
            borderColor: slots.highlight,
            ...sectionBoundsStyle,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <View className="flex-row items-center justify-between px-4 py-2.5" style={{ backgroundColor: slots.accent }}>
          <Text variant="none" numberOfLines={1} className="text-sm font-black uppercase text-white flex-1 mr-2">
            {company}
          </Text>
          {accreditations ? <Text variant="none" className="text-[11px] font-bold text-white/90">{accreditations}</Text> : null}
        </View>
        <View className="flex-1 p-4">
          <ProfessionalName {...shared} name={professionalName} />
          <View className="mt-2">
            <Text variant="none" className="text-sm font-extrabold" style={{ color: slots.accent }}>
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
  if (remainingTemplateId === 'cards') {
    return (
      <View
        className={`overflow-hidden p-3 gap-2 ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[{ backgroundColor: slots.background, ...sectionBoundsStyle }, boxed ? BOXED_SHADOW_SM : null]}
      >
        <View
          className="rounded-2xl border p-3.5"
          style={{
            backgroundColor: slots.surface,
            borderColor: slots.highlight,
          }}
        >
          <ProfessionalName {...shared} name={professionalName} accreditations={accreditations} />
        </View>
        <View
          className="rounded-2xl border p-3.5"
          style={{
            backgroundColor: slots.surface,
            borderColor: slots.highlight,
          }}
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
  if (remainingTemplateId === 'badge') {
    return (
      <View
        className={`overflow-hidden p-4 ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[
          {
            backgroundColor: slots.surface,
            borderColor: slots.accent,
            ...sectionBoundsStyle,
          },
          boxed ? BOXED_SHADOW_MD : null,
        ]}
      >
        <View
          className="flex-row items-center justify-between border-b pb-2 mb-3"
          style={{ borderBottomColor: slots.highlight }}
        >
          <Text variant="none" className="text-[11px] font-black uppercase" style={{ color: slots.accent }}>
            CREDENTIAL RECORD
          </Text>
          <Text variant="none" className="text-sm font-bold" style={{ color: slots.textSecondary }}>
            {company}
          </Text>
        </View>
        <ProfessionalName {...shared} name={professionalName} accreditations={accreditations} />
        <View
          className="mt-3 rounded-xl border p-2.5"
          style={{
            backgroundColor: slots.background,
            borderColor: slots.highlight,
          }}
        >
          <Text variant="none" className="text-[11px] font-black uppercase" style={{ color: slots.accent }}>
            ROLE / TITLE
          </Text>
          <Text variant="none" className="text-sm font-bold mt-0.5" style={{ color: slots.textPrimary }}>
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
  if (remainingTemplateId === 'split') {
    return (
      <View
        className={`flex-row overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[
          {
            backgroundColor: slots.surface,
            borderColor: slots.highlight,
            ...sectionBoundsStyle,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <View
          className="w-1/2 p-4 border-r"
          style={{
            borderRightColor: slots.highlight,
            backgroundColor: slots.background,
          }}
        >
          <ProfessionalName {...shared} name={professionalName} />
          <View className="mt-2">
            <Text variant="none" className="text-sm font-extrabold" style={{ color: slots.accent }}>
              {title}
            </Text>
          </View>
        </View>
        <View className="w-1/2 p-4 justify-between" style={{ backgroundColor: slots.surface }}>
          <Text variant="none" className="text-sm font-bold" style={{ color: slots.textSecondary }}>
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
  if (remainingTemplateId === 'neon') {
    return (
      <View
        className={`overflow-hidden p-4 ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[
          {
            backgroundColor: slots.background,
            borderColor: slots.accent,
            borderWidth: 2,
            ...sectionBoundsStyle,
          },
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
            variant="none"
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
            <Text variant="none" className="text-xs font-semibold italic" style={{ color: corporateSlots.textSecondary }}>
              Professional tagline
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}
