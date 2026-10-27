import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
} from "react-native";
import {
  CONNECTION_LAYOUT_IDS,
  IDENTITY_LAYOUT_IDS,
  IDENTITY_LAYOUT_STYLES,
  IDENTITY_SECTION_TEMPLATE_IDS,
  PROFESSIONAL_LAYOUT_IDS,
  PROFESSIONAL_LAYOUT_STYLES,
  resolveConnectionsLayoutId,
  resolveIdentityLayoutId,
  resolveProfessionalLayoutId,
  resolveLayoutStyle,
  type CardLayoutId,
  type CardSectionId,
  type CardTemplateId,
  type CardVisualTheme,
  getTemplatePaletteTier,
} from "@/pages/cards/types/card.types";
import { EditorOptionGrid } from "@/common/ui/editor/EditorOptionGrid";
import { EditorSectionLabel } from "@/common/ui/editor/EditorSectionLabel";
import { EditorSelectableCard } from "@/common/ui/editor/EditorSelectableCard";
import { resolveLayoutColorSlots } from "@/utils/cardThemeColor";

const IDENTITY_TEMPLATE_LABELS: Record<
  (typeof IDENTITY_SECTION_TEMPLATE_IDS)[number],
  string
> = {
  classic: "Classic",
  minimal: "Minimal",
  spotlight: "Spotlight",
  editorial: "Editorial",
  "classic-new": "Cover Overlay (New)",
  "minimal-new": "Side Profile (New)",
  "spotlight-new": "Halo Spotlight (New)",
  "editorial-new": "Monograph (New)",
};

const IDENTITY_TEMPLATES: { id: CardLayoutId; label: string }[] =
  IDENTITY_LAYOUT_IDS
    .filter((id) =>
      !["classic-new", "minimal-new", "spotlight", "editorial-new"].includes(
        IDENTITY_LAYOUT_STYLES[id],
      ),
    )
    .map((id) => ({
      id,
      label: IDENTITY_TEMPLATE_LABELS[IDENTITY_LAYOUT_STYLES[id]],
    }));

const PROFESSIONAL_TEMPLATE_LABELS: Record<
  (typeof PROFESSIONAL_LAYOUT_STYLES)[keyof typeof PROFESSIONAL_LAYOUT_STYLES],
  string
> = {
  classic: "Executive Minimal",
  spotlight: "Enterprise Split",
  banner: "Company Focus",
  badge: "Credential Card",
  "classic-new": "Executive Minimal (New)",
  "spotlight-new": "Enterprise Split (New)",
  "banner-new": "Company Focus (New)",
  "badge-new": "Credential Card (New)",
};

const PROFESSIONAL_TEMPLATES: { id: CardLayoutId; label: string }[] =
  PROFESSIONAL_LAYOUT_IDS
    .filter((id) =>
      !['banner', 'banner-new', 'classic-new', 'spotlight-new', 'badge-new'].includes(
        PROFESSIONAL_LAYOUT_STYLES[id],
      ),
    )
    .map((id) => ({
      id,
      label: PROFESSIONAL_TEMPLATE_LABELS[PROFESSIONAL_LAYOUT_STYLES[id]],
    }));

const CONNECTION_TEMPLATE_LABELS: Record<
  (typeof CONNECTION_LAYOUT_IDS)[number],
  string
> = {
  classic: "Action Tiles",
  banner: "Executive Directory",
  editorial: "Contact Ledger",
  compact: "Direct Contact List",
  "classic-new": "Action Tiles (New)",
  "banner-new": "Executive Directory (New)",
  "editorial-new": "Contact Ledger (New)",
  "compact-new": "Direct Contact List (New)",
};

const CONNECTION_TEMPLATES: { id: CardLayoutId; label: string }[] =
  CONNECTION_LAYOUT_IDS
    .filter((id) => id === "editorial" || id === "compact")
    .map((id) => ({
      id,
      label: CONNECTION_TEMPLATE_LABELS[id],
    }));

function templatesForSection(
  section: CardSectionId,
): { id: CardLayoutId; label: string }[] {
  if (section === "identity") return IDENTITY_TEMPLATES;
  if (section === "professional") return PROFESSIONAL_TEMPLATES;
  return CONNECTION_TEMPLATES;
}

const SECTION_TEMPLATE_NAMES: Record<
  CardSectionId,
  Record<CardTemplateId, string>
> = {
  identity: {
    classic: "Cover Overlay",
    minimal: "Side Profile",
    spotlight: "Halo Spotlight",
    editorial: "Monograph",
    compact: "Inline Header",
    banner: "Ribbon Pass",
    badge: "ID Pass",
    "classic-new": "Cover Overlay (New)",
    "minimal-new": "Side Profile (New)",
    "spotlight-new": "Halo Spotlight (New)",
    "editorial-new": "Monograph (New)",
    "compact-new": "Inline Header (New)",
    "banner-new": "Ribbon Pass (New)",
    "badge-new": "ID Pass (New)",
  },
  professional: {
    classic: "Executive Minimal",
    minimal: "Executive Line",
    compact: "Compact Pill",
    editorial: "Headline Stat",
    spotlight: "Enterprise Split",
    banner: "Company Focus",
    badge: "Credential Card",
    "classic-new": "Executive Minimal (New)",
    "minimal-new": "Executive Line (New)",
    "compact-new": "Compact Pill (New)",
    "editorial-new": "Headline Stat (New)",
    "spotlight-new": "Enterprise Split (New)",
    "banner-new": "Company Focus (New)",
    "badge-new": "Credential Card (New)",
  },
  connections: {
    classic: "Action Tiles",
    minimal: "Quick Grid",
    compact: "Direct Contact List",
    editorial: "Contact Ledger",
    spotlight: "Hero Spotlight",
    banner: "Executive Directory",
    badge: "Icon Dock",
    "classic-new": "Action Tiles (New)",
    "minimal-new": "Quick Grid (New)",
    "compact-new": "Direct Contact List (New)",
    "editorial-new": "Contact Ledger (New)",
    "spotlight-new": "Hero Spotlight (New)",
    "banner-new": "Executive Directory (New)",
    "badge-new": "Icon Dock (New)",
  },
};

function LayoutThumbnail({
  section,
  template,
  theme,
}: {
  section: CardSectionId;
  template: CardTemplateId;
  theme: CardVisualTheme;
}) {
  const slots = resolveLayoutColorSlots({ templateId: template, theme });

  if (template.endsWith("-new")) {
    const isIdentity = section === "identity";
    const isProfessional = section === "professional";
    const isConnections = section === "connections";

    return (
      <View
        className="relative mb-2 h-12 overflow-hidden rounded-xl border"
        style={{
          backgroundColor: "#070d1e",
          borderColor: "rgba(56, 189, 248, 0.45)",
        }}
      >
        <View className="h-0.5 w-full bg-sky-400" />
        {isIdentity && (
          <View className="flex-1 items-center justify-center p-1">
            <View className="flex-row items-center gap-2">
              <View
                className="h-5 w-5 items-center justify-center rounded-full border-2 border-sky-400"
                style={{ backgroundColor: "#2563eb" }}
              >
                <View className="h-2 w-2 rounded-full bg-white" />
              </View>
              <View className="gap-1">
                <View className="h-1.5 w-12 rounded bg-white" />
                <View className="h-1 w-8 rounded bg-sky-400" />
              </View>
            </View>
          </View>
        )}
        {isProfessional && (
          <View className="flex-1 justify-center px-2 py-1">
            <View className="mb-0.5 flex-row items-center justify-between">
              <View className="h-1 w-6 rounded bg-sky-400" />
              <View className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </View>
            <View className="h-1.5 w-14 rounded bg-white" />
            <View className="mt-1 h-1 w-10 rounded bg-sky-300" />
          </View>
        )}
        {isConnections && (
          <View className="flex-1 justify-center gap-1 px-2.5">
            {[0, 1].map((row) => (
              <View key={row} className="flex-row items-center gap-1.5">
                <View
                  className="h-2.5 w-2.5 rounded-md border border-sky-400/50"
                  style={{ backgroundColor: "#2563eb" }}
                />
                <View
                  className="h-1.5 rounded"
                  style={{
                    backgroundColor: row === 0 ? "#ffffff" : "#94a3b8",
                    width: row === 0 ? 56 : 42,
                  }}
                />
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }

  if (template === "compact" && section === "connections") {
    return (
      <View
        className="relative mb-2 h-12 justify-center gap-1 overflow-hidden rounded-xl px-3"
        style={{
          backgroundColor: slots.surface,
          borderColor: slots.accent,
          borderWidth: 1,
        }}
      >
        {[0, 1, 2].map((row) => (
          <View key={row} className="flex-row items-center gap-2">
            <View
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: slots.accent }}
            />
            <View
              className="h-1.5 rounded"
              style={{
                backgroundColor: slots.textPrimary,
                width: row === 1 ? 62 : 48,
              }}
            />
          </View>
        ))}
      </View>
    );
  }

  if (template === "editorial") {
    return (
      <View
        className="relative mb-2 h-12 overflow-hidden rounded-xl border"
        style={{ backgroundColor: slots.surface, borderColor: slots.textMuted }}
      >
        <View
          className="h-3.5 w-full"
          style={{ backgroundColor: slots.accent }}
        />
        <View className="flex-row items-center justify-between p-1.5">
          <View
            className="h-4 w-4 rounded-sm border"
            style={{
              backgroundColor: slots.background,
              borderColor: slots.accent,
            }}
          />
          <View
            className="h-1.5 w-14 rounded"
            style={{ backgroundColor: slots.textPrimary }}
          />
        </View>
      </View>
    );
  }

  if (template === "spotlight") {
    return (
      <View
        className="relative mb-2 h-12 items-center justify-center overflow-hidden rounded-xl border"
        style={{ backgroundColor: slots.surface, borderColor: slots.accent }}
      >
        <View
          className="h-6 w-6 items-center justify-center rounded-full border"
          style={{
            backgroundColor: `${slots.accent}25`,
            borderColor: slots.accent,
          }}
        >
          <View
            className="h-3.5 w-3.5 rounded-full"
            style={{ backgroundColor: slots.accent }}
          />
        </View>
        <View
          className="mt-1 h-1 w-10 rounded"
          style={{ backgroundColor: slots.textPrimary }}
        />
      </View>
    );
  }

  if (template === "banner") {
    return (
      <View
        className="relative mb-2 h-12 overflow-hidden rounded-xl border"
        style={{ backgroundColor: slots.surface, borderColor: slots.textMuted }}
      >
        <View
          className="flex-row items-center justify-between px-2 py-1"
          style={{ backgroundColor: slots.accent }}
        >
          <View className="h-1 w-8 rounded bg-white/70" />
          <View className="h-2 w-2 rounded-full bg-white/80" />
        </View>
        <View className="flex-row items-center gap-1.5 p-1.5">
          <View
            className="h-4 w-4 rounded-md"
            style={{ backgroundColor: slots.background }}
          />
          <View
            className="h-1.5 w-12 rounded"
            style={{ backgroundColor: slots.textPrimary }}
          />
        </View>
      </View>
    );
  }

  if (template === "badge") {
    return (
      <View
        className="relative mb-2 h-12 items-center justify-center overflow-hidden rounded-xl border"
        style={{ backgroundColor: slots.surface, borderColor: slots.accent }}
      >
        <View
          className="absolute top-1 h-1 w-6 rounded-full"
          style={{ backgroundColor: slots.accent }}
        />
        <View
          className="mt-1 h-5 w-5 rounded-md border"
          style={{
            backgroundColor: slots.background,
            borderColor: slots.accent,
          }}
        />
        <View
          className="mt-0.5 h-1 w-8 rounded"
          style={{ backgroundColor: slots.textPrimary }}
        />
      </View>
    );
  }

  if (section === "identity") {
    if (template === "minimal") {
      return (
        <View
          className="relative mb-2 h-12 overflow-hidden rounded-xl"
          style={{ backgroundColor: slots.surface }}
        >
          <View className="absolute inset-x-0 top-0 h-[66%]" style={{ backgroundColor: slots.background }} />
          <View className="absolute inset-x-0 bottom-0 h-[34%]" style={{ backgroundColor: slots.surface }} />
          <View
            className="absolute left-2 h-6 w-6 rounded-full border-2"
            style={{
              top: "66%",
              marginTop: -12,
              backgroundColor: slots.background,
              borderColor: "#ffffff",
            }}
          />
          <View
            className="absolute bottom-2 right-2 h-2 w-7 rounded"
            style={{ backgroundColor: slots.accent }}
          />
        </View>
      );
    }
    if (template === "classic") {
      return (
        <View
          className="relative mb-2 h-12 overflow-hidden rounded-xl"
          style={{ backgroundColor: slots.surface }}
        >
          <View
            className="absolute inset-x-0 top-0 h-[60%]"
            style={{ backgroundColor: slots.background }}
          />
          <View
            className="absolute right-2 top-2 h-2 w-5 rounded"
            style={{ backgroundColor: slots.surface }}
          />
          <View
            className="absolute left-1/2 h-6 w-6 rounded-full border-2"
            style={{
              top: "60%",
              marginLeft: -12,
              marginTop: -12,
              backgroundColor: slots.background,
              borderColor: slots.accent,
            }}
          />
          <View
            className="absolute inset-x-0 bottom-0 h-[40%]"
            style={{ backgroundColor: slots.surface }}
          />
          <View
            className="absolute bottom-2 h-1.5 w-10 rounded"
            style={{
              left: "50%",
              marginLeft: -20,
              backgroundColor: slots.textPrimary,
            }}
          />
        </View>
      );
    }
    return (
      <View
        className="relative mb-2 h-12 overflow-hidden rounded-xl"
        style={{ backgroundColor: slots.background }}
      >
        <View
          className="absolute left-2 top-2 h-2 w-7 rounded"
          style={{ backgroundColor: slots.surface }}
        />
        <View
          className="absolute inset-x-0 bottom-0 h-4"
          style={{ backgroundColor: slots.surface }}
        />
        <View
          className="absolute bottom-1 left-2 h-5 w-5 rounded-full border"
          style={{
            backgroundColor: slots.background,
            borderColor: slots.accent,
          }}
        />
        <View
          className="absolute bottom-2 left-9 h-1.5 w-10 rounded"
          style={{ backgroundColor: slots.textPrimary }}
        />
      </View>
    );
  }

  if (section === "professional") {
    return (
      <View
        className="relative mb-2 h-12 overflow-hidden rounded-xl border p-2"
        style={{ backgroundColor: slots.surface, borderColor: slots.accent }}
      >
        <View className="flex-row items-center justify-between">
          <View
            className="h-2 w-14 rounded"
            style={{ backgroundColor: slots.textPrimary }}
          />
          <View
            className="h-2 w-6 rounded-full"
            style={{ backgroundColor: slots.accent }}
          />
        </View>
        <View
          className="mt-1 h-1.5 w-10 rounded"
          style={{ backgroundColor: slots.accent }}
        />
        <View
          className="mt-1 h-1.5 w-20 rounded"
          style={{ backgroundColor: slots.textMuted }}
        />
      </View>
    );
  }

  // connections
  return (
    <View
      className="relative mb-2 h-12 overflow-hidden rounded-xl px-2 py-1"
      style={{ backgroundColor: slots.surface }}
    >
      {[0, 1, 2].map((item) => (
        <View
          key={item}
          className="flex-1 flex-row items-center"
          style={{
            borderBottomColor: slots.textMuted,
            borderBottomWidth: item === 2 ? 0 : 1,
          }}
        >
          <View
            className="mr-2 h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: slots.accent }}
          />
          <View
            className="h-1.5 flex-1 rounded"
            style={{
              backgroundColor: item === 0 ? slots.textPrimary : slots.textMuted,
            }}
          />
        </View>
      ))}
    </View>
  );
}

const CARD_HEIGHT = 100;
const CARD_HEIGHT_EXPANDED = 140;

export function LayoutTemplatePicker({
  editBarCollapsed = false,
  showHeader = true,
  section,
  selectedTemplateId,
  theme,
  onSelect,
  fullOpen = false,
}: {
  editBarCollapsed?: boolean;
  showHeader?: boolean;
  section: CardSectionId;
  selectedTemplateId: CardLayoutId;
  theme: CardVisualTheme;
  onSelect: (templateId: CardLayoutId) => void;
  fullOpen?: boolean;
}) {
  const { width } = useWindowDimensions();
  const editorPaneWidth = Math.min(720, Math.max(260, width - 40));
  const gridGap = 10;
  const itemWidth = (editorPaneWidth - gridGap) / 2;
  const cardHeight = editBarCollapsed ? CARD_HEIGHT_EXPANDED : CARD_HEIGHT;

  const sectionTemplates = useMemo(
    () => templatesForSection(section),
    [section],
  );
  const activeTemplateId =
    section === "identity"
      ? resolveIdentityLayoutId(selectedTemplateId)
      : section === "professional"
        ? resolveProfessionalLayoutId(selectedTemplateId)
        : resolveConnectionsLayoutId(selectedTemplateId);

  // Chunk templates into pages of 4 items (2x2 grid per slide)
  const templatePages = useMemo(() => {
    const pages: (typeof sectionTemplates)[] = [];
    for (let i = 0; i < sectionTemplates.length; i += 4) {
      pages.push(sectionTemplates.slice(i, i + 4));
    }
    return pages;
  }, [sectionTemplates]);

  const [currentPage, setCurrentPage] = useState(0);
  const scrollRef = useRef<ScrollViewInstance>(null);

  // Sync scroll position with selected template page
  useEffect(() => {
    const selectedIdx = sectionTemplates.findIndex(
      (t) => t.id === activeTemplateId,
    );
    const frame = requestAnimationFrame(() => {
      if (selectedIdx < 0) return;
      const pageIdx = Math.floor(selectedIdx / 4);
      setCurrentPage(pageIdx);
      scrollRef.current?.scrollTo({
        x: pageIdx * editorPaneWidth,
        animated: false,
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [activeTemplateId, editorPaneWidth, sectionTemplates]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const nextIdx = Math.round(offsetX / editorPaneWidth);
    if (
      nextIdx !== currentPage &&
      nextIdx >= 0 &&
      nextIdx < templatePages.length
    ) {
      setCurrentPage(nextIdx);
    }
  };

  const scrollToPage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
    scrollRef.current?.scrollTo({
      x: pageIndex * editorPaneWidth,
      animated: true,
    });
  };

  const renderTemplateCard = (
    templateId: CardLayoutId,
    cardWidth: number,
    compactHeight = true,
  ) => {
    // Display name, palette and thumbnail come from the layout's drawing style.
    const style = resolveLayoutStyle(templateId, section);
    const label = SECTION_TEMPLATE_NAMES[section][style] || templateId;
    const selected = activeTemplateId === templateId;
    const tier = getTemplatePaletteTier(style);
    return (
      <EditorSelectableCard
        label={label}
        selected={selected}
        accessibilityLabel={`Use ${label} layout (${tier} colors)`}
        onPress={() => onSelect(templateId)}
        style={
          compactHeight
            ? { height: cardHeight, width: cardWidth }
            : { width: cardWidth, minHeight: cardHeight }
        }
      >
        <LayoutThumbnail section={section} template={style} theme={theme} />
      </EditorSelectableCard>
    );
  };

  return (
    <View className="w-full">
      {showHeader ? (
        <EditorSectionLabel title="Choose a design layout" />
      ) : null}

      {fullOpen ? (
        <EditorOptionGrid
          items={sectionTemplates}
          keyExtractor={(t) => t.id}
          containerWidth={editorPaneWidth}
          columns={2}
          gap={gridGap}
          singleColumnBelowWidth={0}
          renderItem={(template, cardWidth) =>
            renderTemplateCard(template.id, cardWidth, true)
          }
        />
      ) : (
        <View className="w-full">
          {/* 2x2 Grid Slide Carousel (4 designs in one view) */}
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            nestedScrollEnabled
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={{ width: editorPaneWidth }}
          >
            {templatePages.map((page, pageIdx) => (
              <View
                key={pageIdx}
                style={{
                  width: editorPaneWidth,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: gridGap,
                }}
              >
                {page.map((template) => (
                  <View key={template.id} style={{ width: itemWidth }}>
                    {renderTemplateCard(template.id, itemWidth, true)}
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>

          {/* Pagination Indicators for Carousel Pages */}
          <View className="mt-3 flex-row items-center justify-center gap-1.5">
            {templatePages.map((_, idx) => (
              <Pressable
                key={idx}
                onPress={() => scrollToPage(idx)}
                accessibilityRole="button"
                accessibilityLabel={`Go to design page ${idx + 1}`}
                className={`h-2 rounded-full ${
                  currentPage === idx
                    ? "w-6 bg-primary dark:bg-dark-primary"
                    : "w-2 bg-slate-300 dark:bg-slate-700"
                }`}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
