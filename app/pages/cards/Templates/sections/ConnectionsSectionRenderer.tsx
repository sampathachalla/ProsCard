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
import { Text } from "@/common/ui/Text";
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
  homepagePreview?: boolean;
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
  if (isEmail(field)) return field.title || "Email";
  if (isPhone(field)) {
    if (
      field.title &&
      field.title.toLowerCase() !== "phone" &&
      field.title.toLowerCase() !== "mobile"
    ) {
      return field.title;
    }
    return "Number";
  }
  if (id.includes("address") || id.includes("location")) return field.title || "Address";
  if (id.includes("portfolio")) return field.title || "Portfolio";
  if (id.includes("website") || field.type === "url") return field.title || "Website";
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

function getChannelGradient(
  field: CardDetailField,
  defaultColor: string,
): [string, string] {
  const id = field.id.toLowerCase();
  if (isPhone(field)) return ["#22c55e", "#16a34a"];
  if (isEmail(field)) return ["#38bdf8", "#2563eb"];
  if (id.includes("whatsapp")) return ["#25d366", "#128c7e"];
  if (id.includes("linkedin")) return ["#0ea5e9", "#0284c7"];
  if (id.includes("instagram")) return ["#f43f5e", "#be185d"];
  if (id.includes("youtube")) return ["#ef4444", "#dc2626"];
  if (id === "x" || id.includes("twitter")) return ["#334155", "#0f172a"];
  if (id.includes("github")) return ["#1e293b", "#0f172a"];
  if (id.includes("facebook")) return ["#3b82f6", "#1d4ed8"];
  if (id.includes("tiktok")) return ["#1f2937", "#111827"];
  if (id.includes("address") || id.includes("location")) return ["#f59e0b", "#d97706"];
  if (id.includes("portfolio") || id.includes("website") || field.type === "url")
    return ["#8b5cf6", "#6366f1"];
  return [defaultColor, defaultColor];
}

function ChannelSquircleIcon({
  defaultColor,
  field,
  iconSize = 20,
  rounded = 14,
  size = 46,
}: {
  defaultColor: string;
  field: CardDetailField;
  iconSize?: number;
  rounded?: number;
  size?: number;
}) {
  const gradientColors = getChannelGradient(field, defaultColor);
  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: rounded,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: gradientColors[0],
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.28,
        shadowRadius: 5,
        elevation: 3,
      }}
    >
      <FontAwesome6
        color="#ffffff"
        name={getConnectionIconName(field)}
        size={iconSize}
      />
    </LinearGradient>
  );
}

export function ConnectionsSectionRenderer({
  cardMetadata,
  compact = false,
  contentDriven = false,
  cardTheme,
  fullCardView = false,
  gradient,
  homepagePreview = false,
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
  const compactHomepagePreview = homepagePreview && inFixedCardSlot;
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
  const fillIconBox = compactHomepagePreview ? 28 : densePreview ? 34 : 40;
  const fillIconSize = compactHomepagePreview ? 14 : densePreview ? 16 : 18;

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
      ? `Check out ${cardMetadata.name}'s digital business card on VC Pros!`
      : "Check out this digital business card on VC Pros!";
    void Share.share({
      message: shareMessage,
      title: cardMetadata?.name
        ? `${cardMetadata.name} | VC Pros`
        : "VC Pros",
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
        previewCompact={compactHomepagePreview}
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

  const interactiveActionUrl = (field: CardDetailField) =>
    interactiveActions === false ? null : resolveActionUrl(field);

  const handlePress = (field: CardDetailField) => {
    const url = interactiveActionUrl(field);
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
          compactHomepagePreview
            ? "text-[13px] font-semibold"
            : fillSlot
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
                    disabled={!interactiveActionUrl(field)}
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



  // Direct Contact List (New) [Welcome Page Midnight Aesthetic with Channel Squircle Icons]
  if (section.templateId === "compact-new") {
    const fieldGap =
      fixedSlotFieldGap ??
      (fields.length <= 4 ? 18 : fields.length === 5 ? 14 : 12);
    const squircleSize = compactHomepagePreview ? 34 : 42;
    const squircleIconSize = compactHomepagePreview ? 15 : 18;
    const squircleRadius = compactHomepagePreview ? 10 : 12;

    return (
      <View
        className={`overflow-hidden ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
        style={[
          {
            backgroundColor: "#070d1e",
            borderColor: "rgba(56, 189, 248, 0.25)",
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
          <View className="mb-2.5 self-start rounded-full border border-sky-400/25 bg-sky-500/10 px-3 py-1">
            <Text
              variant="none"
              className="text-[11px] font-bold tracking-wider text-sky-400 uppercase"
            >
              DIRECT CONNECT
            </Text>
          </View>
          <View style={{ gap: fieldGap, width: "100%" }}>
            {fields.map((field) => {
              const presentation = getConnectionPresentation(field, showEmpty);
              return (
                <Pressable
                  key={field.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${presentation.label}: ${presentation.value}`}
                  disabled={!interactiveActionUrl(field)}
                  onPress={() => handlePress(field)}
                  className="min-w-0 flex-row items-center rounded-2xl border px-3.5 py-2.5 active:opacity-75"
                  style={{
                    backgroundColor: "#0a1128",
                    borderColor: "rgba(56, 189, 248, 0.2)",
                    gap: 12,
                  }}
                >
                  <ChannelSquircleIcon
                    defaultColor="#38bdf8"
                    field={field}
                    iconSize={squircleIconSize}
                    rounded={squircleRadius}
                    size={squircleSize}
                  />
                  <View className="min-w-0 flex-1">
                    <Text
                      variant="none"
                      numberOfLines={1}
                      className="text-[10px] font-bold tracking-wider uppercase text-sky-400"
                      style={{ fontFamily, letterSpacing }}
                    >
                      {presentation.label}
                    </Text>
                    <Text
                      variant="none"
                      numberOfLines={1}
                      className="text-sm font-bold text-white"
                      style={{ fontFamily, letterSpacing }}
                    >
                      {presentation.value || presentation.label}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
          <View style={{ marginTop: fieldGap }}>{renderDock()}</View>
        </View>
      </View>
    );
  }

  // Direct Contact List (compact): Popl-style clean list with vivid squircle icons
  if (section.templateId === "compact") {
    const fieldGap =
      fixedSlotFieldGap ??
      (fields.length <= 4 ? 20 : fields.length === 5 ? 18 : 14);
    const squircleSize = compactHomepagePreview ? 34 : densePreview ? 40 : fillSlot ? 44 : 46;
    const squircleIconSize = compactHomepagePreview ? 15 : densePreview ? 17 : 19;
    const squircleRadius = compactHomepagePreview ? 10 : 13;

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
              return (
                <Pressable
                  key={field.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${presentation.label}: ${presentation.value}`}
                  disabled={!interactiveActionUrl(field)}
                  onPress={() => handlePress(field)}
                  className="min-w-0 flex-row items-center active:opacity-75"
                  style={{ gap: 14 }}
                >
                  <ChannelSquircleIcon
                    defaultColor={slots.accent}
                    field={field}
                    iconSize={squircleIconSize}
                    rounded={squircleRadius}
                    size={squircleSize}
                  />
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

  // Contact Ledger (New) [Welcome Page Specular Ledger]
  if (section.templateId === "editorial-new") {
    const fieldGap =
      fixedSlotFieldGap ??
      (fields.length <= 4 ? 16 : fields.length === 5 ? 14 : 10);
    const squircleSize = compactHomepagePreview ? 30 : 36;
    const squircleIconSize = compactHomepagePreview ? 13 : 16;
    const squircleRadius = compactHomepagePreview ? 8 : 10;

    return (
      <View
        className={`overflow-hidden ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
        style={[
          {
            backgroundColor: "#070d1e",
            borderColor: "rgba(56, 189, 248, 0.25)",
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
          <View className="mb-2.5 flex-row items-center justify-between pb-1.5 border-b border-sky-400/20">
            <View className="rounded-full border border-sky-400/25 bg-sky-500/10 px-2.5 py-0.5">
              <Text
                variant="none"
                className="text-[10px] font-bold tracking-wider text-sky-400 uppercase"
              >
                CONTACT LEDGER
              </Text>
            </View>
            <View className="h-2 w-2 rounded-full bg-sky-400 shadow-md shadow-sky-400/50" />
          </View>
          <View style={{ gap: fieldGap, width: "100%" }}>
            {fields.map((field) => {
              const presentation = getConnectionPresentation(field, showEmpty);
              return (
                <Pressable
                  key={field.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${presentation.label}: ${presentation.value}`}
                  disabled={!interactiveActionUrl(field)}
                  onPress={() => handlePress(field)}
                  className="flex-row items-center rounded-xl border active:opacity-70 px-3 py-2.5"
                  style={{
                    backgroundColor: "#0a1128",
                    borderColor: "rgba(56, 189, 248, 0.15)",
                    borderLeftWidth: 3,
                    borderLeftColor: "#38bdf8",
                  }}
                >
                  <View className="mr-3">
                    <ChannelSquircleIcon
                      defaultColor="#38bdf8"
                      field={field}
                      iconSize={squircleIconSize}
                      rounded={squircleRadius}
                      size={squircleSize}
                    />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text
                      variant="none"
                      numberOfLines={1}
                      className="text-[10px] font-bold tracking-wider uppercase text-slate-400"
                      style={{ fontFamily, letterSpacing }}
                    >
                      {presentation.label}
                    </Text>
                    <Text
                      variant="none"
                      numberOfLines={1}
                      className="text-sm font-bold text-white"
                      style={{ fontFamily, letterSpacing }}
                    >
                      {presentation.value || presentation.label}
                    </Text>
                  </View>
                  <FontAwesome6
                    name="chevron-right"
                    size={11}
                    color="#38bdf8"
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

  // Contact Ledger (editorial): structured enterprise directory rows.
  if (section.templateId === "editorial") {
    const fieldGap =
      fixedSlotFieldGap ??
      (fields.length <= 4 ? 20 : fields.length === 5 ? 18 : 14);
    const squircleSize = compactHomepagePreview ? 30 : 36;
    const squircleIconSize = compactHomepagePreview ? 13 : 16;
    const squircleRadius = compactHomepagePreview ? 8 : 10;

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
                  disabled={!interactiveActionUrl(field)}
                  onPress={() => handlePress(field)}
                  className="flex-row items-center active:opacity-70"
                  style={{
                    borderBottomWidth: idx === fields.length - 1 ? 0 : 1,
                    borderBottomColor: slots.borderColor,
                    paddingBottom:
                      idx === fields.length - 1 ? 0 : Math.round(fieldGap / 2),
                  }}
                >
                  <View className="mr-3">
                    <ChannelSquircleIcon
                      defaultColor={slots.accent}
                      field={field}
                      iconSize={squircleIconSize}
                      rounded={squircleRadius}
                      size={squircleSize}
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
                disabled={!interactiveActionUrl(heroField)}
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
                      disabled={!interactiveActionUrl(field)}
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

  // Executive Directory (New) [Welcome Page Directory Action Buttons with ChannelSquircleIcon]
  if (section.templateId === "banner-new") {
    const fieldGap =
      fixedSlotFieldGap ??
      (fields.length <= 4 ? 14 : fields.length === 5 ? 12 : 10);
    const squircleSize = compactHomepagePreview ? 32 : 38;
    const squircleIconSize = compactHomepagePreview ? 14 : 17;
    const squircleRadius = compactHomepagePreview ? 9 : 11;

    return (
      <View
        className={`overflow-hidden ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
        style={[
          {
            backgroundColor: "#070d1e",
            borderColor: "rgba(56, 189, 248, 0.25)",
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
          <View className="mb-2 self-start rounded-full border border-sky-400/25 bg-sky-500/10 px-3 py-1">
            <Text
              variant="none"
              className="text-[11px] font-bold tracking-wider text-sky-400 uppercase"
            >
              EXECUTIVE DIRECTORY
            </Text>
          </View>
          <View style={{ gap: fieldGap, width: "100%" }}>
            {fields.map((field) => {
              const presentation = getConnectionPresentation(field, showEmpty);
              return (
                <Pressable
                  key={field.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${presentation.label}: ${presentation.value}`}
                  disabled={!interactiveActionUrl(field)}
                  onPress={() => handlePress(field)}
                  className="flex-row items-center rounded-2xl border px-4 py-3 active:opacity-75"
                  style={{
                    backgroundColor: "#0a1128",
                    borderColor: "rgba(56, 189, 248, 0.25)",
                  }}
                >
                  <View className="mr-3">
                    <ChannelSquircleIcon
                      defaultColor="#38bdf8"
                      field={field}
                      iconSize={squircleIconSize}
                      rounded={squircleRadius}
                      size={squircleSize}
                    />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text
                      variant="none"
                      numberOfLines={1}
                      className="text-[10px] font-bold tracking-wider uppercase text-sky-400"
                      style={{ fontFamily, letterSpacing }}
                    >
                      {presentation.label}
                    </Text>
                    <Text
                      variant="none"
                      numberOfLines={1}
                      className="font-bold text-sm text-white"
                      style={{ fontFamily }}
                    >
                      {presentation.value || presentation.label}
                    </Text>
                  </View>
                  <FontAwesome6
                    name="arrow-right"
                    size={12}
                    color="#38bdf8"
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

  // Executive Directory (banner): uniform full-width directory actions with ChannelSquircleIcon
  if (section.templateId === "banner") {
    const fieldGap =
      fixedSlotFieldGap ??
      (fields.length <= 4 ? 16 : fields.length === 5 ? 13 : 10);
    const boxMinHeight = fillSlot ? (fields.length <= 4 ? 64 : 56) : 52;
    const squircleSize = compactHomepagePreview ? 32 : 38;
    const squircleIconSize = compactHomepagePreview ? 14 : 17;
    const squircleRadius = compactHomepagePreview ? 9 : 11;

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
                  disabled={!interactiveActionUrl(field)}
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
                  <View className="mr-3">
                    <ChannelSquircleIcon
                      defaultColor={slots.accent}
                      field={field}
                      iconSize={squircleIconSize}
                      rounded={squircleRadius}
                      size={squircleSize}
                    />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text
                      variant="none"
                      numberOfLines={1}
                      className="text-[10px] font-bold tracking-wider uppercase"
                      style={{
                        color: slots.textSecondary,
                        fontFamily,
                        letterSpacing,
                      }}
                    >
                      {presentation.label}
                    </Text>
                    <Text
                      variant="none"
                      numberOfLines={1}
                      className={`font-semibold ${fillSlot ? "text-base" : densePreview ? "text-xs" : "text-sm"}`}
                      style={{ color: slots.textPrimary, fontFamily }}
                    >
                      {presentation.value || presentation.label}
                    </Text>
                  </View>
                  <FontAwesome6
                    name="arrow-right"
                    size={12}
                    color={slots.accent}
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
          disabled={!interactiveActionUrl(field)}
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
          <ChannelSquircleIcon
            defaultColor={slots.accent}
            field={field}
            iconSize={fillSlot ? fillIconSize - 1 : compact ? 15 : 18}
            rounded={fillSlot ? 10 : 12}
            size={fillSlot ? fillIconBox - 2 : compact ? 34 : 40}
          />
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

  // Action Tiles (New) [Welcome Page Glowing Action Tiles with ChannelSquircleIcon]
  if (section.templateId === "classic-new") {
    const fieldGap =
      fixedSlotFieldGap ??
      (fields.length <= 4 ? 18 : fields.length === 5 ? 14 : 12);
    const squircleSize = compactHomepagePreview ? 34 : 42;
    const squircleIconSize = compactHomepagePreview ? 15 : 18;
    const squircleRadius = compactHomepagePreview ? 10 : 12;

    return (
      <View
        className={`overflow-hidden px-4 py-2 ${boxed ? "mb-5 rounded-[28px] border" : ""}`}
        style={[
          {
            backgroundColor: "#070d1e",
            borderColor: "rgba(56, 189, 248, 0.25)",
            borderWidth: 1,
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
            paddingTop: compactHomepagePreview ? 12 : 8,
            width: "100%",
          }}
        >
          <View className="mb-2 self-start rounded-full border border-sky-400/25 bg-sky-500/10 px-3 py-1">
            <Text
              variant="none"
              className="text-[11px] font-bold tracking-wider text-sky-400 uppercase"
            >
              CHANNELS & LINKS
            </Text>
          </View>
          <View style={{ gap: fieldGap, width: "100%" }}>
            {fields.map((field) => {
              const presentation = getConnectionPresentation(field, showEmpty);
              return (
                <Pressable
                  key={field.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${presentation.label}: ${presentation.value}`}
                  disabled={!interactiveActionUrl(field)}
                  onPress={() => handlePress(field)}
                  className="flex-row items-center rounded-2xl border px-3.5 py-2.5 active:opacity-75"
                  style={{
                    backgroundColor: "#0a1128",
                    borderColor: "rgba(56, 189, 248, 0.25)",
                  }}
                >
                  <View className="mr-3">
                    <ChannelSquircleIcon
                      defaultColor="#38bdf8"
                      field={field}
                      iconSize={squircleIconSize}
                      rounded={squircleRadius}
                      size={squircleSize}
                    />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text
                      variant="none"
                      numberOfLines={1}
                      className="text-[10px] font-bold tracking-wider uppercase text-sky-400"
                      style={{ fontFamily, letterSpacing }}
                    >
                      {presentation.label}
                    </Text>
                    <Text
                      variant="none"
                      numberOfLines={1}
                      className="text-sm font-bold text-white"
                      style={{ fontFamily, letterSpacing }}
                    >
                      {presentation.value || presentation.label}
                    </Text>
                  </View>
                  <FontAwesome6
                    name="chevron-right"
                    size={11}
                    color="#38bdf8"
                    style={{ marginLeft: 6 }}
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

  // Action Tiles (classic): clean corporate directory rows with vivid ChannelSquircleIcon
  const fieldGap =
    fixedSlotFieldGap ??
    (fields.length <= 4 ? 20 : fields.length === 5 ? 18 : 14);
  const classicSquircleSize = compactHomepagePreview ? 34 : densePreview ? 38 : fillSlot ? 42 : 44;
  const classicIconSize = compactHomepagePreview ? 15 : densePreview ? 16 : 18;
  const classicRadius = compactHomepagePreview ? 10 : 12;

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
          paddingTop: compactHomepagePreview ? 12 : 8,
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
                disabled={!interactiveActionUrl(field)}
                onPress={() => handlePress(field)}
                className="flex-row items-center active:opacity-75"
                style={{
                  borderBottomColor: slots.borderColor,
                  borderBottomWidth:
                    compactHomepagePreview || index === fields.length - 1 ? 0 : 1,
                  paddingBottom:
                    index === fields.length - 1 ? 0 : Math.round(fieldGap / 2),
                }}
              >
                <View className={`${compactHomepagePreview ? "mr-3" : "mr-4"}`}>
                  <ChannelSquircleIcon
                    defaultColor={slots.accent}
                    field={field}
                    iconSize={classicIconSize}
                    rounded={classicRadius}
                    size={classicSquircleSize}
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
