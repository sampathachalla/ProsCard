import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  type CardSectionId,
  type CardTemplateId,
  type CardVisualTheme,
  getTemplatePaletteTier,
} from '@/components/cardsComponents/types/card.types';
import { Text } from '@/components/uiComponents/Text';
import { EditorOptionGrid } from '@/components/uiComponents/editor/EditorOptionGrid';
import { EditorSectionLabel } from '@/components/uiComponents/editor/EditorSectionLabel';
import { EditorSelectableCard } from '@/components/uiComponents/editor/EditorSelectableCard';
import { getGradientContrastPalette, resolveLayoutColorSlots } from '@/utils/cardThemeColor';

const TEMPLATES: { id: CardTemplateId; label: string }[] = [
  { id: 'classic', label: 'Classic' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'bold', label: 'Bold Gradient' },
  { id: 'glass', label: 'Glass' },
  { id: 'compact', label: 'Compact' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'spotlight', label: 'Spotlight' },
  { id: 'banner', label: 'Banner' },
  { id: 'cards', label: 'Cards' },
  { id: 'badge', label: 'Badge' },
  { id: 'split', label: 'Split' },
  { id: 'neon', label: 'Neon' },
];

const SECTION_TEMPLATE_NAMES: Record<CardSectionId, Record<CardTemplateId, string>> = {
  identity: {
    classic: 'Cover Overlay',
    minimal: 'Side Profile',
    bold: 'Hero Banner',
    glass: 'Centered Glass',
    compact: 'Inline Header',
    editorial: 'Monograph',
    spotlight: 'Halo Spotlight',
    banner: 'Ribbon Pass',
    cards: 'Floating Card',
    badge: 'ID Pass',
    split: 'Dual Column',
    neon: 'Cyber Outline',
  },
  professional: {
    classic: 'Corporate Card',
    minimal: 'Executive Line',
    bold: 'Hero Credential',
    glass: 'Frosted Portfolio',
    compact: 'Compact Pill',
    editorial: 'Headline Stat',
    spotlight: 'Company Hero',
    banner: 'Stripe Card',
    cards: 'Modular Grid',
    badge: 'Officer Badge',
    split: 'Role Split',
    neon: 'Cyber Wire',
  },
  bio: {
    classic: 'Editorial Story',
    minimal: 'Executive Statement',
    bold: 'Callout Banner',
    glass: 'Frosted Parchment',
    compact: 'Quote Pill',
    editorial: 'Pull Quote',
    spotlight: 'Featured Memo',
    banner: 'Ribbon Quote',
    cards: 'Story Card',
    badge: 'Mission Badge',
    split: 'Dual Column Story',
    neon: 'Cyber Terminal',
  },
  connections: {
    classic: 'Action Tiles',
    minimal: 'Quick Grid',
    bold: 'Gradient Cards',
    glass: 'Frosted Dock',
    compact: 'Chip Flow',
    editorial: 'Numbered List',
    spotlight: 'Hero Spotlight',
    banner: 'Ribbon Cards',
    cards: 'Floating Tiles',
    badge: 'Icon Dock',
    split: 'Split Matrix',
    neon: 'Cyber Grid',
  },
};

function LayoutThumbnail({ section, template, theme }: { section: CardSectionId; template: CardTemplateId; theme: CardVisualTheme }) {
  const slots = resolveLayoutColorSlots({ templateId: template, theme });

  if (template === 'compact') {
    return (
      <View className="relative mb-2 h-12 flex-row items-center justify-between overflow-hidden rounded-xl px-2" style={{ backgroundColor: slots.surface, borderColor: slots.accent, borderWidth: 1 }}>
        <View className="flex-row items-center gap-1.5">
          <View className="h-5 w-5 rounded-full" style={{ backgroundColor: slots.accent }} />
          <View className="h-1.5 w-12 rounded" style={{ backgroundColor: slots.textPrimary }} />
        </View>
        <View className="h-3 w-8 rounded-md" style={{ backgroundColor: slots.background }} />
      </View>
    );
  }

  if (template === 'editorial') {
    return (
      <View className="relative mb-2 h-12 overflow-hidden rounded-xl border" style={{ backgroundColor: slots.surface, borderColor: slots.textMuted }}>
        <View className="h-3.5 w-full" style={{ backgroundColor: slots.accent }} />
        <View className="flex-row items-center justify-between p-1.5">
          <View className="h-4 w-4 rounded-sm border" style={{ backgroundColor: slots.background, borderColor: slots.accent }} />
          <View className="h-1.5 w-14 rounded" style={{ backgroundColor: slots.textPrimary }} />
        </View>
      </View>
    );
  }

  if (template === 'spotlight') {
    return (
      <View className="relative mb-2 h-12 items-center justify-center overflow-hidden rounded-xl border" style={{ backgroundColor: slots.surface, borderColor: slots.accent }}>
        <View className="h-6 w-6 items-center justify-center rounded-full border" style={{ backgroundColor: `${slots.accent}25`, borderColor: slots.accent }}>
          <View className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: slots.accent }} />
        </View>
        <View className="mt-1 h-1 w-10 rounded" style={{ backgroundColor: slots.textPrimary }} />
      </View>
    );
  }

  if (template === 'banner') {
    return (
      <View className="relative mb-2 h-12 overflow-hidden rounded-xl border" style={{ backgroundColor: slots.surface, borderColor: slots.textMuted }}>
        <View className="flex-row items-center justify-between px-2 py-1" style={{ backgroundColor: slots.accent }}>
          <View className="h-1 w-8 rounded bg-white/70" />
          <View className="h-2 w-2 rounded-full bg-white/80" />
        </View>
        <View className="flex-row items-center gap-1.5 p-1.5">
          <View className="h-4 w-4 rounded-md" style={{ backgroundColor: slots.background }} />
          <View className="h-1.5 w-12 rounded" style={{ backgroundColor: slots.textPrimary }} />
        </View>
      </View>
    );
  }

  if (template === 'cards') {
    return (
      <View className="relative mb-2 h-12 overflow-hidden rounded-xl p-1" style={{ backgroundColor: slots.background }}>
        <View className="h-full w-full rounded-lg border p-1 shadow-sm" style={{ backgroundColor: slots.surface, borderColor: slots.accent }}>
          <View className="flex-row items-center justify-between">
            <View className="h-3.5 w-3.5 rounded-md" style={{ backgroundColor: slots.accent }} />
            <View className="h-1.5 w-8 rounded" style={{ backgroundColor: slots.textPrimary }} />
          </View>
          <View className="mt-1 h-1 w-full rounded" style={{ backgroundColor: slots.textMuted }} />
        </View>
      </View>
    );
  }

  if (template === 'badge') {
    return (
      <View className="relative mb-2 h-12 items-center justify-center overflow-hidden rounded-xl border" style={{ backgroundColor: slots.surface, borderColor: slots.accent }}>
        <View className="absolute top-1 h-1 w-6 rounded-full" style={{ backgroundColor: slots.accent }} />
        <View className="mt-1 h-5 w-5 rounded-md border" style={{ backgroundColor: slots.background, borderColor: slots.accent }} />
        <View className="mt-0.5 h-1 w-8 rounded" style={{ backgroundColor: slots.textPrimary }} />
      </View>
    );
  }

  if (template === 'split') {
    return (
      <View className="relative mb-2 h-12 flex-row overflow-hidden rounded-xl border" style={{ backgroundColor: slots.surface, borderColor: slots.textMuted }}>
        <View className="w-[45%] items-center justify-center border-r p-1" style={{ backgroundColor: slots.background, borderRightColor: slots.textMuted }}>
          <View className="h-4 w-4 rounded-full" style={{ backgroundColor: slots.accent }} />
        </View>
        <View className="flex-1 justify-center p-1.5">
          <View className="h-1.5 w-full rounded" style={{ backgroundColor: slots.textPrimary }} />
          <View className="mt-1 h-1 w-3/4 rounded" style={{ backgroundColor: slots.textMuted }} />
        </View>
      </View>
    );
  }

  if (template === 'neon') {
    return (
      <View className="relative mb-2 h-12 overflow-hidden rounded-xl p-1.5" style={{ backgroundColor: '#0F172A', borderColor: slots.accent, borderWidth: 1.5 }}>
        <View className="flex-row items-center justify-between">
          <View className="h-2 w-2 rounded-full" style={{ backgroundColor: slots.accent }} />
          <View className="h-1.5 w-10 rounded" style={{ backgroundColor: '#FFFFFF' }} />
        </View>
        <View className="mt-1.5 h-1 w-full rounded" style={{ backgroundColor: `${slots.accent}80` }} />
      </View>
    );
  }

  if (section === 'identity') {
    if (template === 'minimal') {
      return (
        <View className="relative mb-2 h-12 overflow-hidden rounded-xl" style={{ backgroundColor: slots.surface }}>
          <View className="h-full w-[40%]" style={{ backgroundColor: slots.background }} />
          <View className="absolute left-3 top-3 h-6 w-6 rounded-full border-2" style={{ backgroundColor: slots.background, borderColor: slots.accent }} />
          <View className="absolute right-2 top-2 h-2 w-7 rounded" style={{ backgroundColor: slots.accent }} />
          <View className="absolute bottom-2 right-2 h-1.5 w-10 rounded" style={{ backgroundColor: slots.textPrimary }} />
        </View>
      );
    }
    if (template === 'bold') {
      return (
        <LinearGradient colors={theme.gradient} className="relative mb-2 h-12 overflow-hidden rounded-xl">
          <View className="absolute right-2 top-2 h-2 w-7 rounded" style={{ backgroundColor: slots.surface }} />
          <View className="absolute bottom-2 left-2 h-5 w-5 rounded-md border" style={{ backgroundColor: slots.background, borderColor: slots.accent }} />
          <View className="absolute bottom-2 left-9 h-2 w-12 rounded" style={{ backgroundColor: slots.surface }} />
        </LinearGradient>
      );
    }
    if (template === 'glass') {
      return (
        <View className="relative mb-2 h-12 overflow-hidden rounded-xl" style={{ backgroundColor: slots.background }}>
          <View className="absolute inset-x-2 bottom-1 h-7 items-center rounded-lg border" style={{ backgroundColor: slots.surface, borderColor: slots.accent }}>
            <View className="-mt-2 h-4 w-4 rounded-full border" style={{ backgroundColor: slots.background, borderColor: slots.accent }} />
            <View className="mt-1 h-1.5 w-9 rounded" style={{ backgroundColor: slots.textPrimary }} />
          </View>
        </View>
      );
    }
    return (
      <View className="relative mb-2 h-12 overflow-hidden rounded-xl" style={{ backgroundColor: slots.background }}>
        <View className="absolute left-2 top-2 h-2 w-7 rounded" style={{ backgroundColor: slots.surface }} />
        <View className="absolute inset-x-0 bottom-0 h-4" style={{ backgroundColor: slots.surface }} />
        <View className="absolute bottom-1 left-2 h-5 w-5 rounded-full border" style={{ backgroundColor: slots.background, borderColor: slots.accent }} />
        <View className="absolute bottom-2 left-9 h-1.5 w-10 rounded" style={{ backgroundColor: slots.textPrimary }} />
      </View>
    );
  }

  if (section === 'professional') {
    if (template === 'minimal') {
      return (
        <View className="relative mb-2 h-12 overflow-hidden rounded-xl border-l-4 p-1.5" style={{ backgroundColor: slots.background, borderLeftColor: slots.accent }}>
          <View className="h-2 w-16 rounded" style={{ backgroundColor: slots.textPrimary }} />
          <View className="mt-1 h-1.5 w-10 rounded" style={{ backgroundColor: slots.accent }} />
          <View className="mt-1.5 h-1 w-20 rounded" style={{ backgroundColor: slots.textMuted }} />
        </View>
      );
    }
    if (template === 'bold') {
      return (
        <LinearGradient colors={theme.gradient} className="relative mb-2 h-12 overflow-hidden rounded-xl p-2">
          <View className="h-2 w-16 rounded" style={{ backgroundColor: slots.surface }} />
          <View className="mt-1 h-1.5 w-10 rounded" style={{ backgroundColor: slots.accent }} />
          <View className="mt-1.5 h-2 w-full rounded" style={{ backgroundColor: slots.background }} />
        </LinearGradient>
      );
    }
    if (template === 'glass') {
      return (
        <View className="relative mb-2 h-12 overflow-hidden rounded-xl p-1.5" style={{ backgroundColor: slots.background }}>
          <View className="h-full w-full rounded-lg border p-1" style={{ backgroundColor: slots.surface, borderColor: slots.accent }}>
            <View className="h-2 w-14 rounded" style={{ backgroundColor: slots.textPrimary }} />
            <View className="mt-1 h-1.5 w-8 rounded" style={{ backgroundColor: slots.accent }} />
          </View>
        </View>
      );
    }
    return (
      <View className="relative mb-2 h-12 overflow-hidden rounded-xl border p-2" style={{ backgroundColor: slots.surface, borderColor: slots.accent }}>
        <View className="flex-row items-center justify-between">
          <View className="h-2 w-14 rounded" style={{ backgroundColor: slots.textPrimary }} />
          <View className="h-2 w-6 rounded-full" style={{ backgroundColor: slots.accent }} />
        </View>
        <View className="mt-1 h-1.5 w-10 rounded" style={{ backgroundColor: slots.accent }} />
        <View className="mt-1 h-1.5 w-20 rounded" style={{ backgroundColor: slots.textMuted }} />
      </View>
    );
  }

  if (section === 'bio') {
    const gradientContrast = getGradientContrastPalette(theme.gradient);
    if (template === 'minimal') {
      return (
        <View className="relative mb-2 h-12 justify-center overflow-hidden rounded-xl px-3" style={{ backgroundColor: slots.background }}>
          <View className="border-l-4 pl-2" style={{ borderLeftColor: slots.accent }}>
            <View className="h-1.5 w-full rounded" style={{ backgroundColor: slots.textPrimary }} />
            <View className="mt-1 h-1.5 w-4/5 rounded" style={{ backgroundColor: slots.textMuted }} />
            <View className="mt-1 h-1.5 w-3/5 rounded" style={{ backgroundColor: slots.textMuted }} />
          </View>
        </View>
      );
    }
    if (template === 'bold') {
      return (
        <LinearGradient colors={theme.gradient} className="relative mb-2 h-12 items-center justify-center overflow-hidden rounded-xl px-4">
          <View className="mb-1 h-1 w-7 rounded" style={{ backgroundColor: gradientContrast.primary }} />
          <View className="h-1.5 w-full rounded" style={{ backgroundColor: gradientContrast.primary }} />
          <View className="mt-1 h-1.5 w-3/4 rounded" style={{ backgroundColor: gradientContrast.secondary }} />
          <View className="mt-1 h-1 w-4 rounded" style={{ backgroundColor: slots.accent }} />
        </LinearGradient>
      );
    }
    if (template === 'glass') {
      return (
        <LinearGradient colors={theme.gradient} className="relative mb-2 h-12 overflow-hidden rounded-xl p-1.5">
          <View className="absolute bottom-1 right-1 h-9 w-[88%] rounded-lg" style={{ backgroundColor: slots.accent }} />
          <View className="h-9 w-[94%] rounded-lg border p-1.5" style={{ backgroundColor: slots.surface, borderColor: slots.textMuted }}>
            <View className="mb-1 flex-row items-center justify-between">
              <View className="h-1 w-5 rounded" style={{ backgroundColor: slots.accent }} />
              <View className="h-2 w-2 rounded-full" style={{ backgroundColor: slots.accent }} />
            </View>
            <View className="h-1.5 w-full rounded" style={{ backgroundColor: slots.textPrimary }} />
            <View className="mt-1 h-1.5 w-3/4 rounded" style={{ backgroundColor: slots.textMuted }} />
          </View>
        </LinearGradient>
      );
    }
    return (
      <View className="relative mb-2 h-12 flex-row overflow-hidden rounded-xl border p-2" style={{ backgroundColor: slots.surface, borderColor: slots.accent }}>
        <View className="mr-2 items-center">
          <View className="h-3 w-3 rounded-full" style={{ backgroundColor: slots.accent }} />
          <View className="mt-1 w-0.5 flex-1" style={{ backgroundColor: slots.accent }} />
        </View>
        <View className="flex-1 pt-0.5">
          <View className="h-1.5 w-full rounded" style={{ backgroundColor: slots.textPrimary }} />
          <View className="mt-1 h-1.5 w-4/5 rounded" style={{ backgroundColor: slots.textMuted }} />
          <View className="mt-1 h-1.5 w-3/5 rounded" style={{ backgroundColor: slots.textMuted }} />
        </View>
      </View>
    );
  }

  // connections
  const connectionGradientContrast = getGradientContrastPalette(theme.gradient);
  if (template === 'minimal') {
    return (
      <View className="relative mb-2 h-12 overflow-hidden rounded-xl p-1.5" style={{ backgroundColor: slots.background }}>
        <View className="flex-row gap-1">
          <View className="h-4 flex-1 rounded border" style={{ backgroundColor: slots.surface, borderColor: slots.accent }} />
          <View className="h-4 flex-1 rounded border" style={{ backgroundColor: slots.surface, borderColor: slots.accent }} />
        </View>
        <View className="mt-1 flex-row gap-1">
          <View className="h-4 flex-1 rounded border" style={{ backgroundColor: slots.surface, borderColor: slots.accent }} />
          <View className="h-4 flex-1 rounded border" style={{ backgroundColor: slots.surface, borderColor: slots.accent }} />
        </View>
      </View>
    );
  }
  if (template === 'bold') {
    return (
      <LinearGradient colors={theme.gradient} className="relative mb-2 h-12 overflow-hidden rounded-xl p-1.5">
        <View className="flex-row items-center rounded border px-1 py-0.5" style={{ borderColor: connectionGradientContrast.secondary }}>
          <View className="mr-1 h-3 w-3 rounded-sm" style={{ backgroundColor: slots.surface }} />
          <View className="h-1.5 flex-1 rounded" style={{ backgroundColor: connectionGradientContrast.primary }} />
        </View>
        <View className="mt-1 flex-row items-center rounded border px-1 py-0.5" style={{ borderColor: connectionGradientContrast.secondary }}>
          <View className="mr-1 h-3 w-3 rounded-sm" style={{ backgroundColor: slots.surface }} />
          <View className="h-1.5 flex-1 rounded" style={{ backgroundColor: connectionGradientContrast.primary }} />
        </View>
      </LinearGradient>
    );
  }
  if (template === 'glass') {
    return (
      <View className="relative mb-2 h-12 overflow-hidden rounded-xl p-1.5" style={{ backgroundColor: slots.background }}>
        <View className="flex-row gap-1">
          {[0, 1].map((item) => (
            <View key={item} className="h-9 flex-1 overflow-hidden rounded-md border" style={{ backgroundColor: slots.surface, borderColor: slots.textMuted }}>
              <LinearGradient colors={theme.gradient} style={{ height: 3 }} />
              <View className="mx-auto mt-1 h-2 w-2 rounded-full" style={{ backgroundColor: slots.accent }} />
              <View className="mx-auto mt-1 h-1 w-8 rounded" style={{ backgroundColor: slots.textPrimary }} />
            </View>
          ))}
        </View>
      </View>
    );
  }
  return (
    <View className="relative mb-2 h-12 overflow-hidden rounded-xl px-2 py-1" style={{ backgroundColor: slots.surface }}>
      {[0, 1, 2].map((item) => (
        <View key={item} className="flex-1 flex-row items-center" style={{ borderBottomColor: slots.textMuted, borderBottomWidth: item === 2 ? 0 : 1 }}>
          <View className="mr-2 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slots.accent }} />
          <View className="h-1.5 flex-1 rounded" style={{ backgroundColor: item === 0 ? slots.textPrimary : slots.textMuted }} />
        </View>
      ))}
    </View>
  );
}

const CARD_HEIGHT = 100;

export function LayoutTemplatePicker({
  showHeader = true,
  section,
  selectedTemplateId,
  theme,
  onSelect,
  fullOpen = false,
}: {
  showHeader?: boolean;
  section: CardSectionId;
  selectedTemplateId: CardTemplateId;
  theme: CardVisualTheme;
  onSelect: (templateId: CardTemplateId) => void;
  fullOpen?: boolean;
}) {
  const { width } = useWindowDimensions();
  const editorPaneWidth = Math.min(720, Math.max(260, width - 40));
  const gridGap = 10;
  const itemWidth = (editorPaneWidth - gridGap) / 2;

  // Chunk 12 templates into pages of 4 items (2x2 grid per slide)
  const templatePages = useMemo(() => {
    const pages: (typeof TEMPLATES)[] = [];
    for (let i = 0; i < TEMPLATES.length; i += 4) {
      pages.push(TEMPLATES.slice(i, i + 4));
    }
    return pages;
  }, []);

  const [currentPage, setCurrentPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  // Sync scroll position with selected template page
  useEffect(() => {
    const selectedIdx = TEMPLATES.findIndex((t) => t.id === selectedTemplateId);
    if (selectedIdx >= 0) {
      const pageIdx = Math.floor(selectedIdx / 4);
      setCurrentPage(pageIdx);
      scrollRef.current?.scrollTo({ x: pageIdx * editorPaneWidth, animated: false });
    }
  }, [selectedTemplateId, editorPaneWidth]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const nextIdx = Math.round(offsetX / editorPaneWidth);
    if (nextIdx !== currentPage && nextIdx >= 0 && nextIdx < templatePages.length) {
      setCurrentPage(nextIdx);
    }
  };

  const scrollToPage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
    scrollRef.current?.scrollTo({ x: pageIndex * editorPaneWidth, animated: true });
  };

  const renderTemplateCard = (templateId: CardTemplateId, cardWidth: number, compactHeight = true) => {
    const label = SECTION_TEMPLATE_NAMES[section][templateId] || templateId;
    const selected = selectedTemplateId === templateId;
    const tier = getTemplatePaletteTier(templateId);
    return (
      <EditorSelectableCard
        label={label}
        selected={selected}
        accessibilityLabel={`Use ${label} layout (${tier} colors)`}
        onPress={() => onSelect(templateId)}
        style={compactHeight ? { height: CARD_HEIGHT, width: cardWidth } : { width: cardWidth, minHeight: CARD_HEIGHT }}
      >
        <View className="relative">
          <LayoutThumbnail section={section} template={templateId} theme={theme} />
          <View className="absolute right-1.5 top-1.5 rounded-md bg-black/60 px-1.5 py-0.5 shadow-sm">
            <Text className="text-[9px] font-bold text-white">{tier}C</Text>
          </View>
        </View>
      </EditorSelectableCard>
    );
  };

  return (
    <View className="w-full">
      {showHeader ? <EditorSectionLabel title="Choose a design layout" /> : null}

      {fullOpen ? (
        <EditorOptionGrid
          items={TEMPLATES}
          keyExtractor={(t) => t.id}
          containerWidth={editorPaneWidth}
          columns={2}
          gap={gridGap}
          singleColumnBelowWidth={0}
          renderItem={(template, cardWidth) => renderTemplateCard(template.id, cardWidth, true)}
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
                  flexDirection: 'row',
                  flexWrap: 'wrap',
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
                    ? 'w-6 bg-primary dark:bg-dark-primary'
                    : 'w-2 bg-slate-300 dark:bg-slate-700'
                }`}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
