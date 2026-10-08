import React from "react";
import { View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Quote } from "lucide-react-native";
import { Text } from "@/components/uiComponents/Text";
import type { CardDetailSection } from "../cardDetailTemplate";
import type { CardVisualTheme } from "../../types/card.types";
import { getCardFontFamily, getCardLetterSpacing } from "../cardTheme";
import { resolveLayoutColorSlots } from "@/utils/cardThemeColor";
import {
  BOXED_SHADOW_LG,
  BOXED_SHADOW_MD,
  BOXED_SHADOW_SM,
} from "./SectionSharedComponents";
import { getCardSectionSpacing } from "./cardSectionSpacing";

/** Shared minimum height across all 12 layouts so switching between them
 * (with or without a tagline-length bio) never visibly jumps in size. */
const BIO_MIN_HEIGHT = 140;

type Props = {
  compact?: boolean;
  cardTheme: CardVisualTheme;
  gradient: [string, string];
  fullCardView?: boolean;
  /** Accepted for the shared renderer API. Bio always fills its fixed slot and may shrink to fit. */
  preserveTypeScale?: boolean;
  section: CardDetailSection;
  seamless?: boolean;
  showEmpty?: boolean;
};

export function BioSectionRenderer({
  compact = false,
  cardTheme,
  gradient,
  fullCardView = false,
  section,
  seamless = false,
  showEmpty = false,
}: Props) {
  const { width: viewportWidth } = useWindowDimensions();
  const spacing = getCardSectionSpacing(viewportWidth);
  const boxed = compact && !seamless;
  const taglineText =
    section.fields.find((f) => f.id === "tagline")?.value?.trim() || "";
  const summaryText =
    section.fields.find((f) => f.id === "bio")?.value?.trim() ||
    (showEmpty
      ? "Short professional biography describing your background, mission, and achievements."
      : "No bio provided.");
  const bioText = [taglineText, summaryText].filter(Boolean).join("\n");

  const fontFamily = getCardFontFamily(cardTheme.fontStyle);
  const letterSpacing = getCardLetterSpacing(cardTheme.fontStyle);
  const slots = resolveLayoutColorSlots({
    templateId: section.templateId,
    theme: cardTheme,
  });
  // One type scale for every layout. Font size and line height always travel
  // together. Compact faces, including the fixed full-card slot, shrink to fit.
  const narrow = viewportWidth <= 360;
  const compactShrink = compact ? { flexShrink: 1 as const } : {};
  // Fill the fixed section slot instead of growing with the copy.
  const slotStyle = compact
    ? { height: "100%" as const, minHeight: 0 }
    : { minHeight: BIO_MIN_HEIGHT };
  const type = {
    lead: compact
      ? narrow
        ? { fontSize: 18, lineHeight: 23, ...compactShrink }
        : { fontSize: 21, lineHeight: 27, ...compactShrink }
      : { fontSize: 18, lineHeight: 25 },
    body: compact
      ? narrow
        ? { fontSize: 15, lineHeight: 21, ...compactShrink }
        : { fontSize: 17, lineHeight: 24, ...compactShrink }
      : { fontSize: 15, lineHeight: 22 },
    label: compact && !narrow ? { fontSize: 12, lineHeight: 16 } : { fontSize: 11, lineHeight: 14 },
  } as const;
  // Full-card Executive Statement, Pull Quote, Dual Column, and Story Card.
  // Body stays close to the tagline inside the fixed 20% slot. Longer copy
  // still shrinks via `fit` so the last line stays inside the box.
  const fullCardType = {
    lead: narrow
      ? { fontSize: 18, lineHeight: 22, ...compactShrink }
      : { fontSize: 19, lineHeight: 24, ...compactShrink },
    body: narrow
      ? { fontSize: 17, lineHeight: 22, ...compactShrink }
      : { fontSize: 19, lineHeight: 24, ...compactShrink },
  } as const;
  const faceType = compact && fullCardView ? fullCardType : type;
  // Floating wrench sits on the right edge of the full card. Keep the last
  // words of the bio row clear of it without changing the 20% slot height.
  const fullCardRightPad = fullCardView ? 36 : spacing.horizontal;
  const fit = (lines: number) =>
    compact
      ? ({ adjustsFontSizeToFit: true, minimumFontScale: 0.65, numberOfLines: lines } as const)
      : ({} as const);

  // Executive Statement (minimal): left accent rail with clean typography
  if (section.templateId === "minimal") {
    return (
      <View
        className={`justify-center overflow-hidden ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
        style={[
          {
            backgroundColor: slots.background,
            borderColor: boxed ? slots.accent : undefined,
            borderWidth: boxed ? 1 : 0,
            ...slotStyle,
            paddingLeft: spacing.horizontal,
            paddingRight: fullCardRightPad,
            paddingVertical: compact ? 0 : spacing.vertical,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <View
          style={{
            borderLeftColor: slots.accent,
            borderLeftWidth: 4,
            flexShrink: 1,
            minHeight: 0,
            paddingLeft: compact ? 12 : 18,
          }}
        >
          {!!taglineText && (
            <Text
              variant="none"
              {...fit(2)}
              className="font-extrabold"
              style={{ ...faceType.lead, color: slots.textPrimary, fontFamily, letterSpacing }}
            >
              {taglineText}
            </Text>
          )}
          <View
            className={taglineText ? "my-2 h-0.5 w-10 rounded-full" : "hidden"}
            style={{ backgroundColor: slots.accent }}
          />
          <Text
            variant="none"
            {...fit(taglineText ? (fullCardView ? 3 : 2) : 4)}
            style={{ ...faceType.body, color: slots.textPrimary, fontFamily, letterSpacing }}
          >
            {summaryText}
          </Text>
        </View>
      </View>
    );
  }

  // Callout Banner (bold): centered statement over theme gradient
  if (section.templateId === "bold") {
    return (
      <LinearGradient
        colors={gradient}
        className={`items-center justify-center overflow-hidden ${boxed ? "mb-5 rounded-[28px]" : ""}`}
        style={[
          {
            ...slotStyle,
            paddingHorizontal: spacing.horizontal + 8,
            paddingVertical: compact ? 0 : spacing.vertical,
          },
          boxed ? BOXED_SHADOW_LG : null,
        ]}
      >
        <View
          className="mb-3 h-1 w-12 rounded-full"
          style={{ backgroundColor: slots.gradientText }}
        />
        <Text
          variant="none"
          {...fit(4)}
          className="text-center font-extrabold"
          style={{ ...type.lead, color: slots.gradientText, fontFamily, letterSpacing }}
        >
          {bioText}
        </Text>
        <View
          className="mt-3 h-1 w-7 rounded-full"
          style={{ backgroundColor: slots.highlight }}
        />
        <View className="absolute left-3 top-2 opacity-20">
          <Quote
            color={slots.gradientText}
            size={compact ? 34 : 48}
            strokeWidth={1.4}
          />
        </View>
      </LinearGradient>
    );
  }

  // Frosted Parchment (glass): floating note with highlight border
  if (section.templateId === "glass") {
    return (
      <LinearGradient
        colors={gradient}
        className={`overflow-hidden ${boxed ? "mb-5 rounded-[28px]" : ""}`}
        style={[
          {
            ...slotStyle,
            paddingHorizontal: compact ? 12 : 16,
            paddingVertical: compact ? 0 : 16,
          },
          boxed ? BOXED_SHADOW_MD : null,
        ]}
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
            paddingHorizontal: compact ? 13 : 18,
            paddingVertical: compact ? 0 : 18,
          }}
        >
          <View className="mb-3 flex-row items-center justify-between">
            <View
              className="h-1 w-10 rounded-full"
              style={{ backgroundColor: slots.accent }}
            />
            <Quote
              color={slots.accent}
              size={21}
              strokeWidth={2}
            />
          </View>
          <Text
            variant="none"
            {...fit(4)}
            style={{ ...type.body, color: slots.textPrimary, fontFamily, letterSpacing }}
          >
            {bioText}
          </Text>
        </View>
      </LinearGradient>
    );
  }

  // Pocket Pass (compact): dense preview note
  if (section.templateId === "compact") {
    return (
      <View
        className={`flex-row items-center overflow-hidden px-4 ${compact ? "" : "py-3"} ${boxed ? "mb-5 rounded-[24px] border" : ""}`}
        style={[
          {
            backgroundColor: slots.surface,
            borderColor: slots.highlight,
            ...slotStyle,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <Quote color={slots.accent} size={compact ? 20 : 16} strokeWidth={2.2} />
        <Text
          variant="none"
          {...fit(4)}
          className="ml-2.5 flex-1 font-semibold"
          style={{ ...type.body, color: slots.textPrimary, fontFamily, letterSpacing }}
        >
          {bioText}
        </Text>
      </View>
    );
  }

  // Magazine Monograph (editorial): editorial drop-quote style
  if (section.templateId === "editorial") {
    return (
      <View
        className={`justify-center overflow-hidden ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
        style={[
          {
            backgroundColor: slots.surface,
            borderColor: slots.highlight,
            ...slotStyle,
            paddingLeft: spacing.horizontal,
            paddingRight: fullCardRightPad,
            paddingVertical: compact ? 0 : spacing.vertical,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        {!!taglineText && (
          <View
            className="flex-row items-start"
            style={{ flexShrink: compact ? 1 : 0, minHeight: 0 }}
          >
            <Quote color={slots.accent} size={compact ? 22 : 20} />
            <Text
              variant="none"
              {...fit(2)}
              className="ml-2 flex-1 font-bold italic"
              style={{ ...faceType.lead, color: slots.textPrimary, fontFamily, letterSpacing }}
            >
              {taglineText}
            </Text>
          </View>
        )}
        <View
          className={taglineText ? "my-2 h-px w-full" : "mb-2 h-px w-full"}
          style={{ backgroundColor: slots.highlight }}
        />
        <Text
          variant="none"
          {...fit(taglineText ? (fullCardView ? 3 : 2) : 4)}
          style={{ ...faceType.body, color: slots.textPrimary, fontFamily, letterSpacing }}
        >
          {summaryText}
        </Text>
      </View>
    );
  }

  // Centered Focus (spotlight): centered quote card with decorative dots
  if (section.templateId === "spotlight") {
    return (
      <View
        className={`items-center justify-center overflow-hidden ${compact ? "px-5" : "p-5"} ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
        style={[
          {
            backgroundColor: slots.surface,
            borderColor: slots.highlight,
            ...slotStyle,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <Quote color={slots.accent} size={compact ? 26 : 22} strokeWidth={2} />
        <Text
          variant="none"
          {...fit(3)}
          className="my-2 text-center font-medium"
          style={{ ...type.body, color: slots.textPrimary, fontFamily, letterSpacing }}
        >
          {bioText}
        </Text>
        <View className="flex-row gap-1.5">
          <View
            className="size-1.5 rounded-full"
            style={{ backgroundColor: slots.accent }}
          />
          <View
            className="h-1.5 w-4 rounded-full"
            style={{ backgroundColor: slots.accent }}
          />
          <View
            className="size-1.5 rounded-full"
            style={{ backgroundColor: slots.accent }}
          />
        </View>
      </View>
    );
  }

  // Ribbon Header (banner): top ribbon header with card body
  if (section.templateId === "banner") {
    return (
      <View
        className={`overflow-hidden ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
        style={[
          {
            backgroundColor: slots.surface,
            borderColor: slots.highlight,
            ...slotStyle,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <View className="px-4 py-2" style={{ backgroundColor: slots.accent }}>
          <Text
            variant="none"
            className="font-black uppercase"
            style={{ ...type.label, color: "#ffffff", fontFamily }}
          >
            About
          </Text>
        </View>
        <View
          className="flex-1"
          style={{
            paddingHorizontal: spacing.horizontal,
            paddingVertical: compact ? 0 : spacing.vertical,
          }}
        >
          <Text
            variant="none"
            {...fit(4)}
            style={{ ...type.body, color: slots.textPrimary, fontFamily, letterSpacing }}
          >
            {bioText}
          </Text>
        </View>
      </View>
    );
  }

  // Story Card (cards): stacked bold tagline over the bio, inside an inset
  // rounded box on the section background. Compact home uses this same branch.
  if (section.templateId === "cards" && compact && fullCardView) {
    return (
      <View
        className="overflow-hidden"
        style={{
          alignSelf: "stretch",
          backgroundColor: slots.background,
          flex: 1,
          padding: spacing.gap,
          width: "100%",
          ...slotStyle,
        }}
      >
        <View
          style={[
            {
              backgroundColor: slots.surface,
              borderColor: slots.highlight,
              borderRadius: 16,
              borderWidth: 1,
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
              paddingLeft: spacing.horizontal,
              paddingRight: 36,
              paddingVertical: 0,
            },
            BOXED_SHADOW_SM,
          ]}
        >
          {!!taglineText && (
            <Text
              variant="none"
              {...fit(2)}
              className="font-extrabold"
              style={{
                ...fullCardType.lead,
                color: slots.textPrimary,
                fontFamily,
                letterSpacing,
              }}
            >
              {taglineText}
            </Text>
          )}
          <Text
            variant="none"
            {...fit(taglineText ? 3 : 4)}
            className="font-medium"
            style={{
              ...fullCardType.body,
              color: slots.textPrimary,
              fontFamily,
              letterSpacing,
              marginTop: taglineText ? 4 : 0,
            }}
          >
            {summaryText}
          </Text>
        </View>
      </View>
    );
  }

  // Modular Bento (cards): inset floating cardlet outside the fixed card slot
  if (section.templateId === "cards") {
    return (
      <View
        className={`overflow-hidden ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
        style={[
          {
            backgroundColor: slots.background,
            ...slotStyle,
            padding: spacing.gap,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <View
          className="flex-1 rounded-2xl border"
          style={[
            {
              backgroundColor: slots.surface,
              borderColor: slots.highlight,
              paddingHorizontal: spacing.horizontal - 4,
              paddingVertical: compact ? 0 : spacing.horizontal - 4,
            },
            BOXED_SHADOW_SM,
          ]}
        >
          {!!taglineText && (
            <View
              className="mb-2 max-w-full self-start rounded-full px-3 py-1"
              style={{ backgroundColor: `${slots.accent}16` }}
            >
              <Text
                variant="none"
                numberOfLines={1}
                className="font-black uppercase"
                style={{ ...type.label, color: slots.accent, fontFamily, letterSpacing }}
              >
                {taglineText}
              </Text>
            </View>
          )}
          <Text
            variant="none"
            {...fit(taglineText ? 3 : 4)}
            className="font-medium"
            style={{ ...type.body, color: slots.textPrimary, fontFamily, letterSpacing }}
          >
            {summaryText}
          </Text>
        </View>
      </View>
    );
  }

  // Conference ID Pass (badge): verification card
  if (section.templateId === "badge") {
    return (
      <View
        className={`overflow-hidden ${compact ? "px-4" : "p-4"} ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
        style={[
          {
            backgroundColor: slots.surface,
            borderColor: slots.accent,
            ...slotStyle,
          },
          boxed ? BOXED_SHADOW_MD : null,
        ]}
      >
        <View
          className="mb-2 flex-row items-center justify-between border-b pb-2"
          style={{ borderBottomColor: slots.highlight }}
        >
          <Text
            variant="none"
            className="font-black uppercase"
            style={{ ...type.label, color: slots.accent, fontFamily }}
          >
            VERIFIED BIOGRAPHY
          </Text>
          <View
            className="size-2 rounded-full"
            style={{ backgroundColor: slots.accent }}
          />
        </View>
        <Text
          variant="none"
          {...fit(3)}
          style={{ ...type.body, color: slots.textPrimary, fontFamily, letterSpacing }}
        >
          {bioText}
        </Text>
      </View>
    );
  }

  // 50/50 Dual Column (split): left emblem column, right text
  if (section.templateId === "split") {
    return (
      <View
        className={`flex-row overflow-hidden ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
        style={[
          {
            backgroundColor: slots.surface,
            borderColor: slots.highlight,
            ...slotStyle,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <View
          className="w-[38%] items-center justify-center border-r"
          style={{
            borderRightColor: slots.highlight,
            backgroundColor: slots.background,
            paddingHorizontal: spacing.gap,
            paddingVertical: compact ? 0 : spacing.vertical,
          }}
        >
          <Quote
            color={slots.accent}
            size={24}
            strokeWidth={2}
          />
          {!!taglineText && (
            <Text
              variant="none"
              {...fit(3)}
              className="mt-2 text-center font-extrabold"
              style={{ ...faceType.lead, color: slots.textPrimary, fontFamily, letterSpacing }}
            >
              {taglineText}
            </Text>
          )}
        </View>
        <View
          className="flex-1 justify-center"
          style={{
            backgroundColor: slots.surface,
            paddingLeft: spacing.horizontal,
            paddingRight: fullCardRightPad,
            paddingVertical: compact ? 0 : spacing.vertical,
          }}
        >
          <Text
            variant="none"
            {...fit(5)}
            style={{ ...faceType.body, color: slots.textPrimary, fontFamily, letterSpacing }}
          >
            {summaryText}
          </Text>
        </View>
      </View>
    );
  }

  // Framed Outline (neon): high-contrast wireframe
  if (section.templateId === "neon") {
    return (
      <View
        className={`justify-center overflow-hidden ${compact ? "px-4" : "p-4"} ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
        style={[
          {
            backgroundColor: slots.background,
            borderColor: slots.accent,
            borderWidth: 2,
            ...slotStyle,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <Text
          variant="none"
          {...fit(5)}
          style={{ ...type.body, color: slots.textPrimary, fontFamily, letterSpacing }}
        >
          {bioText}
        </Text>
      </View>
    );
  }

  // Editorial Story (classic): magazine-style quote gutter beside narrative
  return (
    <View
      className={`flex-row overflow-hidden ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
      style={[
        {
          backgroundColor: slots.surface,
          borderColor: boxed ? slots.accent : undefined,
          ...slotStyle,
          paddingHorizontal: spacing.horizontal,
          paddingVertical: compact ? 0 : spacing.vertical,
        },
        boxed ? BOXED_SHADOW_SM : null,
      ]}
    >
      <View className="mr-4 items-center">
        <Quote
          color={slots.accent}
          size={compact ? 24 : 26}
          strokeWidth={2.2}
        />
        <View
          className="mt-2 w-0.5 flex-1 rounded-full"
          style={{ backgroundColor: slots.accent }}
        />
      </View>
      <Text
        variant="none"
        {...fit(5)}
        className="flex-1"
        style={{ ...type.body, color: slots.textPrimary, fontFamily, letterSpacing }}
      >
        {bioText}
      </Text>
    </View>
  );
}
