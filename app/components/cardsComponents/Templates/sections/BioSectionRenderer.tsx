import React from "react";
import { View } from "react-native";
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

/** Shared minimum height across all 12 layouts so switching between them
 * (with or without a tagline-length bio) never visibly jumps in size. */
const BIO_MIN_HEIGHT = 140;

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
  const sharedTextProps = {
    adjustsFontSizeToFit: compact,
    minimumFontScale: 0.76,
    numberOfLines: compact ? 4 : undefined,
  } as const;

  // Executive Statement (minimal): left accent rail with clean typography
  if (section.templateId === "minimal") {
    return (
      <View
        className={`justify-center overflow-hidden px-5 py-4 ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
        style={[
          {
            backgroundColor: slots.background,
            borderColor: boxed ? slots.accent : undefined,
            borderWidth: boxed ? 1 : 0,
            height: compact ? "100%" : undefined,
            minHeight: compact ? undefined : BIO_MIN_HEIGHT,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <View
          style={{
            borderLeftColor: slots.accent,
            borderLeftWidth: 4,
            paddingLeft: compact ? 12 : 18,
          }}
        >
          {!!taglineText && (
            <Text
              numberOfLines={compact ? 2 : undefined}
              className={
                compact ? "text-sm font-extrabold" : "text-lg font-extrabold"
              }
              style={{ color: slots.textPrimary, fontFamily, letterSpacing }}
            >
              {taglineText}
            </Text>
          )}
          <View
            className={taglineText ? "my-2 h-0.5 w-10 rounded-full" : "hidden"}
            style={{ backgroundColor: slots.accent }}
          />
          <Text
            numberOfLines={compact ? 3 : undefined}
            className={`leading-relaxed ${compact ? "text-[11px]" : "text-sm"}`}
            style={{ color: slots.textSecondary, fontFamily, letterSpacing }}
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
        className={`items-center justify-center overflow-hidden px-6 py-5 ${boxed ? "mb-5 rounded-[28px]" : ""}`}
        style={[
          {
            height: compact ? "100%" : undefined,
            minHeight: compact ? undefined : BIO_MIN_HEIGHT,
          },
          boxed ? BOXED_SHADOW_LG : null,
        ]}
      >
        <View
          className="mb-3 h-1 w-12 rounded-full"
          style={{ backgroundColor: slots.gradientText }}
        />
        <Text
          {...sharedTextProps}
          className={`leading-relaxed ${compact ? "text-center text-sm font-extrabold" : "text-center text-lg font-extrabold"}`}
          style={{ color: slots.gradientText, fontFamily, letterSpacing }}
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
            height: compact ? "100%" : undefined,
            minHeight: compact ? undefined : BIO_MIN_HEIGHT,
            padding: compact ? 12 : 16,
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
            padding: compact ? 13 : 18,
          }}
        >
          <View className="mb-3 flex-row items-center justify-between">
            <View
              className="h-1 w-10 rounded-full"
              style={{ backgroundColor: slots.accent }}
            />
            <Quote
              color={slots.accent}
              size={compact ? 17 : 21}
              strokeWidth={2}
            />
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
  if (section.templateId === "compact") {
    return (
      <View
        className={`flex-row items-center overflow-hidden px-4 py-3 ${boxed ? "mb-5 rounded-[24px] border" : ""}`}
        style={[
          {
            backgroundColor: slots.surface,
            borderColor: slots.highlight,
            height: compact ? "100%" : undefined,
            minHeight: compact ? undefined : BIO_MIN_HEIGHT,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <Quote color={slots.accent} size={14} strokeWidth={2.4} />
        <Text
          {...sharedTextProps}
          className={`ml-2.5 flex-1 font-semibold leading-relaxed ${compact ? "text-xs" : "text-sm"}`}
          style={{ color: slots.textPrimary, fontFamily, letterSpacing }}
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
        className={`overflow-hidden p-5 ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
        style={[
          {
            backgroundColor: slots.surface,
            borderColor: slots.highlight,
            height: compact ? "100%" : undefined,
            minHeight: compact ? undefined : BIO_MIN_HEIGHT,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        {!!taglineText && (
          <View className="flex-row items-start">
            <Quote color={slots.accent} size={compact ? 16 : 20} />
            <Text
              numberOfLines={compact ? 2 : undefined}
              className={`ml-2 flex-1 font-bold italic leading-snug ${compact ? "text-sm" : "text-lg"}`}
              style={{ color: slots.textPrimary, fontFamily, letterSpacing }}
            >
              {taglineText}
            </Text>
          </View>
        )}
        <View
          className={taglineText ? "my-3 h-px w-full" : "mb-2 h-px w-full"}
          style={{ backgroundColor: slots.highlight }}
        />
        <Text
          numberOfLines={compact ? 3 : undefined}
          className={`leading-relaxed ${compact ? "text-[11px]" : "text-sm"}`}
          style={{ color: slots.textSecondary, fontFamily, letterSpacing }}
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
        className={`items-center justify-center overflow-hidden p-5 ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
        style={[
          {
            backgroundColor: slots.surface,
            borderColor: slots.highlight,
            height: compact ? "100%" : undefined,
            minHeight: compact ? undefined : BIO_MIN_HEIGHT,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <Quote color={slots.accent} size={22} strokeWidth={2} />
        <Text
          {...sharedTextProps}
          className={`my-3 text-center leading-relaxed font-medium ${compact ? "text-xs" : "text-sm"}`}
          style={{ color: slots.textPrimary, fontFamily, letterSpacing }}
        >
          {bioText}
        </Text>
        <View className="flex-row gap-1.5">
          <View
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: slots.accent }}
          />
          <View
            className="h-1.5 w-4 rounded-full"
            style={{ backgroundColor: slots.accent }}
          />
          <View
            className="h-1.5 w-1.5 rounded-full"
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
            height: compact ? "100%" : undefined,
            minHeight: compact ? undefined : BIO_MIN_HEIGHT,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <View className="px-4 py-2" style={{ backgroundColor: slots.accent }}>
          <Text className="text-xs font-black uppercase tracking-wider text-white">
            About &amp; Story
          </Text>
        </View>
        <View className="flex-1 p-4">
          <Text
            {...sharedTextProps}
            className={`leading-relaxed ${compact ? "text-xs" : "text-sm"}`}
            style={{ color: slots.textPrimary, fontFamily, letterSpacing }}
          >
            {bioText}
          </Text>
        </View>
      </View>
    );
  }

  // Modular Bento (cards): inset floating cardlet
  if (section.templateId === "cards") {
    return (
      <View
        className={`overflow-hidden p-3 ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
        style={[
          {
            backgroundColor: slots.background,
            height: compact ? "100%" : undefined,
            minHeight: compact ? undefined : BIO_MIN_HEIGHT,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <View
          className="flex-1 rounded-2xl border p-4"
          style={[
            { backgroundColor: slots.surface, borderColor: slots.highlight },
            BOXED_SHADOW_SM,
          ]}
        >
          {!!taglineText && (
            <View
              className="mb-3 self-start rounded-full px-3 py-1.5"
              style={{ backgroundColor: `${slots.accent}16` }}
            >
              <Text
                numberOfLines={1}
                className="text-[10px] font-black uppercase tracking-wider"
                style={{ color: slots.accent, fontFamily, letterSpacing }}
              >
                {taglineText}
              </Text>
            </View>
          )}
          <Text
            numberOfLines={compact ? 4 : undefined}
            className={`leading-relaxed ${compact ? "text-xs font-medium" : "text-sm font-medium"}`}
            style={{ color: slots.textPrimary, fontFamily, letterSpacing }}
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
        className={`overflow-hidden p-4 ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
        style={[
          {
            backgroundColor: slots.surface,
            borderColor: slots.accent,
            height: compact ? "100%" : undefined,
            minHeight: compact ? undefined : BIO_MIN_HEIGHT,
          },
          boxed ? BOXED_SHADOW_MD : null,
        ]}
      >
        <View
          className="mb-2 flex-row items-center justify-between border-b pb-2"
          style={{ borderBottomColor: slots.highlight }}
        >
          <Text
            className="text-[10px] font-black uppercase tracking-wider"
            style={{ color: slots.accent }}
          >
            VERIFIED BIOGRAPHY
          </Text>
          <View
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: slots.accent }}
          />
        </View>
        <Text
          {...sharedTextProps}
          className={`leading-relaxed ${compact ? "text-xs" : "text-sm"}`}
          style={{ color: slots.textPrimary, fontFamily, letterSpacing }}
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
            height: compact ? "100%" : undefined,
            minHeight: compact ? undefined : BIO_MIN_HEIGHT,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <View
          className="w-[38%] items-center justify-center border-r p-3"
          style={{
            borderRightColor: slots.highlight,
            backgroundColor: slots.background,
          }}
        >
          <Quote
            color={slots.accent}
            size={compact ? 18 : 24}
            strokeWidth={2}
          />
          <Text
            numberOfLines={compact ? 3 : undefined}
            className={`mt-2 text-center font-extrabold leading-tight ${compact ? "text-[11px]" : "text-sm"}`}
            style={{ color: slots.textPrimary, fontFamily, letterSpacing }}
          >
            {taglineText || "My professional focus"}
          </Text>
        </View>
        <View
          className="flex-1 p-4 justify-center"
          style={{ backgroundColor: slots.surface }}
        >
          <Text
            numberOfLines={compact ? 4 : undefined}
            className={`leading-relaxed ${compact ? "text-[11px]" : "text-sm"}`}
            style={{ color: slots.textSecondary, fontFamily, letterSpacing }}
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
        className={`overflow-hidden p-4 ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
        style={[
          {
            backgroundColor: slots.background,
            borderColor: slots.accent,
            borderWidth: 2,
            height: compact ? "100%" : undefined,
            minHeight: compact ? undefined : BIO_MIN_HEIGHT,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <Text
          {...sharedTextProps}
          className={`leading-relaxed ${compact ? "text-xs" : "text-sm"}`}
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
      className={`flex-row overflow-hidden px-4 py-5 ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
      style={[
        {
          backgroundColor: slots.surface,
          borderColor: boxed ? slots.accent : undefined,
          height: compact ? "100%" : undefined,
          minHeight: compact ? undefined : BIO_MIN_HEIGHT,
        },
        boxed ? BOXED_SHADOW_SM : null,
      ]}
    >
      <View className="mr-4 items-center">
        <Quote
          color={slots.accent}
          size={compact ? 20 : 26}
          strokeWidth={2.2}
        />
        <View
          className="mt-2 w-0.5 flex-1 rounded-full"
          style={{ backgroundColor: slots.accent }}
        />
      </View>
      <Text
        {...sharedTextProps}
        className={`flex-1 leading-relaxed ${compact ? "text-xs" : "text-base"}`}
        style={{ color: slots.textPrimary, fontFamily, letterSpacing }}
      >
        {bioText}
      </Text>
    </View>
  );
}
