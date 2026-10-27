import React, { useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Award, Building2 } from 'lucide-react-native';
import { Text } from '@/common/ui/Text';
import type { CardDetailSection } from '../cardDetailTemplate';
import type { CardVisualTheme, ResolvedLayoutSlots } from '../../types/card.types';
import { getCardFontFamily, getCardLetterSpacing } from '../cardTheme';
import {
  fitAccreditationsToViewport,
  fitTaglineToViewport,
  getResponsiveSingleLineFontSize,
} from '@/utils/cardTextLayout';
import { resolveLayoutColorSlots } from '@/utils/cardThemeColor';
import { BOXED_SHADOW_MD, BOXED_SHADOW_SM } from './SectionSharedComponents';
import { getCardSectionSpacing } from './cardSectionSpacing';

/** Shared minimum height across all 12 layouts so switching between them
 * (with or without an optional tagline) never visibly jumps in size. */
const PROFESSIONAL_MIN_HEIGHT = 160;
type Props = {
  compact?: boolean;
  cardTheme: CardVisualTheme;
  contentDriven?: boolean;
  fullCardView?: boolean;
  gradient: [string, string];
  section: CardDetailSection;
  seamless?: boolean;
  showEmpty?: boolean;
  walletPass?: boolean;
  interactiveActions?: boolean;
  onSaveContact?: () => void;
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
  contentDriven = false,
  fullCardView = false,
  gradient,
  section,
  seamless = false,
  showEmpty = false,
  walletPass = false,
  interactiveActions,
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
  const inFixedCardSlot = compact && !contentDriven && (fullCardView || seamless);
  const homePreview = compact && seamless && !fullCardView;
  const sectionBoundsStyle = contentDriven
    ? ({ width: '100%' } as const)
    : compact
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
  const enterpriseCompanyFontSize = getResponsiveSingleLineFontSize(
    viewportWidth - (compact ? 64 : 88),
    company.length,
    compact ? 18 : 22,
    compact ? 22 : 26,
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
          </View>
        </View>
        {showTagline ? (
          <ProfessionalTaglineFooter
            compact={compact}
            fullCardView={fullCardView}
            horizontalPadding={spacing.horizontal}
            mark="quote"
            shared={shared}
            tagline={tagline}
          />
        ) : null}
        {accreditations ? (
          <View
            className="self-start rounded-full border px-3 py-1"
            style={{
              backgroundColor: `${slots.accent}0D`,
              borderColor: `${slots.accent}35`,
              marginBottom: spacing.tightVertical,
              marginHorizontal: spacing.horizontal,
              marginTop: showTagline ? 2 : 8,
            }}
          >
            <Text
              variant="none"
              adjustsFontSizeToFit
              minimumFontScale={0.72}
              numberOfLines={1}
              className="text-xs font-bold uppercase"
              style={{
                color: slots.accent,
                fontFamily: getCardFontFamily(cardTheme.fontStyle),
              }}
            >
              {accreditations}
            </Text>
          </View>
        ) : null}
      </View>
    );
  }

  // Layout 1b — Executive Minimal (New) [Welcome Page Midnight Aesthetic]
  if (section.templateId === 'classic-new') {
    return (
      <View
        className={`justify-start overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[
          {
            ...sectionBoundsStyle,
            backgroundColor: '#070d1e',
            borderColor: 'rgba(56, 189, 248, 0.25)',
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
          {/* Welcome Style Tracking Badge */}
          <View className="mb-2 self-start rounded-full border border-sky-400/25 bg-sky-500/10 px-3 py-1">
            <Text
              variant="none"
              className="text-[11px] font-bold tracking-wider text-sky-400 uppercase"
            >
              EXECUTIVE
            </Text>
          </View>
          <Text
            variant="none"
            adjustsFontSizeToFit
            minimumFontScale={0.72}
            numberOfLines={1}
            className="font-black text-white"
            style={{
              color: '#ffffff',
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
                  color: '#38bdf8',
                  fontFamily: getCardFontFamily(cardTheme.fontStyle),
                  fontSize: executiveRoleFontSize,
                  lineHeight: Math.ceil(executiveRoleFontSize * 1.2),
                }}
              >
                {title}
              </Text>
              <View className="mt-0.5 flex-row items-center">
                <Building2 color="#94a3b8" size={compact ? 14 : 16} />
                <Text
                  variant="none"
                  adjustsFontSizeToFit
                  minimumFontScale={0.75}
                  numberOfLines={1}
                  className="ml-1.5 flex-1 font-semibold"
                  style={{
                    color: '#94a3b8',
                    fontFamily: getCardFontFamily(cardTheme.fontStyle),
                    fontSize: compact ? 16 : 18,
                    lineHeight: compact ? 20 : 22,
                  }}
                >
                  {company}
                </Text>
              </View>
            </View>
          </View>
        </View>
        {showTagline ? (
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: 'rgba(56, 189, 248, 0.15)',
              marginTop: 8,
              paddingTop: 4,
            }}
          >
            <ProfessionalTaglineFooter
              compact={compact}
              fullCardView={fullCardView}
              horizontalPadding={spacing.horizontal}
              mark="quote"
              shared={{ ...shared, slots: { ...slots, accent: '#38bdf8', textSecondary: '#94a3b8' } }}
              tagline={tagline}
            />
          </View>
        ) : null}
        {accreditations ? (
          <View
            className="self-start rounded-full border px-3 py-1"
            style={{
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              borderColor: 'rgba(56, 189, 248, 0.3)',
              marginBottom: spacing.tightVertical,
              marginHorizontal: spacing.horizontal,
              marginTop: showTagline ? 2 : 8,
            }}
          >
            <Text
              variant="none"
              adjustsFontSizeToFit
              minimumFontScale={0.72}
              numberOfLines={1}
              className="text-xs font-bold uppercase text-sky-400"
              style={{
                color: '#38bdf8',
                fontFamily: getCardFontFamily(cardTheme.fontStyle),
              }}
            >
              {accreditations}
            </Text>
          </View>
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
                  fontSize: enterpriseCompanyFontSize,
                  lineHeight: Math.ceil(enterpriseCompanyFontSize * 1.2),
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
    const trimmedName = professionalName.trim();
    const offsetChars = Math.min(4, Math.max(0, trimmedName.length));
    const namePrefix = trimmedName.slice(0, Math.max(0, trimmedName.length - offsetChars));
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
            className="self-start font-bold"
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
            <View
              className="min-w-0 flex-row items-center"
              style={{ marginTop: compact ? 1 : 2 }}
            >
              {namePrefix ? (
                <View
                  aria-hidden
                  style={{
                    flexShrink: 0,
                    height: accreditationLineHeight,
                    justifyContent: 'center',
                    opacity: 0,
                    overflow: 'hidden',
                  }}
                >
                  <Text
                    variant="none"
                    className="font-bold"
                    numberOfLines={1}
                    style={{
                      fontFamily: getCardFontFamily(cardTheme.fontStyle),
                      fontSize: companyFocusNameFontSize,
                      lineHeight: companyFocusNameFontSize,
                    }}
                  >
                    {namePrefix}
                  </Text>
                </View>
              ) : null}
              <Text
                variant="none"
                adjustsFontSizeToFit
                minimumFontScale={0.65}
                numberOfLines={1}
                className="min-w-0 flex-1 font-semibold"
                style={{
                  color: slots.accent,
                  fontFamily: getCardFontFamily(cardTheme.fontStyle),
                  fontSize: companyFocusAccreditationFontSize,
                  lineHeight: accreditationLineHeight,
                  textAlign: 'left',
                }}
              >
                {accreditations}
              </Text>
            </View>
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

  // Layout 3b — Company Focus (New) [Welcome Page Midnight Banner]
  if (section.templateId === 'banner-new') {
    return (
      <View
        className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[
          {
            ...sectionBoundsStyle,
            backgroundColor: '#070d1e',
            borderColor: 'rgba(56, 189, 248, 0.25)',
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        {/* Welcome-styled Company Header Banner */}
        <View
          className="flex-row items-center justify-between px-4 py-2"
          style={{
            backgroundColor: '#1d4ed8',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(56, 189, 248, 0.35)',
          }}
        >
          <View className="flex-row items-center flex-1 mr-2">
            <Building2 color="#38bdf8" size={compact ? 15 : 17} />
            <Text
              variant="none"
              numberOfLines={1}
              className="ml-2 font-bold text-white text-sm"
              style={{ fontFamily: getCardFontFamily(cardTheme.fontStyle) }}
            >
              {company}
            </Text>
          </View>
          <View className="rounded-full border border-sky-400/40 bg-sky-500/20 px-2 py-0.5">
            <Text variant="none" className="text-[10px] font-bold text-sky-200">
              VERIFIED
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: spacing.horizontal, paddingTop: spacing.tightVertical }}>
          <Text
            variant="none"
            adjustsFontSizeToFit
            minimumFontScale={0.72}
            numberOfLines={1}
            className="font-black text-white"
            style={{
              fontSize: executiveDisplayFontSize,
              fontFamily: getCardFontFamily(cardTheme.fontStyle),
              lineHeight: Math.ceil(executiveDisplayFontSize * 1.12),
            }}
          >
            {professionalName}
          </Text>
          <Text
            variant="none"
            numberOfLines={1}
            className="mt-1 font-bold text-sky-400"
            style={{
              fontSize: executiveRoleFontSize,
              fontFamily: getCardFontFamily(cardTheme.fontStyle),
            }}
          >
            {title}
          </Text>
        </View>

        {accreditations ? (
          <View
            className="self-start rounded-full border px-3 py-0.5"
            style={{
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              borderColor: 'rgba(56, 189, 248, 0.3)',
              marginHorizontal: spacing.horizontal,
              marginTop: 6,
            }}
          >
            <Text variant="none" className="text-xs font-bold uppercase text-sky-400">
              {accreditations}
            </Text>
          </View>
        ) : null}

        {showTagline ? (
          <ProfessionalTaglineFooter
            compact={compact}
            fullCardView={fullCardView}
            horizontalPadding={spacing.horizontal}
            mark="chevron"
            shared={{ ...shared, slots: { ...slots, accent: '#38bdf8', textSecondary: '#94a3b8' } }}
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
            borderBottomWidth: 0,
            borderColor: slots.highlight,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <View className={contentDriven ? 'flex-row-reverse' : 'min-h-0 flex-1 flex-row-reverse'}>
          <View
            className="w-[30%] items-center justify-center"
            style={{
              backgroundColor: slots.surface,
              paddingHorizontal: spacing.gap,
              paddingVertical: spacing.tightVertical,
            }}
          >
            <View
              className={`${compact ? 'size-10' : 'size-12'} items-center justify-center rounded-full`}
              style={{ backgroundColor: `${slots.accent}18` }}
            >
              <Award color={slots.accent} size={compact ? 26 : 30} />
            </View>
            <Text
              variant="none"
              adjustsFontSizeToFit
              minimumFontScale={0.72}
              numberOfLines={2}
              className="mt-2 self-stretch text-center text-sm font-bold uppercase"
              style={{
                color: slots.accent,
                fontFamily: getCardFontFamily(cardTheme.fontStyle),
                textAlign: 'center',
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
          </View>
        </View>
        {showTagline ? (
          <ProfessionalTaglineFooter
            compact={compact}
            fullCardView={fullCardView}
            horizontalPadding={spacing.horizontal}
            mark="star"
            shared={shared}
            tagline={tagline}
          />
        ) : null}
      </View>
    );
  }

  // Layout 4b — Credential Card (New) [Welcome Page Smart ID Rail]
  if (section.templateId === 'badge-new') {
    return (
      <View
        className={`overflow-hidden border ${boxed ? 'mb-5 rounded-[28px]' : ''}`}
        style={[
          {
            ...sectionBoundsStyle,
            backgroundColor: '#070d1e',
            borderColor: 'rgba(56, 189, 248, 0.25)',
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <View className={contentDriven ? 'flex-row-reverse' : 'min-h-0 flex-1 flex-row-reverse'}>
          <View
            className="w-[30%] items-center justify-center"
            style={{
              backgroundColor: '#0a1128',
              borderLeftWidth: 1,
              borderLeftColor: 'rgba(56, 189, 248, 0.2)',
              padding: spacing.gap,
            }}
          >
            {/* Online / Active Verified Beacon */}
            <View className="mb-2 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/50" />
            <Award color="#38bdf8" size={compact ? 22 : 28} />
            {accreditations ? (
              <Text
                variant="none"
                numberOfLines={2}
                className="mt-1.5 text-center text-[10px] font-bold uppercase text-sky-300"
              >
                {accreditations}
              </Text>
            ) : null}
          </View>

          <View className="min-w-0 flex-1 justify-center p-3">
            <View className="mb-1 self-start rounded-full border border-sky-400/25 bg-sky-500/10 px-2.5 py-0.5">
              <Text variant="none" className="text-[10px] font-bold tracking-wider text-sky-400">
                PRO ID
              </Text>
            </View>
            <Text
              variant="none"
              adjustsFontSizeToFit
              minimumFontScale={0.72}
              numberOfLines={1}
              className="font-black text-white"
              style={{
                fontSize: executiveDisplayFontSize,
                fontFamily: getCardFontFamily(cardTheme.fontStyle),
              }}
            >
              {professionalName}
            </Text>
            <Text
              variant="none"
              numberOfLines={1}
              className="mt-0.5 font-bold text-sky-400"
              style={{
                fontSize: executiveRoleFontSize,
                fontFamily: getCardFontFamily(cardTheme.fontStyle),
              }}
            >
              {title}
            </Text>
            <View className="mt-1 flex-row items-center">
              <Building2 color="#94a3b8" size={13} />
              <Text variant="none" numberOfLines={1} className="ml-1 text-xs font-semibold text-slate-400">
                {company}
              </Text>
            </View>
          </View>
        </View>

        {showTagline ? (
          <ProfessionalTaglineFooter
            compact={compact}
            fullCardView={fullCardView}
            horizontalPadding={spacing.horizontal}
            mark="diamond"
            shared={{ ...shared, slots: { ...slots, accent: '#38bdf8', textSecondary: '#94a3b8' } }}
            tagline={tagline}
          />
        ) : null}
      </View>
    );
  }

  // Layout 2b — Enterprise Split (New) [Welcome Page Two-Pane Aesthetic]
  if (section.templateId === 'spotlight-new') {
    return (
      <View
        className={`overflow-hidden ${boxed ? 'mb-5 rounded-[28px] border' : ''}`}
        style={[
          {
            ...sectionBoundsStyle,
            backgroundColor: '#070d1e',
            borderColor: 'rgba(56, 189, 248, 0.25)',
          },
          boxed ? BOXED_SHADOW_MD : null,
        ]}
      >
        <View style={{ alignItems: 'stretch', flex: 1, flexDirection: 'row', minHeight: 0 }}>
          {/* Left Welcome Split Column */}
          <View
            style={{
              alignItems: 'center',
              backgroundColor: '#0a1128',
              borderRightWidth: 1,
              borderRightColor: 'rgba(56, 189, 248, 0.2)',
              justifyContent: 'center',
              paddingHorizontal: spacing.gap,
              paddingVertical: spacing.tightVertical,
              width: '38%',
            }}
          >
            <View className="mb-1 rounded-full border border-sky-400/25 bg-sky-500/10 px-2 py-0.5">
              <Text variant="none" className="text-[9px] font-bold tracking-wider text-sky-400 uppercase">
                ENTERPRISE
              </Text>
            </View>
            <Text
              variant="none"
              adjustsFontSizeToFit
              minimumFontScale={0.72}
              numberOfLines={1}
              className="text-center font-extrabold text-white text-sm"
              style={{ fontFamily: getCardFontFamily(cardTheme.fontStyle) }}
            >
              {company}
            </Text>
            <View className="my-1.5 h-0.5 w-6 rounded-full bg-sky-400" />
            <Text
              variant="none"
              adjustsFontSizeToFit
              minimumFontScale={0.72}
              numberOfLines={2}
              className="text-center font-semibold text-sky-300 text-xs"
              style={{ fontFamily: getCardFontFamily(cardTheme.fontStyle) }}
            >
              {title}
            </Text>
          </View>

          {/* Right Welcome Column */}
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              paddingHorizontal: spacing.horizontal,
              paddingVertical: spacing.tightVertical,
            }}
          >
            <Text
              variant="none"
              adjustsFontSizeToFit
              minimumFontScale={0.72}
              numberOfLines={1}
              className="font-black text-white"
              style={{
                fontSize: executiveDisplayFontSize,
                fontFamily: getCardFontFamily(cardTheme.fontStyle),
              }}
            >
              {professionalName}
            </Text>
            {accreditations ? (
              <View
                className="mt-1.5 self-start rounded-full border border-sky-400/30 bg-sky-500/10 px-2 py-0.5"
              >
                <Text variant="none" className="text-[10px] font-bold text-sky-400 uppercase">
                  {accreditations}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {showTagline ? (
          <ProfessionalTaglineFooter
            compact={compact}
            fullCardView={fullCardView}
            horizontalPadding={spacing.horizontal}
            mark="star"
            shared={{ ...shared, slots: { ...slots, accent: '#38bdf8', textSecondary: '#94a3b8' } }}
            tagline={tagline}
          />
        ) : null}
      </View>
    );
  }

  // Enterprise Split (spotlight in fixed card slots) / default fallback
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
      style={[
        {
          ...sectionBoundsStyle,
          backgroundColor: slots.surface,
          borderColor: boxed ? slots.accent : undefined,
        },
        boxed ? BOXED_SHADOW_MD : null,
      ]}
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
