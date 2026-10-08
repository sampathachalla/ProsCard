import React from "react";
import {
  Linking,
  Pressable,
  View,
  useWindowDimensions,
  type ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import * as Haptics from "expo-haptics";
import { Text } from "@/components/uiComponents/Text";
import type { CardDetailField, CardDetailSection } from "../cardDetailTemplate";
import type { CardVisualTheme } from "../../types/card.types";
import { getCardFontFamily, getCardLetterSpacing } from "../cardTheme";
import {
  BOXED_SHADOW_LG,
  BOXED_SHADOW_MD,
  BOXED_SHADOW_SM,
  formatDisplayValue,
  resolveActionUrl,
} from "./SectionSharedComponents";
import { resolveLayoutColorSlots } from "@/utils/cardThemeColor";
import { getCardSectionSpacing } from "./cardSectionSpacing";

/** Floor only — unlike Identity/Professional/Bio, Connections legitimately
 * varies in height with the number of channels a user has added. This just
 * keeps a layout from looking near-collapsed when only 1-2 are present. */
const CONNECTIONS_MIN_HEIGHT = 110;

type Props = {
  compact?: boolean;
  cardTheme: CardVisualTheme;
  fullCardView?: boolean;
  gradient: [string, string];
  preserveTypeScale?: boolean;
  section: CardDetailSection;
  seamless?: boolean;
  showEmpty?: boolean;
};

/** Directory-style presentation: a small channel label ("Email", "LinkedIn")
 * paired with the actual stored value — not a templated sentence. */
type ConnectionPresentation = {
  label: string;
  value: string;
};

const SOCIAL_NAMES: Record<string, string> = {
  facebook: "Facebook",
  github: "GitHub",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
  x: "X",
  youtube: "YouTube",
};

function isEmail(field: CardDetailField) {
  return field.type === "email" || field.id.toLowerCase().includes("email");
}

function isPhone(field: CardDetailField) {
  const id = field.id.toLowerCase();
  return (
    field.type === "phone" || id.includes("phone") || id.includes("mobile")
  );
}

function getConnectionLabel(field: CardDetailField): string {
  const id = field.id.toLowerCase();
  const socialName = Object.entries(SOCIAL_NAMES).find(([key]) =>
    id.includes(key),
  )?.[1];
  if (socialName) return socialName;
  if (isEmail(field)) return "Email";
  if (isPhone(field)) return "Phone";
  if (id.includes("address") || id.includes("location")) return "Address";
  if (id.includes("portfolio")) return "Portfolio";
  if (id.includes("website") || field.type === "url") return "Website";
  return field.title || "Link";
}

function getConnectionPresentation(
  field: CardDetailField,
  showEmpty: boolean,
): ConnectionPresentation {
  return {
    label: getConnectionLabel(field),
    value: formatDisplayValue(field) || (showEmpty ? "Not added" : ""),
  };
}

type FontAwesome6Name = React.ComponentProps<typeof FontAwesome6>["name"];

function getConnectionIconName(field: CardDetailField): FontAwesome6Name {
  const id = field.id.toLowerCase();
  if (id.includes("linkedin")) return "linkedin-in";
  if (id === "x" || id.includes("twitter")) return "x-twitter";
  if (id.includes("github")) return "github";
  if (id.includes("instagram")) return "instagram";
  if (id.includes("whatsapp")) return "whatsapp";
  if (id.includes("youtube")) return "youtube";
  if (id.includes("facebook")) return "facebook-f";
  if (id.includes("tiktok")) return "tiktok";
  if (isEmail(field)) return "envelope";
  if (isPhone(field)) return "phone";
  if (id.includes("address") || id.includes("location")) return "location-dot";
  if (id.includes("portfolio")) return "briefcase";
  if (id.includes("website") || field.type === "url") return "globe";
  return "link";
}

function ConnectionIcon({
  color,
  field,
  size,
}: {
  color: string;
  field: CardDetailField;
  size: number;
}) {
  return (
    <FontAwesome6
      color={color}
      name={getConnectionIconName(field)}
      size={size}
    />
  );
}

export function ConnectionsSectionRenderer({
  compact = false,
  cardTheme,
  fullCardView = false,
  gradient,
  preserveTypeScale = false,
  section,
  seamless = false,
  showEmpty = false,
}: Props) {
  const boxed = compact && !seamless;
  const { width } = useWindowDimensions();
  const spacing = getCardSectionSpacing(width);
  const inFixedCardSlot = compact && (fullCardView || seamless);
  const fontFamily = getCardFontFamily(cardTheme.fontStyle);
  const letterSpacing = getCardLetterSpacing(cardTheme.fontStyle);
  const slots = resolveLayoutColorSlots({
    templateId: section.templateId,
    theme: cardTheme,
  });
  const rawFields = showEmpty
    ? section.fields
    : section.fields.filter(
        (field) => field.value && field.value.trim().length > 0,
      );
  const fields = rawFields;
  const densePreview = compact && fields.length > (inFixedCardSlot ? 3 : 4);
  const gridTileMinHeight = inFixedCardSlot
    ? densePreview
      ? 44
      : 52
    : compact
      ? 62
      : 94;
  const rowPaddingVertical = densePreview ? 4 : inFixedCardSlot ? 6 : 10;
  const useTwoColumns = compact || width >= 600;
  /** In the card view the section has a fixed height; rows and tiles grow to
   * fill it (up to a cap, so two contacts don't become giant boxes). */
  const fillSlot = inFixedCardSlot;
  const listRowFill = fillSlot
    ? ({
        flex: 1,
        maxHeight: 84,
        minHeight: 0,
        justifyContent: "center",
      } as const)
    : null;
  const listFill = fillSlot
    ? ({ flex: 1, justifyContent: "flex-start" } as const)
    : null;
  const fillIconBox = densePreview ? 34 : 40;
  const fillIconSize = densePreview ? 16 : 18;

  const renderGrid = (
    items: CardDetailField[],
    columns: number,
    gap: number,
    renderTile: (
      field: CardDetailField,
      tileStyle: ViewStyle,
    ) => React.ReactNode,
  ) => {
    if (fillSlot) {
      const rows: CardDetailField[][] = [];
      for (let i = 0; i < items.length; i += columns)
        rows.push(items.slice(i, i + columns));
      return (
        <View style={{ flex: 1, gap, justifyContent: "flex-start" }}>
          {rows.map((row, rowIndex) => (
            <View
              key={rowIndex}
              style={{
                flex: 1,
                flexDirection: "row",
                gap,
                maxHeight: 128,
                minHeight: 0,
              }}
            >
              {row.map((field) => renderTile(field, { flex: 1, minWidth: 0 }))}
              {Array.from({ length: columns - row.length }, (_, i) => (
                <View key={`spacer-${i}`} style={{ flex: 1 }} />
              ))}
            </View>
          ))}
        </View>
      );
    }
    const tileWidth = columns === 1 ? "100%" : "48.5%";
    return (
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap }}>
        {items.map((field) => renderTile(field, { width: tileWidth }))}
      </View>
    );
  };

  if (!fields.length) return null;

  const handlePress = (field: CardDetailField) => {
    const url = resolveActionUrl(field);
    if (!url) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Linking.openURL(url).catch(() => {});
  };

  const renderCopy = (
    presentation: ConnectionPresentation,
    color: string,
    mutedColor: string,
    align: "left" | "center" = "left",
  ) => (
    <View className="min-w-0 flex-1">
      <Text
        variant="none"
        numberOfLines={1}
        className={`${fillSlot && !densePreview ? "text-xs" : "text-[11px]"} font-semibold uppercase`}
        style={{
          color: mutedColor,
          fontFamily,
          letterSpacing,
          textAlign: align,
        }}
      >
        {presentation.label}
      </Text>
      <Text
        variant="none"
        {...(preserveTypeScale
          ? { numberOfLines: 1 }
          : { adjustsFontSizeToFit: true, minimumFontScale: 0.72, numberOfLines: 1 })}
        className={
          fillSlot
            ? densePreview
              ? "text-[15px] font-bold"
              : "text-base font-bold"
            : compact
              ? "text-[13px] font-bold"
              : "text-sm font-bold"
        }
        style={{
          color,
          fontFamily,
          fontVariant: ["tabular-nums"],
          letterSpacing,
          textAlign: align,
        }}
      >
        {presentation.value}
      </Text>
    </View>
  );

  // Quick Grid (minimal): compact square targets arranged as a responsive bento grid
  if (section.templateId === "minimal") {
    return (
      <View
        className={`overflow-hidden p-3 ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
        style={[
          {
            backgroundColor: slots.background,
            borderColor: boxed ? slots.accent : undefined,
            height: compact ? "100%" : undefined,
            minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        {renderGrid(fields, useTwoColumns ? 2 : 1, 8, (field, tileStyle) => {
          const presentation = getConnectionPresentation(field, showEmpty);
          return (
            <Pressable
              key={field.id}
              accessibilityRole="button"
              accessibilityLabel={`${presentation.label}: ${presentation.value}`}
              disabled={!resolveActionUrl(field)}
              onPress={() => handlePress(field)}
              className="items-center justify-center border p-3 active:opacity-70"
              style={[
                {
                  backgroundColor: slots.surface,
                  borderColor: slots.accent,
                  borderRadius: 10,
                  minHeight: fillSlot ? 0 : gridTileMinHeight,
                },
                tileStyle,
              ]}
            >
              <ConnectionIcon
                color={slots.accent}
                field={field}
                size={fillSlot ? fillIconSize + 2 : compact ? 17 : 22}
              />
              <View className="mt-2 w-full">
                {renderCopy(
                  presentation,
                  slots.textPrimary,
                  slots.textSecondary,
                  "center",
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  }

  // Gradient Cards (bold): action rows over theme gradient
  if (section.templateId === "bold") {
    const mutedOnGradient = slots.isDark
      ? "rgba(255,255,255,0.6)"
      : "rgba(15,23,42,0.6)";
    return (
      <LinearGradient
        colors={gradient}
        className={`overflow-hidden p-4 ${boxed ? "mb-5 rounded-[28px]" : ""}`}
        style={[
          {
            height: compact ? "100%" : undefined,
            minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
          },
          boxed ? BOXED_SHADOW_LG : null,
        ]}
      >
        <View className="gap-2" style={listFill}>
          {fields.map((field) => {
            const presentation = getConnectionPresentation(field, showEmpty);
            return (
              <Pressable
                key={field.id}
                accessibilityRole="button"
                accessibilityLabel={`${presentation.label}: ${presentation.value}`}
                disabled={!resolveActionUrl(field)}
                onPress={() => handlePress(field)}
                className="flex-row items-center border px-3 active:opacity-70"
                style={{
                  backgroundColor: slots.isDark
                    ? "rgba(15, 23, 42, 0.45)"
                    : "rgba(255, 255, 255, 0.25)",
                  borderColor: slots.isDark
                    ? "rgba(255, 255, 255, 0.18)"
                    : "rgba(0, 0, 0, 0.12)",
                  borderRadius: 10,
                  paddingVertical: rowPaddingVertical,
                  ...listRowFill,
                }}
              >
                <View
                  className="mr-3 items-center justify-center"
                  style={{
                    backgroundColor: slots.surface,
                    borderRadius: 8,
                    height: fillSlot ? fillIconBox : densePreview ? 28 : 36,
                    width: fillSlot ? fillIconBox : densePreview ? 28 : 36,
                  }}
                >
                  <ConnectionIcon
                    color={slots.accent}
                    field={field}
                    size={fillSlot ? fillIconSize : densePreview ? 14 : 18}
                  />
                </View>
                {renderCopy(presentation, slots.gradientText, mutedOnGradient)}
              </Pressable>
            );
          })}
        </View>
      </LinearGradient>
    );
  }

  // Frosted Dock (glass): icon-forward tiles with highlight accent
  if (section.templateId === "glass") {
    return (
      <View
        className={`overflow-hidden p-4 ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
        style={[
          {
            backgroundColor: slots.background,
            borderColor: boxed ? slots.highlight : undefined,
            height: compact ? "100%" : undefined,
            minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
          },
          boxed ? BOXED_SHADOW_MD : null,
        ]}
      >
        {renderGrid(fields, useTwoColumns ? 2 : 1, 10, (field, tileStyle) => {
          const presentation = getConnectionPresentation(field, showEmpty);
          return (
            <Pressable
              key={field.id}
              accessibilityRole="button"
              accessibilityLabel={`${presentation.label}: ${presentation.value}`}
              disabled={!resolveActionUrl(field)}
              onPress={() => handlePress(field)}
              className="overflow-hidden border active:opacity-70"
              style={[
                {
                  backgroundColor: slots.surface,
                  borderColor: slots.highlight,
                  borderRadius: 18,
                },
                tileStyle,
              ]}
            >
              <LinearGradient
                colors={gradient}
                style={{ height: 5, width: "100%" }}
              />
              <View className="flex-1 items-center justify-center px-3 py-3">
                <View
                  className="mb-2 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: slots.background,
                    height: fillSlot ? fillIconBox : 40,
                    width: fillSlot ? fillIconBox : 40,
                  }}
                >
                  <ConnectionIcon
                    color={slots.accent}
                    field={field}
                    size={fillSlot ? fillIconSize + 1 : 19}
                  />
                </View>
                {renderCopy(
                  presentation,
                  slots.textPrimary,
                  slots.textSecondary,
                  "center",
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  }

  // Command Dock (compact): a horizontal app-style dock. This intentionally
  // prioritizes fast recognition over the directory treatment used elsewhere.
  if (section.templateId === "compact") {
    return (
      <View
        className={`flex-row flex-wrap items-stretch justify-around overflow-hidden ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
        style={[
          {
            backgroundColor: slots.surface,
            borderColor: boxed ? slots.highlight : undefined,
            height: compact ? "100%" : undefined,
            minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
            alignContent: fillSlot ? "flex-start" : undefined,
            gap: spacing.gap,
            paddingBottom: spacing.vertical,
            paddingHorizontal: spacing.horizontal,
            paddingTop: spacing.tightVertical,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        {fields.map((field) => {
          const presentation = getConnectionPresentation(field, showEmpty);
          return (
            <Pressable
              key={field.id}
              accessibilityRole="button"
              accessibilityLabel={`${presentation.label}: ${presentation.value}`}
              disabled={!resolveActionUrl(field)}
              onPress={() => handlePress(field)}
              className="min-w-0 items-center justify-center px-1 active:opacity-70"
              style={{
                paddingVertical: densePreview ? 4 : 8,
                width: densePreview ? "24%" : `${100 / fields.length}%`,
              }}
            >
              <View
                className="items-center justify-center rounded-2xl"
                style={{
                  backgroundColor:
                    field === fields[0] ? slots.accent : `${slots.accent}14`,
                  height: fillSlot
                    ? densePreview
                      ? 44
                      : 52
                    : densePreview
                      ? 28
                      : 40,
                  width: fillSlot
                    ? densePreview
                      ? 44
                      : 52
                    : densePreview
                      ? 28
                      : 40,
                }}
              >
                <ConnectionIcon
                  color={field === fields[0] ? slots.background : slots.accent}
                  field={field}
                  size={
                    fillSlot ? (densePreview ? 18 : 22) : densePreview ? 12 : 16
                  }
                />
              </View>
              <Text
                variant="none"
                numberOfLines={1}
                className={`${densePreview ? "mt-1.5" : "mt-2"} ${fillSlot ? "text-xs" : densePreview ? "text-[10px]" : "text-[11px]"} font-extrabold`}
                style={{
                  color: slots.textPrimary,
                  fontFamily,
                  letterSpacing,
                  textAlign: "center",
                }}
              >
                {presentation.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  // Contact Ledger (editorial): structured enterprise directory with indexed rows.
  if (section.templateId === "editorial") {
    return (
      <View
        className={`overflow-hidden ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
        style={[
          {
            backgroundColor: slots.surface,
            borderColor: boxed ? slots.highlight : undefined,
            height: compact ? "100%" : undefined,
            minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
            paddingBottom: spacing.vertical,
            paddingHorizontal: spacing.horizontal,
            paddingTop: spacing.tightVertical,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <View style={listFill}>
          {fields.map((field, idx) => {
            const presentation = getConnectionPresentation(field, showEmpty);
            return (
              <Pressable
                key={field.id}
                accessibilityRole="button"
                accessibilityLabel={`${presentation.label}: ${presentation.value}`}
                disabled={!resolveActionUrl(field)}
                onPress={() => handlePress(field)}
                className="flex-row items-center active:opacity-70"
                style={{
                  borderBottomWidth: idx === fields.length - 1 ? 0 : 1,
                  borderBottomColor: slots.borderColor,
                  paddingVertical: densePreview ? 4 : 10,
                  ...listRowFill,
                }}
              >
                <View
                  className={`${densePreview ? "mr-2 w-5" : "mr-3 w-7"} items-center`}
                >
                  <Text
                    variant="none"
                    className="text-xs font-bold"
                    style={{ color: slots.accent, fontFamily }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </Text>
                  <View
                    className={`${densePreview ? "mt-0.5 h-2" : "mt-1 h-4"} w-px`}
                    style={{ backgroundColor: `${slots.accent}45` }}
                  />
                </View>
                <View
                  className="mr-3 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: `${slots.accent}14`,
                    height: fillSlot ? fillIconBox - 4 : densePreview ? 24 : 32,
                    width: fillSlot ? fillIconBox - 4 : densePreview ? 24 : 32,
                  }}
                >
                  <ConnectionIcon
                    color={slots.accent}
                    field={field}
                    size={fillSlot ? fillIconSize - 1 : densePreview ? 11 : 14}
                  />
                </View>
                {renderCopy(
                  presentation,
                  slots.textPrimary,
                  slots.textSecondary,
                )}
                <FontAwesome6
                  name="arrow-up-right-from-square"
                  size={12}
                  color={slots.textSecondary}
                  style={{ marginLeft: 8 }}
                />
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  // Hero Spotlight (spotlight): featured primary channel plus supporting grid
  if (section.templateId === "spotlight") {
    const [heroField, ...otherFields] = fields;
    const heroPresentation = heroField
      ? getConnectionPresentation(heroField, showEmpty)
      : null;

    return (
      <View
        className={`overflow-hidden p-3.5 gap-2.5 ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
        style={[
          {
            backgroundColor: slots.surface,
            borderColor: boxed ? slots.highlight : undefined,
            height: compact ? "100%" : undefined,
            minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
          },
          boxed ? BOXED_SHADOW_MD : null,
        ]}
      >
        {heroField && heroPresentation && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${heroPresentation.label}: ${heroPresentation.value}`}
            disabled={!resolveActionUrl(heroField)}
            onPress={() => handlePress(heroField)}
            className="flex-row items-center justify-between rounded-2xl p-3.5 active:opacity-80"
            style={{
              backgroundColor: slots.accent,
              minHeight: fillSlot ? 64 : undefined,
            }}
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View
                className={`mr-3 ${fillSlot ? "size-11" : "size-10"} items-center justify-center rounded-xl bg-white/20`}
              >
                <ConnectionIcon
                  color="#FFFFFF"
                  field={heroField}
                  size={fillSlot ? 20 : 18}
                />
              </View>
              <View className="flex-1 min-w-0">
                <Text
                  variant="none"
                  className={`${fillSlot ? "text-xs" : "text-[11px]"} font-semibold uppercase text-white/80`}
                >
                  {heroPresentation.label}
                </Text>
                <Text
                  variant="none"
                  {...(preserveTypeScale
                    ? { numberOfLines: 1 }
                    : { adjustsFontSizeToFit: true, minimumFontScale: 0.72, numberOfLines: 1 })}
                  className={`${fillSlot ? "text-base" : "text-sm"} font-bold tabular-nums text-white`}
                  style={{ fontFamily }}
                >
                  {heroPresentation.value}
                </Text>
              </View>
            </View>
            <FontAwesome6 name="chevron-right" size={14} color="#FFFFFF" />
          </Pressable>
        )}

        {otherFields.length > 0 &&
          renderGrid(
            otherFields,
            useTwoColumns ? 2 : 1,
            8,
            (field, tileStyle) => {
              const presentation = getConnectionPresentation(field, showEmpty);
              return (
                <Pressable
                  key={field.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${presentation.label}: ${presentation.value}`}
                  disabled={!resolveActionUrl(field)}
                  onPress={() => handlePress(field)}
                  className="flex-row items-center rounded-xl border px-3 py-2 active:opacity-70"
                  style={[
                    {
                      backgroundColor: slots.background,
                      borderColor: slots.highlight,
                    },
                    tileStyle,
                  ]}
                >
                  <ConnectionIcon
                    color={slots.accent}
                    field={field}
                    size={fillSlot ? fillIconSize - 1 : 15}
                  />
                  <View className="ml-2.5 flex-1 min-w-0">
                    <Text
                      variant="none"
                      {...(preserveTypeScale
                        ? { numberOfLines: 1 }
                        : { adjustsFontSizeToFit: true, minimumFontScale: 0.72, numberOfLines: 1 })}
                      className={`${fillSlot ? "text-sm" : "text-xs"} font-semibold tabular-nums`}
                      style={{ color: slots.textPrimary, fontFamily }}
                    >
                      {presentation.value}
                    </Text>
                  </View>
                </Pressable>
              );
            },
          )}
      </View>
    );
  }

  // Executive Directory (banner): uniform full-width directory actions.
  if (section.templateId === "banner") {
    return (
      <View
        className={`overflow-hidden ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
        style={[
          {
            backgroundColor: slots.background,
            borderColor: boxed ? slots.highlight : undefined,
            height: compact ? "100%" : undefined,
            minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
            gap: spacing.gap,
            justifyContent: fillSlot ? "flex-start" : undefined,
            paddingBottom: spacing.vertical,
            paddingHorizontal: spacing.horizontal,
            paddingTop: spacing.tightVertical,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        {fields.map((field) => {
          const presentation = getConnectionPresentation(field, showEmpty);
          return (
            <Pressable
              key={field.id}
              accessibilityRole="button"
              accessibilityLabel={`${presentation.label}: ${presentation.value}`}
              disabled={!resolveActionUrl(field)}
              onPress={() => handlePress(field)}
              className="flex-row items-center rounded-xl border active:opacity-70"
              style={{
                backgroundColor: slots.surface,
                borderColor: slots.highlight,
                paddingHorizontal: densePreview ? 10 : 14,
                paddingVertical: densePreview ? 5 : 10,
                ...listRowFill,
                ...(fillSlot ? { maxHeight: 64 } : null),
              }}
            >
              <ConnectionIcon
                color={slots.accent}
                field={field}
                size={fillSlot ? fillIconSize : densePreview ? 11 : 14}
              />
              <Text
                variant="none"
                numberOfLines={1}
                className={`ml-3 font-semibold ${fillSlot ? "text-base" : densePreview ? "text-xs" : "text-sm"}`}
                style={{ color: slots.textPrimary, fontFamily }}
              >
                {presentation.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  // Floating Tiles (cards): inset bento tiles
  if (section.templateId === "cards") {
    return (
      <View
        className={`overflow-hidden p-3.5 ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
        style={[
          {
            backgroundColor: slots.background,
            borderColor: boxed ? slots.highlight : undefined,
            height: compact ? "100%" : undefined,
            minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        {renderGrid(fields, useTwoColumns ? 2 : 1, 10, (field, tileStyle) => {
          const presentation = getConnectionPresentation(field, showEmpty);
          return (
            <Pressable
              key={field.id}
              accessibilityRole="button"
              accessibilityLabel={`${presentation.label}: ${presentation.value}`}
              disabled={!resolveActionUrl(field)}
              onPress={() => handlePress(field)}
              className="justify-center rounded-2xl border p-3.5 active:opacity-70"
              style={[
                {
                  backgroundColor: slots.surface,
                  borderColor: slots.highlight,
                },
                BOXED_SHADOW_SM,
                tileStyle,
              ]}
            >
              <View
                className="mb-2 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `${slots.accent}18`,
                  height: fillSlot ? fillIconBox - 2 : 36,
                  width: fillSlot ? fillIconBox - 2 : 36,
                }}
              >
                <ConnectionIcon
                  color={slots.accent}
                  field={field}
                  size={fillSlot ? fillIconSize : 17}
                />
              </View>
              {renderCopy(presentation, slots.textPrimary, slots.textSecondary)}
            </Pressable>
          );
        })}
      </View>
    );
  }

  // Icon Dock (badge): enterprise command dock with compact channel tiles
  if (section.templateId === "badge") {
    const dockItemWidth = compact ? "23.5%" : width >= 600 ? "23.5%" : "31.5%";
    const renderDockTile = (field: CardDetailField, tileStyle: ViewStyle) => {
      const presentation = getConnectionPresentation(field, showEmpty);
      return (
        <Pressable
          key={field.id}
          accessibilityRole="button"
          accessibilityLabel={`${presentation.label}: ${presentation.value}`}
          disabled={!resolveActionUrl(field)}
          onPress={() => handlePress(field)}
          className={`${compact ? "px-1.5 py-2" : "px-2 py-3"} items-center justify-center rounded-2xl border active:opacity-70`}
          style={[
            {
              backgroundColor: slots.surface,
              borderColor: slots.highlight,
              minHeight: fillSlot ? 0 : compact ? 62 : 76,
            },
            BOXED_SHADOW_SM,
            tileStyle,
          ]}
        >
          <View
            className="items-center justify-center rounded-xl"
            style={{
              backgroundColor: `${slots.accent}14`,
              width: fillSlot ? fillIconBox - 4 : compact ? 30 : 38,
              height: fillSlot ? fillIconBox - 4 : compact ? 30 : 38,
            }}
          >
            <ConnectionIcon
              color={slots.accent}
              field={field}
              size={fillSlot ? fillIconSize - 1 : compact ? 14 : 18}
            />
          </View>
          <Text
            variant="none"
            numberOfLines={1}
            className={`${compact ? "mt-1.5" : "mt-2"} ${fillSlot ? "text-xs" : "text-[11px]"} font-extrabold`}
            style={{
              color: slots.textPrimary,
              fontFamily,
              letterSpacing,
              textAlign: "center",
            }}
          >
            {presentation.label}
          </Text>
        </Pressable>
      );
    };
    return (
      <View
        className={`overflow-hidden ${compact ? "p-3" : "p-4"} ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
        style={[
          {
            backgroundColor: slots.background,
            borderColor: boxed ? slots.accent : undefined,
            height: compact ? "100%" : undefined,
            minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
          },
          boxed ? BOXED_SHADOW_MD : null,
        ]}
      >
        {fillSlot ? (
          renderGrid(fields, 4, 8, renderDockTile)
        ) : (
          <View className="flex-row flex-wrap items-stretch justify-between gap-y-2.5">
            {fields.map((field) =>
              renderDockTile(field, { width: dockItemWidth }),
            )}
          </View>
        )}
      </View>
    );
  }

  // Channel Matrix (split): two independent vertical rails separated by a
  // structural divider, unlike the tile grids used by the other layouts.
  if (section.templateId === "split") {
    const midpoint = Math.ceil(fields.length / 2);
    const columns = [fields.slice(0, midpoint), fields.slice(midpoint)];
    return (
      <View
        className={`overflow-hidden ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
        style={[
          {
            backgroundColor: slots.surface,
            borderColor: boxed ? slots.highlight : undefined,
            height: compact ? "100%" : undefined,
            minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
            paddingBottom: spacing.vertical,
            paddingHorizontal: spacing.horizontal,
            paddingTop: spacing.tightVertical,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <View className="flex-row" style={fillSlot ? { flex: 1 } : undefined}>
          {columns.map((column, columnIndex) => (
            <View
              key={columnIndex}
              className={`flex-1 ${columnIndex === 0 ? "pr-3" : "pl-3"}`}
              style={{
                borderRightWidth: columnIndex === 0 ? 1 : 0,
                borderRightColor: slots.borderColor,
                ...listFill,
              }}
            >
              {column.map((field, rowIndex) => {
                const presentation = getConnectionPresentation(
                  field,
                  showEmpty,
                );
                return (
                  <Pressable
                    key={field.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${presentation.label}: ${presentation.value}`}
                    disabled={!resolveActionUrl(field)}
                    onPress={() => handlePress(field)}
                    className="flex-row items-center active:opacity-70"
                    style={{
                      borderBottomWidth: rowIndex === column.length - 1 ? 0 : 1,
                      borderBottomColor: slots.borderColor,
                      paddingVertical: densePreview ? 5 : 12,
                      ...listRowFill,
                    }}
                  >
                    <View
                      className="mr-2.5 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: `${slots.accent}14`,
                        height: fillSlot
                          ? fillIconBox - 6
                          : densePreview
                            ? 24
                            : 32,
                        width: fillSlot
                          ? fillIconBox - 6
                          : densePreview
                            ? 24
                            : 32,
                      }}
                    >
                      <ConnectionIcon
                        color={slots.accent}
                        field={field}
                        size={
                          fillSlot ? fillIconSize - 2 : densePreview ? 10 : 14
                        }
                      />
                    </View>
                    <View className="min-w-0 flex-1">
                      {renderCopy(
                        presentation,
                        slots.textPrimary,
                        slots.textSecondary,
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    );
  }

  // Cyber Grid (neon): high-contrast tech readout rows
  if (section.templateId === "neon") {
    return (
      <View
        className={`gap-2.5 overflow-hidden p-4 ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
        style={[
          {
            justifyContent: fillSlot ? "flex-start" : undefined,
            backgroundColor: "#0F172A",
            borderColor: slots.accent,
            borderWidth: 1.5,
            height: compact ? "100%" : undefined,
            minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        {fields.map((field) => {
          const presentation = getConnectionPresentation(field, showEmpty);
          return (
            <Pressable
              key={field.id}
              accessibilityRole="button"
              accessibilityLabel={`${presentation.label}: ${presentation.value}`}
              disabled={!resolveActionUrl(field)}
              onPress={() => handlePress(field)}
              className={`flex-row items-center rounded-xl border px-3.5 active:opacity-70 ${densePreview ? "py-1.5" : "py-3"}`}
              style={{
                backgroundColor: "#1E293B",
                borderColor: slots.accent,
                borderWidth: 1,
                ...listRowFill,
              }}
            >
              <View
                className="mr-3 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: `${slots.accent}22`,
                  borderWidth: 1,
                  borderColor: slots.accent,
                  height: fillSlot ? fillIconBox - 4 : 32,
                  width: fillSlot ? fillIconBox - 4 : 32,
                }}
              >
                <ConnectionIcon
                  color={slots.accent}
                  field={field}
                  size={fillSlot ? fillIconSize - 1 : 15}
                />
              </View>
              {renderCopy(presentation, "#FFFFFF", slots.accent)}
              <View
                className="size-2 rounded-full"
                style={{ backgroundColor: slots.accent }}
              />
            </Pressable>
          );
        })}
      </View>
    );
  }

  // Action Tiles (classic): clean corporate directory rows
  return (
    <View
      className={`overflow-hidden px-4 py-2 ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
      style={[
        {
          justifyContent: fillSlot ? "flex-start" : undefined,
          backgroundColor: slots.surface,
          borderColor: boxed ? slots.accent : undefined,
          height: compact ? "100%" : undefined,
          minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
        },
        boxed ? BOXED_SHADOW_SM : null,
      ]}
    >
      {fields.map((field, index) => {
        const presentation = getConnectionPresentation(field, showEmpty);
        return (
          <Pressable
            key={field.id}
            accessibilityRole="button"
            accessibilityLabel={`${presentation.label}: ${presentation.value}`}
            disabled={!resolveActionUrl(field)}
            onPress={() => handlePress(field)}
            className="flex-row items-center active:opacity-70"
            style={{
              borderBottomColor: slots.borderColor,
              borderBottomWidth: index === fields.length - 1 ? 0 : 1,
              paddingVertical: rowPaddingVertical,
              ...listRowFill,
            }}
          >
            <View
              className="mr-4 items-center justify-center rounded-full"
              style={{
                backgroundColor: slots.accent,
                height: fillSlot ? fillIconBox : compact ? 38 : 52,
                width: fillSlot ? fillIconBox : compact ? 38 : 52,
              }}
            >
              <ConnectionIcon
                color={slots.background}
                field={field}
                size={fillSlot ? fillIconSize - 2 : compact ? 14 : 18}
              />
            </View>
            {renderCopy(presentation, slots.textPrimary, slots.textSecondary)}
          </Pressable>
        );
      })}
    </View>
  );
}
