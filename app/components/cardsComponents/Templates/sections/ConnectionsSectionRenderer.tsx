import React from "react";
import {
  Linking,
  Pressable,
  Share,
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
import { ConnectionsBottomDock } from "./ConnectionsBottomDock";
import { saveDirectlyToNativeContacts } from "@/utils/nativeContacts";

/** Floor only — unlike Identity/Professional/Bio, Connections legitimately
 * varies in height with the number of channels a user has added. This just
 * keeps a layout from looking near-collapsed when only 1-2 are present. */
const CONNECTIONS_MIN_HEIGHT = 110;

type Props = {
  cardMetadata?: {
    name?: string;
    title?: string;
    company?: string;
    id?: string;
  };
  compact?: boolean;
  contentDriven?: boolean;
  cardTheme: CardVisualTheme;
  fullCardView?: boolean;
  gradient: [string, string];
  interactiveActions?: boolean;
  onSaveContact?: () => void;
  onShareCard?: () => void;
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
  cardMetadata,
  compact = false,
  contentDriven = false,
  cardTheme,
  fullCardView = false,
  gradient,
  interactiveActions,
  onSaveContact,
  onShareCard,
  preserveTypeScale = false,
  section,
  seamless = false,
  showEmpty = false,
}: Props) {
  const boxed = compact && !seamless;
  const { width } = useWindowDimensions();
  const spacing = getCardSectionSpacing(width);
  const inFixedCardSlot =
    compact && !contentDriven && (fullCardView || seamless);
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
  // Homepage previews have a fixed-height contacts slot. Dense lists need a
  // compact rhythm so the action dock and its bottom inset remain fully visible.
  const fixedSlotFieldGap = inFixedCardSlot
    ? fields.length >= 5
      ? 6
      : 10
    : null;
  const gridTileMinHeight = inFixedCardSlot
    ? densePreview
      ? 44
      : 52
    : compact
      ? 62
      : 94;
  const useTwoColumns = compact || width >= 600;
  /** In the card view the section has a fixed height; rows and tiles grow to
   * fill it (up to a cap, so two contacts don't become giant boxes). */
  const fillSlot = inFixedCardSlot;
  const fillIconBox = densePreview ? 34 : 40;
  const fillIconSize = densePreview ? 16 : 18;

  const handleSaveContact = () => {
    if (onSaveContact) {
      onSaveContact();
      return;
    }
    const emailField = fields.find(isEmail)?.value;
    const phoneField = fields.find(isPhone)?.value;
    const websiteField = fields.find(
      (f) => f.id.includes("website") || f.type === "url",
    )?.value;
    const addressField = fields.find(
      (f) => f.id.includes("address") || f.id.includes("location"),
    )?.value;
    const socials: { label?: string; type?: string; url: string }[] = [];
    fields.forEach((f) => {
      if (
        f.value &&
        f.value !== websiteField &&
        (f.type === "url" ||
          f.id.includes("social") ||
          f.id.includes("link") ||
          f.id.includes("github") ||
          f.id.includes("linkedin") ||
          f.id.includes("twitter") ||
          f.id.includes("youtube") ||
          f.id.includes("instagram"))
      ) {
        socials.push({ label: f.title || f.type, type: f.type, url: f.value });
      }
    });

    void saveDirectlyToNativeContacts({
      name: cardMetadata?.name,
      title: cardMetadata?.title,
      company: cardMetadata?.company,
      email: emailField,
      phone: phoneField,
      website: websiteField,
      address: addressField,
      socials,
    });
  };

  const handleShareCard = () => {
    if (onShareCard) {
      onShareCard();
      return;
    }
    const shareMessage = cardMetadata?.name
      ? `Check out ${cardMetadata.name}'s digital business card on ProsCard!`
      : "Check out this digital business card on ProsCard!";
    void Share.share({
      message: shareMessage,
      title: cardMetadata?.name
        ? `${cardMetadata.name} | ProsCard`
        : "ProsCard",
    });
  };

  const renderDock = () => {
    if (!fullCardView) return null;
    return (
      <ConnectionsBottomDock
        accentColor={slots.accent}
        compact={compact}
        disabled={interactiveActions === false}
        fontFamily={fontFamily}
        letterSpacing={letterSpacing}
        onSaveContact={handleSaveContact}
        onShareCard={handleShareCard}
        surfaceColor={slots.surface}
        textColor={slots.textPrimary}
      />
    );
  };

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
        <View
          style={{
            gap,
            width: "100%",
          }}
        >
          {rows.map((row, rowIndex) => (
            <View
              key={rowIndex}
              style={{
                flexDirection: "row",
                gap,
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
          : {
              adjustsFontSizeToFit: true,
              minimumFontScale: 0.72,
              numberOfLines: 1,
            })}
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
            height: compact && !contentDriven ? "100%" : undefined,
            minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <View
          style={{
            flex: contentDriven ? undefined : 1,
            justifyContent: "flex-start",
            paddingTop: 8,
            width: "100%",
          }}
        >
          <View style={{ width: "100%" }}>
            {renderGrid(
              fields,
              useTwoColumns ? 2 : 1,
              8,
              (field, tileStyle) => {
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
                    className="items-center justify-center border p-2.5 active:opacity-70"
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
                    <View className="mt-1.5 w-full">
                      {renderCopy(
                        presentation,
                        slots.textPrimary,
                        slots.textSecondary,
                        "center",
                      )}
                    </View>
                  </Pressable>
                );
              },
            )}
          </View>
          <View style={{ marginTop: 14 }}>{renderDock()}</View>
        </View>
      </View>
    );
  }

  // Gradient Cards (bold): action rows over theme gradient
  if (section.templateId === "bold") {
    const fieldGap =
      fixedSlotFieldGap ??
      (fields.length <= 4 ? 24 : fields.length === 5 ? 22 : 16);
    const mutedOnGradient = slots.isDark
      ? "rgba(255,255,255,0.6)"
      : "rgba(15,23,42,0.6)";
    return (
      <LinearGradient
        colors={gradient}
        className={`overflow-hidden p-4 ${boxed ? "mb-5 rounded-[28px]" : ""}`}
        style={[
          {
            height: compact && !contentDriven ? "100%" : undefined,
            minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
          },
          boxed ? BOXED_SHADOW_LG : null,
        ]}
      >
        <View
          style={{
            flex: contentDriven ? undefined : 1,
            justifyContent: "flex-start",
            paddingTop: 8,
            width: "100%",
          }}
        >
          <View style={{ gap: fieldGap, width: "100%" }}>
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
                    paddingVertical: densePreview ? 6 : 8,
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
                  {renderCopy(
                    presentation,
                    slots.gradientText,
                    mutedOnGradient,
                  )}
                </Pressable>
              );
            })}
          </View>
          <View style={{ marginTop: fieldGap }}>{renderDock()}</View>
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
            height: compact && !contentDriven ? "100%" : undefined,
            minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
          },
          boxed ? BOXED_SHADOW_MD : null,
        ]}
      >
        <View
          style={{
            flex: contentDriven ? undefined : 1,
            justifyContent: "flex-start",
            paddingTop: 8,
            width: "100%",
          }}
        >
          <View style={{ width: "100%" }}>
            {renderGrid(
              fields,
              useTwoColumns ? 2 : 1,
              10,
              (field, tileStyle) => {
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
                    <View className="flex-1 items-center justify-center px-3 py-2.5">
                      <View
                        className="mb-1.5 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: slots.background,
                          height: fillSlot ? fillIconBox : 36,
                          width: fillSlot ? fillIconBox : 36,
                        }}
                      >
                        <ConnectionIcon
                          color={slots.accent}
                          field={field}
                          size={fillSlot ? fillIconSize + 1 : 18}
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
              },
            )}
          </View>
          <View style={{ marginTop: 14 }}>{renderDock()}</View>
        </View>
      </View>
    );
  }

  // Direct Contact List (compact): a borderless, scannable list inspired by
  // modern contact cards. Circular channel icons anchor each actionable value.
  if (section.templateId === "compact") {
    const fieldGap =
      fixedSlotFieldGap ??
      (fields.length <= 4 ? 24 : fields.length === 5 ? 22 : 16);
    return (
      <View
        className={`overflow-hidden ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
        style={[
          {
            backgroundColor: slots.surface,
            borderColor: boxed ? slots.highlight : undefined,
            height: compact && !contentDriven ? "100%" : undefined,
            minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
            paddingBottom: spacing.vertical,
            paddingHorizontal: spacing.horizontal,
            paddingTop: spacing.tightVertical,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <View
          style={{
            flex: contentDriven ? undefined : 1,
            justifyContent: "flex-start",
            paddingTop: 8,
            width: "100%",
          }}
        >
          <View style={{ gap: fieldGap, width: "100%" }}>
            {fields.map((field) => {
              const presentation = getConnectionPresentation(field, showEmpty);
              const iconSize = 18;
              const iconContainerSize = 40;
              return (
                <Pressable
                  key={field.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${presentation.label}: ${presentation.value}`}
                  disabled={!resolveActionUrl(field)}
                  onPress={() => handlePress(field)}
                  className="min-w-0 flex-row items-center active:opacity-70"
                  style={{ gap: 12 }}
                >
                  <View
                    className="items-center justify-center rounded-full"
                    style={{
                      backgroundColor: slots.accent,
                      height: iconContainerSize,
                      width: iconContainerSize,
                    }}
                  >
                    <ConnectionIcon
                      color={slots.background}
                      field={field}
                      size={iconSize}
                    />
                  </View>
                  <Text
                    variant="none"
                    numberOfLines={2}
                    className="min-w-0 flex-1 font-bold text-sm"
                    style={{
                      color: slots.textPrimary,
                      fontFamily,
                      letterSpacing,
                    }}
                  >
                    {presentation.value || presentation.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={{ marginTop: fieldGap }}>{renderDock()}</View>
        </View>
      </View>
    );
  }

  // Contact Ledger (editorial): structured enterprise directory rows.
  if (section.templateId === "editorial") {
    const fieldGap =
      fixedSlotFieldGap ??
      (fields.length <= 4 ? 24 : fields.length === 5 ? 22 : 16);
    return (
      <View
        className={`overflow-hidden ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
        style={[
          {
            backgroundColor: slots.surface,
            borderColor: boxed ? slots.highlight : undefined,
            height: compact && !contentDriven ? "100%" : undefined,
            minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
            paddingBottom: spacing.vertical,
            paddingHorizontal: spacing.horizontal,
            paddingTop: spacing.tightVertical,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <View
          style={{
            flex: contentDriven ? undefined : 1,
            justifyContent: "flex-start",
            paddingTop: 8,
            width: "100%",
          }}
        >
          <View style={{ gap: fieldGap, width: "100%" }}>
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
                    paddingBottom:
                      idx === fields.length - 1 ? 0 : Math.round(fieldGap / 2),
                  }}
                >
                  <View
                    className="mr-3 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: `${slots.accent}14`,
                      height: 28,
                      width: 28,
                    }}
                  >
                    <ConnectionIcon
                      color={slots.accent}
                      field={field}
                      size={12}
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
          <View style={{ marginTop: fieldGap }}>{renderDock()}</View>
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
            height: compact && !contentDriven ? "100%" : undefined,
            minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
          },
          boxed ? BOXED_SHADOW_MD : null,
        ]}
      >
        <View
          style={{
            flex: contentDriven ? undefined : 1,
            justifyContent: "flex-start",
            paddingTop: 8,
            width: "100%",
          }}
        >
          <View style={{ gap: 8, width: "100%" }}>
            {heroField && heroPresentation && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${heroPresentation.label}: ${heroPresentation.value}`}
                disabled={!resolveActionUrl(heroField)}
                onPress={() => handlePress(heroField)}
                className="flex-row items-center justify-between rounded-2xl p-3 active:opacity-80"
                style={{
                  backgroundColor: slots.accent,
                  minHeight: fillSlot ? 56 : undefined,
                }}
              >
                <View className="flex-row items-center flex-1 mr-2">
                  <View
                    className={`mr-3 ${fillSlot ? "size-10" : "size-9"} items-center justify-center rounded-xl bg-white/20`}
                  >
                    <ConnectionIcon
                      color="#FFFFFF"
                      field={heroField}
                      size={fillSlot ? 18 : 16}
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
                        : {
                            adjustsFontSizeToFit: true,
                            minimumFontScale: 0.72,
                            numberOfLines: 1,
                          })}
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
                            : {
                                adjustsFontSizeToFit: true,
                                minimumFontScale: 0.72,
                                numberOfLines: 1,
                              })}
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
          <View style={{ marginTop: 14 }}>{renderDock()}</View>
        </View>
      </View>
    );
  }

  // Executive Directory (banner): uniform full-width directory actions.
  if (section.templateId === "banner") {
    const fieldGap =
      fixedSlotFieldGap ??
      (fields.length <= 4 ? 16 : fields.length === 5 ? 13 : 10);
    const boxMinHeight = fillSlot ? (fields.length <= 4 ? 64 : 56) : 52;
    return (
      <View
        className={`overflow-hidden ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
        style={[
          {
            backgroundColor: slots.background,
            borderColor: boxed ? slots.highlight : undefined,
            height: compact && !contentDriven ? "100%" : undefined,
            minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
            paddingBottom: spacing.vertical,
            paddingHorizontal: spacing.horizontal,
            paddingTop: spacing.tightVertical,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <View
          style={{
            flex: contentDriven ? undefined : 1,
            justifyContent: "flex-start",
            paddingTop: 8,
            width: "100%",
          }}
        >
          <View style={{ gap: fieldGap, width: "100%" }}>
            {fields.map((field) => {
              const presentation = getConnectionPresentation(field, showEmpty);
              return (
                <Pressable
                  key={field.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${presentation.label}: ${presentation.value}`}
                  disabled={!resolveActionUrl(field)}
                  onPress={() => handlePress(field)}
                  className="flex-row items-center rounded-2xl border active:opacity-70"
                  style={{
                    backgroundColor: slots.surface,
                    borderColor: slots.highlight,
                    minHeight: boxMinHeight,
                    paddingHorizontal: 16,
                    paddingVertical: densePreview ? 10 : 14,
                  }}
                >
                  <ConnectionIcon
                    color={slots.accent}
                    field={field}
                    size={fillSlot ? 17 : densePreview ? 13 : 15}
                  />
                  <Text
                    variant="none"
                    numberOfLines={1}
                    className={`ml-3 flex-1 min-w-0 font-semibold ${fillSlot ? "text-base" : densePreview ? "text-xs" : "text-sm"}`}
                    style={{ color: slots.textPrimary, fontFamily }}
                  >
                    {presentation.value || presentation.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={{ marginTop: fieldGap }}>{renderDock()}</View>
        </View>
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
            height: compact && !contentDriven ? "100%" : undefined,
            minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <View
          style={{
            flex: contentDriven ? undefined : 1,
            justifyContent: "flex-start",
            paddingTop: 8,
            width: "100%",
          }}
        >
          <View style={{ width: "100%" }}>
            {renderGrid(
              fields,
              useTwoColumns ? 2 : 1,
              8,
              (field, tileStyle) => {
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
                    className="justify-center rounded-2xl border p-3 active:opacity-70"
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
                      className="mb-1.5 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: `${slots.accent}18`,
                        height: fillSlot ? fillIconBox - 4 : 34,
                        width: fillSlot ? fillIconBox - 4 : 34,
                      }}
                    >
                      <ConnectionIcon
                        color={slots.accent}
                        field={field}
                        size={fillSlot ? fillIconSize : 16}
                      />
                    </View>
                    {renderCopy(
                      presentation,
                      slots.textPrimary,
                      slots.textSecondary,
                    )}
                  </Pressable>
                );
              },
            )}
          </View>
          <View style={{ marginTop: 14 }}>{renderDock()}</View>
        </View>
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
          className={`${compact ? "px-1.5 py-2" : "px-2 py-2.5"} items-center justify-center rounded-2xl border active:opacity-70`}
          style={[
            {
              backgroundColor: slots.surface,
              borderColor: slots.highlight,
              minHeight: fillSlot ? 0 : compact ? 58 : 70,
            },
            BOXED_SHADOW_SM,
            tileStyle,
          ]}
        >
          <View
            className="items-center justify-center rounded-xl"
            style={{
              backgroundColor: `${slots.accent}14`,
              width: fillSlot ? fillIconBox - 4 : compact ? 30 : 36,
              height: fillSlot ? fillIconBox - 4 : compact ? 30 : 36,
            }}
          >
            <ConnectionIcon
              color={slots.accent}
              field={field}
              size={fillSlot ? fillIconSize - 1 : compact ? 14 : 17}
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
            height: compact && !contentDriven ? "100%" : undefined,
            minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
          },
          boxed ? BOXED_SHADOW_MD : null,
        ]}
      >
        <View
          style={{
            flex: contentDriven ? undefined : 1,
            justifyContent: "flex-start",
            paddingTop: 8,
            width: "100%",
          }}
        >
          <View style={{ width: "100%" }}>
            {fillSlot ? (
              renderGrid(fields, 4, 8, renderDockTile)
            ) : (
              <View className="flex-row flex-wrap items-stretch justify-between gap-y-2">
                {fields.map((field) =>
                  renderDockTile(field, { width: dockItemWidth }),
                )}
              </View>
            )}
          </View>
          <View style={{ marginTop: 14 }}>{renderDock()}</View>
        </View>
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
            height: compact && !contentDriven ? "100%" : undefined,
            minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
            paddingBottom: spacing.vertical,
            paddingHorizontal: spacing.horizontal,
            paddingTop: spacing.tightVertical,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <View
          style={{
            flex: contentDriven ? undefined : 1,
            justifyContent: "flex-start",
            paddingTop: 8,
            width: "100%",
          }}
        >
          <View style={{ width: "100%" }}>
            <View className="flex-row">
              {columns.map((column, columnIndex) => (
                <View
                  key={columnIndex}
                  className={`flex-1 ${columnIndex === 0 ? "pr-3" : "pl-3"}`}
                  style={{
                    borderRightWidth: columnIndex === 0 ? 1 : 0,
                    borderRightColor: slots.borderColor,
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
                          borderBottomWidth:
                            rowIndex === column.length - 1 ? 0 : 1,
                          borderBottomColor: slots.borderColor,
                          paddingVertical: densePreview ? 4 : 6,
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
                                : 30,
                            width: fillSlot
                              ? fillIconBox - 6
                              : densePreview
                                ? 24
                                : 30,
                          }}
                        >
                          <ConnectionIcon
                            color={slots.accent}
                            field={field}
                            size={
                              fillSlot
                                ? fillIconSize - 2
                                : densePreview
                                  ? 10
                                  : 14
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
          <View style={{ marginTop: 14 }}>{renderDock()}</View>
        </View>
      </View>
    );
  }

  // Cyber Grid (neon): high-contrast tech readout rows
  if (section.templateId === "neon") {
    const fieldGap =
      fixedSlotFieldGap ??
      (fields.length <= 4 ? 24 : fields.length === 5 ? 22 : 16);
    return (
      <View
        className={`gap-2.5 overflow-hidden p-4 ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
        style={[
          {
            backgroundColor: "#0F172A",
            borderColor: slots.accent,
            borderWidth: 1.5,
            height: compact && !contentDriven ? "100%" : undefined,
            minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
          },
          boxed ? BOXED_SHADOW_SM : null,
        ]}
      >
        <View
          style={{
            flex: contentDriven ? undefined : 1,
            justifyContent: "flex-start",
            paddingTop: 8,
            width: "100%",
          }}
        >
          <View
            style={{
              gap: fieldGap,
              width: "100%",
            }}
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
                  className={`flex-row items-center rounded-xl border px-3.5 active:opacity-70 ${densePreview ? "py-1.5" : "py-2"}`}
                  style={{
                    backgroundColor: "#1E293B",
                    borderColor: slots.accent,
                    borderWidth: 1,
                  }}
                >
                  <View
                    className="mr-3 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: `${slots.accent}22`,
                      borderWidth: 1,
                      borderColor: slots.accent,
                      height: fillSlot ? fillIconBox - 6 : 30,
                      width: fillSlot ? fillIconBox - 6 : 30,
                    }}
                  >
                    <ConnectionIcon
                      color={slots.accent}
                      field={field}
                      size={fillSlot ? fillIconSize - 1 : 14}
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
          <View style={{ marginTop: fieldGap }}>{renderDock()}</View>
        </View>
      </View>
    );
  }

  // Action Tiles (classic): clean corporate directory rows
  const fieldGap =
    fixedSlotFieldGap ??
    (fields.length <= 4 ? 24 : fields.length === 5 ? 22 : 16);
  return (
    <View
      className={`overflow-hidden px-4 py-2 ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
      style={[
        {
          justifyContent: fillSlot ? "flex-start" : undefined,
          backgroundColor: slots.surface,
          borderColor: boxed ? slots.accent : undefined,
          height: compact && !contentDriven ? "100%" : undefined,
          minHeight: compact ? undefined : CONNECTIONS_MIN_HEIGHT,
        },
        boxed ? BOXED_SHADOW_SM : null,
      ]}
    >
      <View
        style={{
          flex: contentDriven ? undefined : 1,
          justifyContent: "flex-start",
          paddingTop: 8,
          width: "100%",
        }}
      >
        <View
          style={{
            gap: fieldGap,
            width: "100%",
          }}
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
                  paddingBottom:
                    index === fields.length - 1 ? 0 : Math.round(fieldGap / 2),
                }}
              >
                <View
                  className="mr-4 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: slots.accent,
                    height: fillSlot ? fillIconBox : compact ? 36 : 46,
                    width: fillSlot ? fillIconBox : compact ? 36 : 46,
                  }}
                >
                  <ConnectionIcon
                    color={slots.accentText}
                    field={field}
                    size={fillSlot ? fillIconSize - 2 : compact ? 14 : 18}
                  />
                </View>
                {renderCopy(
                  presentation,
                  slots.textPrimary,
                  slots.textSecondary,
                )}
              </Pressable>
            );
          })}
        </View>
        <View style={{ marginTop: fieldGap }}>{renderDock()}</View>
      </View>
    </View>
  );
}
