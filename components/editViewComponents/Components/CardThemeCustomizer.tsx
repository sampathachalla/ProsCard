import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, ChevronLeft, Palette, Plus, Type as TypeIcon } from 'lucide-react-native';
import {
  CARD_THEME_PRESETS,
  type CardFontStyle,
  type CardThemePresetId,
  type CardVisualTheme,
  type SavedSectionTheme,
  type ThemePaletteTier,
} from '@/components/cardsComponents/types/card.types';
import { getCardFontFamily, MULTI_TIER_PRESETS, type MultiTierPreset } from '@/components/cardsComponents/Templates/cardTheme';
import { Text } from '@/components/uiComponents/Text';
import { EditorOptionGrid } from '@/components/uiComponents/editor/EditorOptionGrid';
import { EditorPresentationCrossfade } from '@/components/uiComponents/editor/EditorPresentationCrossfade';
import { EditorSectionLabel } from '@/components/uiComponents/editor/EditorSectionLabel';
import { ThemeCreateEditor } from '@/components/uiComponents/ThemeCreateEditor';
import { buildMultiTierSectionTheme, getCardThemeColorMode, themeFromSavedSectionTheme } from '@/utils/cardThemeColor';

const PRESET_NAMES: Record<CardThemePresetId, string> = {
  ocean: 'Ocean',
  midnight: 'Midnight',
  violet: 'Violet',
  sand: 'Sand',
  sunset: 'Sunset',
  aurora: 'Aurora',
};

const FONT_NAMES: Record<CardFontStyle, string> = {
  modern: 'Modern',
  classic: 'Classic',
  rounded: 'Rounded',
  mono: 'Mono',
};

const PRESET_IDS: CardThemePresetId[] = ['ocean', 'midnight', 'violet', 'sand', 'sunset', 'aurora'];
const FONT_IDS = Object.keys(FONT_NAMES) as CardFontStyle[];

const THEME_CARD_HEIGHT = 96;

type ThemeListItem =
  | { kind: 'saved'; saved: SavedSectionTheme }
  | { kind: 'create' }
  | { kind: 'tier-preset'; preset: MultiTierPreset };

function ThemeMultiColorTile({
  colors,
  height = THEME_CARD_HEIGHT,
  label,
  onPress,
  selected,
  tier,
  width,
}: {
  colors: string[];
  height?: number;
  label: string;
  onPress: () => void;
  selected: boolean;
  tier: number;
  width: number;
}) {
  return (
    <Pressable
      accessibilityLabel={`${label} style`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{ width, height }}
      className={`overflow-hidden rounded-2xl ${selected ? 'border-2 border-primary' : 'border border-slate-600/40'}`}
    >
      <View className="flex-1 flex-row">
        {colors.map((color, idx) => (
          <View key={idx} className="flex-1 h-full" style={{ backgroundColor: color }} />
        ))}
      </View>
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.75)']}
        style={[StyleSheet.absoluteFill, { top: '35%' }]}
      />
      <View className="absolute bottom-2 left-2.5 right-2.5 flex-row items-center justify-between">
        <Text numberOfLines={1} className="text-xs font-bold text-white">
          {label}
        </Text>
        <View className="rounded-md bg-black/40 px-1.5 py-0.5">
          <Text className="text-[10px] font-bold text-white/80">{tier}C</Text>
        </View>
      </View>
      {selected ? (
        <View className="absolute right-2 top-2 h-5 w-5 items-center justify-center rounded-full bg-primary">
          <Check color="#ffffff" size={12} strokeWidth={3} />
        </View>
      ) : null}
    </Pressable>
  );
}

function CreateStyleTile({
  selected,
  width,
  height = THEME_CARD_HEIGHT,
  onPress,
}: {
  selected: boolean;
  width: number;
  height?: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel="Create style"
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{ width, height }}
      className={`items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-slate-900/80 ${
        selected ? 'border-primary' : 'border-slate-500/70'
      }`}
    >
      <View
        className={`mb-1.5 h-9 w-9 items-center justify-center rounded-full ${
          selected ? 'bg-primary' : 'bg-slate-700'
        }`}
      >
        <Plus color="#ffffff" size={20} strokeWidth={2.5} />
      </View>
      <Text className="text-xs font-bold text-white">Create style</Text>
    </Pressable>
  );
}

export function CardStylingCustomizer({
  backLabel,
  customThemes,
  onBack,
  onChange,
  onSaveCustomTheme,
  theme,
}: {
  backLabel: string;
  customThemes: SavedSectionTheme[];
  onBack: () => void;
  onChange: (theme: CardVisualTheme) => void;
  onSaveCustomTheme: (entry: SavedSectionTheme) => void;
  theme: CardVisualTheme;
}) {
  const { width } = useWindowDimensions();
  const editorPaneWidth = Math.min(720, Math.max(260, width - 48));
  const gridGap = 12;
  const fontCardHeight = Math.min(144, Math.max(96, editorPaneWidth * 0.28));

  const [customEditorOpen, setCustomEditorOpen] = useState(false);
  const [draftThemeName, setDraftThemeName] = useState('');
  const [activeStylingPanel, setActiveStylingPanel] = useState<'theme' | 'font'>('theme');
  const [selectedTier, setSelectedTier] = useState<'all' | 2 | 3 | 4>('all');

  const themeItems = useMemo<ThemeListItem[]>(() => {
    const list: ThemeListItem[] = [{ kind: 'create' as const }];
    customThemes.forEach((saved) => {
      const tier = saved.paletteTier || 2;
      if (selectedTier === 'all' || tier === selectedTier) {
        list.push({ kind: 'saved' as const, saved });
      }
    });
    MULTI_TIER_PRESETS.forEach((preset) => {
      if (selectedTier === 'all' || preset.tier === selectedTier) {
        list.push({ kind: 'tier-preset' as const, preset });
      }
    });
    return list;
  }, [customThemes, selectedTier]);

  const categorizedThemeItems = useMemo(() => {
    const light: ThemeListItem[] = [{ kind: 'create' }];
    const dark: ThemeListItem[] = [];
    themeItems.forEach((item) => {
      if (item.kind === 'create') return;
      const categorizedTheme = item.kind === 'saved'
        ? themeFromSavedSectionTheme(item.saved, theme.fontStyle)
        : buildMultiTierSectionTheme(item.preset.colors, theme.fontStyle);
      (getCardThemeColorMode(categorizedTheme) === 'dark' ? dark : light).push(item);
    });
    return { light, dark };
  }, [theme.fontStyle, themeItems]);

  const themeGroups = [
    { key: 'light' as const, title: 'Light themes', items: categorizedThemeItems.light },
    { key: 'dark' as const, title: 'Dark themes', items: categorizedThemeItems.dark },
  ];
  const compactThemeGridHeight = themeGroups.reduce(
    (height, group) => {
      const visibleRows = Math.min(2, Math.ceil(group.items.length / 2));
      return height + 28 + visibleRows * fontCardHeight + Math.max(0, visibleRows - 1) * gridGap;
    },
    gridGap,
  );
  const gridHeight = themeGroups.reduce(
    (height, group) => height + 28 + Math.ceil(group.items.length / 2) * THEME_CARD_HEIGHT + Math.max(0, Math.ceil(group.items.length / 2) - 1) * gridGap,
    gridGap,
  );

  const isItemSelected = (item: ThemeListItem) => {
    if (item.kind === 'create') return customEditorOpen;
    if (item.kind === 'saved') return theme.customThemeId === item.saved.id && !customEditorOpen;
    if (item.kind === 'tier-preset') {
      const currentColors = theme.paletteColors || [theme.backgroundColor, theme.surfaceColor, theme.accentColor];
      return item.preset.colors.every((c, i) => currentColors[i] === c) && !customEditorOpen;
    }
    return false;
  };

  const openCustomEditor = () => {
    setCustomEditorOpen(true);
    if (!draftThemeName) {
      setDraftThemeName(theme.customThemeName ?? 'My style');
    }
  };

  const applyItem = (item: ThemeListItem) => {
    if (item.kind === 'create') {
      openCustomEditor();
      return;
    }
    setCustomEditorOpen(false);
    if (item.kind === 'saved') {
      onChange(themeFromSavedSectionTheme(item.saved, theme.fontStyle));
      return;
    }
    if (item.kind === 'tier-preset') {
      onChange(buildMultiTierSectionTheme(item.preset.colors, theme.fontStyle));
    }
  };

  const renderThemeItem = (
    item: ThemeListItem,
    cardWidth: number,
    cardHeight = THEME_CARD_HEIGHT,
  ) => {
    if (item.kind === 'create') {
      return (
        <CreateStyleTile
          selected={isItemSelected(item)}
          width={cardWidth}
          height={cardHeight}
          onPress={() => applyItem(item)}
        />
      );
    }
    if (item.kind === 'saved') {
      const colors = item.saved.paletteColors || item.saved.gradient;
      return (
        <ThemeMultiColorTile
          colors={colors}
          tier={item.saved.paletteTier || colors.length}
          label={item.saved.name}
          selected={isItemSelected(item)}
          width={cardWidth}
          height={cardHeight}
          onPress={() => applyItem(item)}
        />
      );
    }
    return (
      <ThemeMultiColorTile
        colors={item.preset.colors}
        tier={item.preset.tier}
        label={item.preset.name}
        selected={isItemSelected(item)}
        width={cardWidth}
        height={cardHeight}
        onPress={() => applyItem(item)}
      />
    );
  };

  const handleSaveCustomTheme = () => {
    const trimmed = draftThemeName.trim();
    if (!trimmed) return;

    const colors = theme.paletteColors || [theme.backgroundColor, theme.surfaceColor, theme.accentColor];
    const existingByName = customThemes.find(
      (item) => item.name.toLowerCase() === trimmed.toLowerCase(),
    );
    const entry: SavedSectionTheme = existingByName
      ? {
          ...existingByName,
          gradient: [theme.gradient[0], theme.gradient[1]],
          paletteColors: colors,
          paletteTier: (colors.length as 2 | 3 | 4) || 3,
        }
      : {
          id: `theme-${Date.now()}`,
          name: trimmed,
          gradient: [theme.gradient[0], theme.gradient[1]],
          paletteColors: colors,
          paletteTier: (colors.length as 2 | 3 | 4) || 3,
        };

    onSaveCustomTheme(entry);
    setCustomEditorOpen(false);
    setDraftThemeName('');
  };

  return (
    <View className="mb-5">
      <View className={`mb-4 flex-row items-center ${customEditorOpen ? 'gap-3' : 'justify-between'}`}>
        {!customEditorOpen ? (
          <>
            <Pressable
              accessibilityLabel={backLabel}
              accessibilityRole="button"
              className="flex-row items-center rounded-full border border-slate-200 bg-card px-3 py-2 active:opacity-70 dark:border-slate-700 dark:bg-dark-card"
              onPress={onBack}
            >
              <ChevronLeft color="#3b82f6" size={18} />
              <Text className="ml-1.5 text-sm font-bold text-primary dark:text-dark-primary">
                {backLabel}
              </Text>
            </Pressable>
            <Pressable
              accessibilityLabel={`Show ${activeStylingPanel === 'theme' ? 'font' : 'theme'} styles`}
              accessibilityRole="button"
              className="flex-row items-center rounded-full border border-primary/50 bg-blue-50 px-3 py-2 active:opacity-70 dark:bg-blue-950/30"
              onPress={() => setActiveStylingPanel((current) => (current === 'theme' ? 'font' : 'theme'))}
            >
              {activeStylingPanel === 'theme' ? (
                <TypeIcon color="#3b82f6" size={17} />
              ) : (
                <Palette color="#3b82f6" size={17} />
              )}
              <Text className="ml-2 text-sm font-bold text-primary dark:text-dark-primary">
                {activeStylingPanel === 'theme' ? 'Fonts' : 'Themes'}
              </Text>
            </Pressable>
          </>
        ) : null}
        {customEditorOpen ? (
          <>
            <TextInput
              accessibilityLabel="Style name"
              value={draftThemeName}
              onChangeText={setDraftThemeName}
              placeholder="Style name"
              placeholderTextColor="#64748b"
              maxLength={32}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-card px-3 py-2.5 text-sm text-textPrimary dark:border-slate-700 dark:bg-dark-card dark:text-dark-textPrimary"
            />
            <Pressable
              accessibilityLabel="Cancel creating style"
              accessibilityRole="button"
              className="px-2 py-2 active:opacity-70"
              onPress={() => setCustomEditorOpen(false)}
            >
              <Text className="text-sm font-bold text-primary dark:text-dark-primary">Cancel</Text>
            </Pressable>
          </>
        ) : null}
      </View>
      {customEditorOpen ? (
        <ThemeCreateEditor
          gradient={[theme.gradient[0], theme.gradient[1]]}
          fontStyle={theme.fontStyle}
          onPreviewChange={onChange}
          onSave={handleSaveCustomTheme}
          saveDisabled={!draftThemeName.trim()}
        />
      ) : activeStylingPanel === 'theme' ? (
        <>
          <EditorSectionLabel
            title="Section styling"
            subtitle="Themes are grouped by tier & brightness so every layout uses readable contrast."
          />
          <View className="mb-3 flex-row gap-1.5 rounded-xl border border-slate-200 bg-card p-1 dark:border-slate-700 dark:bg-dark-card">
            {(['all', 2, 3, 4] as const).map((tier) => {
              const active = selectedTier === tier;
              const label = tier === 'all' ? 'All' : `${tier} Colors`;
              return (
                <Pressable
                  key={tier}
                  onPress={() => setSelectedTier(tier)}
                  className={`flex-1 items-center justify-center rounded-lg py-1.5 ${
                    active ? 'bg-primary' : 'active:opacity-70'
                  }`}
                >
                  <Text className={`text-xs font-bold ${active ? 'text-white' : 'text-textSecondary dark:text-dark-textSecondary'}`}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <EditorPresentationCrossfade
            compactHeight={compactThemeGridHeight}
            expandedHeight={gridHeight}
            compact={
              <View style={{ gap: gridGap }}>
                {themeGroups.map((group) => (
                  <View key={group.key}>
                    <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-textSecondary dark:text-dark-textSecondary">
                      {group.title}
                    </Text>
                    <ScrollView
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      decelerationRate="fast"
                      style={{ width: editorPaneWidth }}
                    >
                      {Array.from({ length: Math.ceil(group.items.length / 4) }, (_, pageIndex) => (
                        <View
                          key={`${group.key}-theme-page-${pageIndex}`}
                          className="flex-row flex-wrap"
                          style={{ gap: gridGap, width: editorPaneWidth }}
                        >
                          {group.items.slice(pageIndex * 4, pageIndex * 4 + 4).map((item) => {
                            const key = item.kind === 'saved' ? item.saved.id : item.kind === 'create' ? 'create' : item.preset.id;
                            return (
                              <View key={key} style={{ width: (editorPaneWidth - gridGap) / 2 }}>
                                {renderThemeItem(item, (editorPaneWidth - gridGap) / 2, fontCardHeight)}
                              </View>
                            );
                          })}
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                ))}
              </View>
            }
            expanded={
              <View style={{ gap: gridGap }}>
                {themeGroups.map((group) => (
                  <View key={group.key}>
                    <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-textSecondary dark:text-dark-textSecondary">
                      {group.title}
                    </Text>
                    <EditorOptionGrid
                      items={group.items}
                      keyExtractor={(item) => item.kind === 'saved' ? item.saved.id : item.kind === 'create' ? 'create' : item.preset.id}
                      containerWidth={editorPaneWidth}
                      columns={2}
                      gap={gridGap}
                      singleColumnBelowWidth={0}
                      renderItem={(item, itemWidth) => renderThemeItem(item, itemWidth)}
                    />
                  </View>
                ))}
              </View>
            }
          />
        </>
      ) : (
        <>
          <EditorSectionLabel
            title="Font styles"
            subtitle="Swipe sideways to browse font style groups."
          />
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            style={{ width: editorPaneWidth }}
          >
            {Array.from({ length: Math.ceil(FONT_IDS.length / 4) }, (_, pageIndex) => (
              <View
                key={`font-page-${pageIndex}`}
                className="flex-row flex-wrap"
                style={{ gap: gridGap, width: editorPaneWidth }}
              >
                {FONT_IDS.slice(pageIndex * 4, pageIndex * 4 + 4).map((fontStyle) => {
                  const selected = theme.fontStyle === fontStyle;
                  return (
                    <Pressable
                      key={fontStyle}
                      accessibilityLabel={`Use ${FONT_NAMES[fontStyle]} font style`}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => onChange({ ...theme, fontStyle })}
                      className={`items-center justify-center rounded-2xl border px-3 ${
                        selected
                          ? 'border-2 border-primary bg-blue-50 dark:bg-blue-950/30'
                          : 'border-slate-200 bg-card dark:border-slate-700 dark:bg-dark-card'
                      }`}
                      style={{
                        height: fontCardHeight,
                        width: (editorPaneWidth - gridGap) / 2,
                      }}
                    >
                      <Text
                        style={{ fontFamily: getCardFontFamily(fontStyle) }}
                        className="text-base text-textPrimary dark:text-dark-textPrimary"
                      >
                        {FONT_NAMES[fontStyle]}
                      </Text>
                      {selected ? (
                        <View className="absolute right-2 top-2 h-5 w-5 items-center justify-center rounded-full bg-primary">
                          <Check color="#ffffff" size={12} strokeWidth={3} />
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
}
