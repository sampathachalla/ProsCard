import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, ChevronLeft, Palette, Sparkles, Type as TypeIcon } from 'lucide-react-native';
import {
  type CardFontStyle,
  type CardSectionId,
  type CardTemplateId,
  type CardVisualTheme,
  type SavedSectionTheme,
} from '@/pages/cards/types/card.types';
import { getCardFontFamily } from '@/pages/cards/Templates/cardTheme';
import { extractLogoPalette, getCachedLogoPalette } from '@/pages/profile/Services/mediaService';
import { useLogoThemePreference } from '@/pages/profile/Hooks/useLogoThemePreference';
import type { LogoPalette } from '@/services/api/types';
import { buildDynamicTagThemes, buildThemeFromLogoPalette } from '@/utils/cardThemeColor';
import { Text } from '@/common/ui/Text';
import { EditorSectionLabel } from '@/common/ui/editor/EditorSectionLabel';

const FONT_NAMES: Record<CardFontStyle, string> = {
  modern: 'Modern',
  classic: 'Classic',
  rounded: 'Rounded',
  mono: 'Mono',
};

const FONT_IDS = Object.keys(FONT_NAMES) as CardFontStyle[];

type GlobalThemeOption = {
  name: string;
  description: string;
  theme: Omit<CardVisualTheme, 'fontStyle'>;
};

const GLOBAL_THEME_OPTIONS: GlobalThemeOption[] = [
  {
    name: 'Executive Ocean',
    description: 'Crisp blue with a clean white surface',
    theme: {
      id: 'ocean', backgroundColor: '#eaf3ff', surfaceColor: '#f8fbff', textColor: '#10213d', mutedTextColor: '#465a78',
      accentColor: '#0284c7', gradient: ['#1d4ed8', '#0891b2'], paletteTier: 3,
      paletteColors: ['#eaf3ff', '#f8fbff', '#0284c7'],
    },
  },
  {
    name: 'Midnight Boardroom',
    description: 'Deep navy with cool cyan details',
    theme: {
      id: 'midnight', backgroundColor: '#020617', surfaceColor: '#0f172a', textColor: '#f8fafc', mutedTextColor: '#cbd5e1',
      accentColor: '#38bdf8', gradient: ['#0f172a', '#075985'], paletteTier: 3,
      paletteColors: ['#020617', '#0f172a', '#38bdf8'],
    },
  },
  {
    name: 'Graphite Studio',
    description: 'Neutral slate with precise blue accents',
    theme: {
      id: 'custom', backgroundColor: '#e2e8f0', surfaceColor: '#f8fafc', textColor: '#182230', mutedTextColor: '#4b5563',
      accentColor: '#2563eb', gradient: ['#334155', '#0f172a'], paletteTier: 3,
      paletteColors: ['#e2e8f0', '#f8fafc', '#2563eb'],
    },
  },
  {
    name: 'Emerald Ledger',
    description: 'Confident green with a soft mint surface',
    theme: {
      id: 'aurora', backgroundColor: '#e8f8f1', surfaceColor: '#f6fcf9', textColor: '#123b31', mutedTextColor: '#315f52',
      accentColor: '#059669', gradient: ['#047857', '#0f766e'], paletteTier: 3,
      paletteColors: ['#e8f8f1', '#f6fcf9', '#059669'],
    },
  },
  {
    name: 'Warm Sand',
    description: 'Refined ivory with warm gold details',
    theme: {
      id: 'sand', backgroundColor: '#f8f1e4', surfaceColor: '#fffaf0', textColor: '#3f2a14', mutedTextColor: '#73512d',
      accentColor: '#ca8a04', gradient: ['#92400e', '#d97706'], paletteTier: 3,
      paletteColors: ['#f8f1e4', '#fffaf0', '#ca8a04'],
    },
  },
  {
    name: 'Ember Signature',
    description: 'Warm coral with a polished cream surface',
    theme: {
      id: 'sunset', backgroundColor: '#fff0e7', surfaceColor: '#fff9f5', textColor: '#4a2115', mutedTextColor: '#8a4630',
      accentColor: '#ea580c', gradient: ['#c2410c', '#f97316'], paletteTier: 3,
      paletteColors: ['#fff0e7', '#fff9f5', '#ea580c'],
    },
  },
  {
    name: 'Arctic Steel',
    description: 'Cool silver with disciplined blue details',
    theme: {
      id: 'custom', backgroundColor: '#e9eef4', surfaceColor: '#f8fafc', textColor: '#172033', mutedTextColor: '#526175',
      accentColor: '#0f6cbd', gradient: ['#64748b', '#0f6cbd'], paletteTier: 3,
      paletteColors: ['#e9eef4', '#f8fafc', '#0f6cbd'],
    },
  },
  {
    name: 'Burgundy Reserve',
    description: 'Deep wine with understated rose accents',
    theme: {
      id: 'custom', backgroundColor: '#1f0a12', surfaceColor: '#35101f', textColor: '#fff7f8', mutedTextColor: '#f0b8c5',
      accentColor: '#e85d75', gradient: ['#4c0519', '#9f1239'], paletteTier: 3,
      paletteColors: ['#1f0a12', '#35101f', '#e85d75'],
    },
  },
  {
    name: 'Forest Executive',
    description: 'Rich evergreen with refined jade details',
    theme: {
      id: 'custom', backgroundColor: '#052e24', surfaceColor: '#0b4537', textColor: '#f0fdf9', mutedTextColor: '#a7f3d0',
      accentColor: '#34d399', gradient: ['#064e3b', '#0f766e'], paletteTier: 3,
      paletteColors: ['#052e24', '#0b4537', '#34d399'],
    },
  },
  {
    name: 'Rose Quartz',
    description: 'Soft blush with confident berry details',
    theme: {
      id: 'custom', backgroundColor: '#fbecef', surfaceColor: '#fff8fa', textColor: '#4c1625', mutedTextColor: '#8c3a52',
      accentColor: '#e11d48', gradient: ['#be123c', '#fb7185'], paletteTier: 3,
      paletteColors: ['#fbecef', '#fff8fa', '#e11d48'],
    },
  },
  {
    name: 'Cobalt Precision',
    description: 'Saturated blue with a bright ice surface',
    theme: {
      id: 'custom', backgroundColor: '#e8f0ff', surfaceColor: '#f7faff', textColor: '#172554', mutedTextColor: '#3f568c',
      accentColor: '#1d4ed8', gradient: ['#1e3a8a', '#2563eb'], paletteTier: 3,
      paletteColors: ['#e8f0ff', '#f7faff', '#1d4ed8'],
    },
  },
  {
    name: 'Monochrome Paper',
    description: 'Clean white with timeless ink contrast',
    theme: {
      id: 'custom', backgroundColor: '#efefed', surfaceColor: '#fafaf9', textColor: '#1c1917', mutedTextColor: '#57534e',
      accentColor: '#292524', gradient: ['#44403c', '#0c0a09'], paletteTier: 3,
      paletteColors: ['#efefed', '#fafaf9', '#292524'],
    },
  },
];

export function CardStylingCustomizer({
  backLabel,
  embedded = false,
  editBarCollapsed = false,
  fullOpen = false,
  logoUrl,
  onBack,
  onChange,
  theme,
}: {
  activeTemplateId?: CardTemplateId;
  backLabel: string;
  customThemes: SavedSectionTheme[];
  editBarCollapsed?: boolean;
  embedded?: boolean;
  fullOpen?: boolean;
  logoUrl?: string;
  onBack: () => void;
  onChange: (theme: CardVisualTheme) => void;
  onSaveCustomTheme: (entry: SavedSectionTheme) => void;
  sectionId: CardSectionId;
  theme: CardVisualTheme;
}) {
  const { width } = useWindowDimensions();
  const editorPaneWidth = Math.min(720, Math.max(260, width - 48));
  const gridGap = 12;
  const cardWidth = (editorPaneWidth - gridGap) / 2;
  const [activePanel, setActivePanel] = useState<'themes' | 'fonts'>('themes');
  const [themePage, setThemePage] = useState(0);
  const { enabled: logoThemesEnabled } = useLogoThemePreference();
  const [extractingLogo, setExtractingLogo] = useState(false);
  const [logoPalette, setLogoPalette] = useState<LogoPalette | null>(() => {
    if (!logoUrl?.trim()) return null;
    return getCachedLogoPalette(logoUrl.trim()) ?? null;
  });

  useEffect(() => {
    if (!logoThemesEnabled || !logoUrl?.trim() || logoPalette) return;
    let active = true;
    extractLogoPalette({ imageUrl: logoUrl.trim() })
      .then((pal) => {
        if (active && pal) setLogoPalette(pal);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [logoThemesEnabled, logoUrl, logoPalette]);

  const dynamicTagThemes = useMemo(() => {
    return logoThemesEnabled && logoPalette ? buildDynamicTagThemes(logoPalette) : null;
  }, [logoThemesEnabled, logoPalette]);

  const TAG_THEME_KEYS = ['Business', 'Networking', 'Personal', 'Portfolio'] as const;
  const TAG_DESCRIPTIONS: Record<(typeof TAG_THEME_KEYS)[number], string> = {
    Business: 'Executive brand contrast',
    Networking: 'High-energy electric spotlight',
    Personal: 'Warm & approachable harmony',
    Portfolio: 'Minimalist studio editorial',
  };

  const themePages = Array.from({ length: Math.ceil(GLOBAL_THEME_OPTIONS.length / 4) }, (_, index) =>
    GLOBAL_THEME_OPTIONS.slice(index * 4, index * 4 + 4),
  );
  const compactThemeCards = !editBarCollapsed;
  const useThemeCarousel = !fullOpen || compactThemeCards;

  const handleAutoMatchLogo = async () => {
    if (!logoUrl?.trim() || extractingLogo) return;
    setExtractingLogo(true);
    try {
      const palette = await extractLogoPalette({ imageUrl: logoUrl.trim() });
      setLogoPalette(palette);
      const brandTheme = buildThemeFromLogoPalette(palette, theme.fontStyle);
      onChange(brandTheme);
    } catch (error) {
      Alert.alert(
        'Couldn’t match logo colors',
        error instanceof Error ? error.message : 'Please check your connection and try again.',
      );
    } finally {
      setExtractingLogo(false);
    }
  };

  const renderDynamicTheme = (tagKey: (typeof TAG_THEME_KEYS)[number]) => {
    if (!dynamicTagThemes) return null;
    const dynamicTheme = dynamicTagThemes[tagKey];
    const selected = theme.customThemeName === dynamicTheme.customThemeName
      || (theme.gradient[0] === dynamicTheme.gradient[0] && theme.gradient[1] === dynamicTheme.gradient[1]);
    return (
      <Pressable
        key={tagKey}
        accessibilityLabel={`Apply ${dynamicTheme.customThemeName} theme`}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={() => onChange({ ...dynamicTheme, fontStyle: theme.fontStyle })}
        className={`overflow-hidden rounded-2xl border bg-card active:opacity-80 dark:bg-dark-card ${selected ? 'border-2 border-primary' : 'border-slate-200 dark:border-slate-700'}`}
        style={{ height: compactThemeCards ? 104 : 148, width: cardWidth }}
      >
        <LinearGradient colors={dynamicTheme.gradient} style={{ height: compactThemeCards ? 40 : 64, width: '100%' }} />
        <View className={compactThemeCards ? 'px-3 py-2' : 'p-3'}>
          <View className="flex-row items-center">
            <Sparkles color="#2563eb" size={12} />
            <Text numberOfLines={1} className="ml-1 text-sm font-bold text-textPrimary dark:text-dark-textPrimary">{dynamicTheme.customThemeName}</Text>
          </View>
          <Text numberOfLines={compactThemeCards ? 1 : 2} className="mt-1 text-xs leading-4 text-textMuted dark:text-slate-400">{TAG_DESCRIPTIONS[tagKey]}</Text>
        </View>
        {selected ? (
          <View className="absolute right-2 top-2 h-6 w-6 items-center justify-center rounded-full bg-white">
            <Check color="#2563eb" size={14} strokeWidth={3} />
          </View>
        ) : null}
      </Pressable>
    );
  };

  const applyPreset = (option: GlobalThemeOption) => {
    onChange({
      ...option.theme,
      fontStyle: theme.fontStyle,
      gradient: [...option.theme.gradient],
      paletteColors: option.theme.paletteColors ? [...option.theme.paletteColors] : undefined,
      textColorOverride: undefined,
    });
  };

  const renderThemeOption = (option: GlobalThemeOption) => {
    const selected = theme.backgroundColor.toLowerCase() === option.theme.backgroundColor.toLowerCase()
      && theme.accentColor.toLowerCase() === option.theme.accentColor.toLowerCase();
    return (
      <Pressable
        key={option.name}
        accessibilityLabel={`Apply ${option.name} theme to all card sections`}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={() => applyPreset(option)}
        className={`overflow-hidden rounded-2xl border bg-card active:opacity-80 dark:bg-dark-card ${selected ? 'border-2 border-primary' : 'border-slate-200 dark:border-slate-700'}`}
        style={{ height: compactThemeCards ? 104 : 148, width: cardWidth }}
      >
        <LinearGradient colors={option.theme.gradient} style={{ height: compactThemeCards ? 40 : 64, width: '100%' }} />
        <View className={compactThemeCards ? 'px-3 py-2' : 'p-3'}>
          <Text numberOfLines={1} className="text-sm font-bold text-textPrimary dark:text-dark-textPrimary">{option.name}</Text>
          <Text numberOfLines={compactThemeCards ? 1 : 2} className="mt-1 text-xs leading-4 text-textMuted dark:text-slate-400">{option.description}</Text>
        </View>
        {selected ? (
          <View className="absolute right-2 top-2 h-6 w-6 items-center justify-center rounded-full bg-white">
            <Check color="#2563eb" size={14} strokeWidth={3} />
          </View>
        ) : null}
      </Pressable>
    );
  };

  return (
    <View className="mb-5">
      <View className="mb-4 flex-row items-center justify-between">
        {embedded ? (
          <View className="mr-3 min-w-0 flex-1">
            <Text className="text-xs font-bold uppercase text-textMuted dark:text-dark-textMuted">
              {activePanel === 'themes' ? 'Card themes' : 'Font styles'}
            </Text>
            <Text numberOfLines={1} variant="muted" className="mt-1 text-xs">
              {activePanel === 'themes' ? 'Styles every card section.' : 'Applies across the complete card.'}
            </Text>
          </View>
        ) : (
          <Pressable accessibilityLabel={backLabel} accessibilityRole="button" className="min-h-[44px] flex-row items-center rounded-full border border-slate-200 bg-card px-3 active:opacity-70 dark:border-slate-700 dark:bg-dark-card" onPress={onBack}>
            <ChevronLeft color="#3b82f6" size={18} />
            <Text className="ml-1.5 text-sm font-bold text-primary dark:text-dark-primary">{backLabel}</Text>
          </Pressable>
        )}
        <Pressable
          accessibilityLabel={`Show ${activePanel === 'themes' ? 'font' : 'card theme'} choices`}
          accessibilityRole="button"
          className="min-h-[44px] flex-row items-center rounded-full border border-primary/50 bg-blue-50 px-3 active:opacity-70 dark:bg-blue-950/30"
          onPress={() => setActivePanel((current) => (current === 'themes' ? 'fonts' : 'themes'))}
        >
          {activePanel === 'themes' ? <TypeIcon color="#3b82f6" size={17} /> : <Palette color="#3b82f6" size={17} />}
          <Text className="ml-2 text-sm font-bold text-primary dark:text-dark-primary">{activePanel === 'themes' ? 'Fonts' : 'Themes'}</Text>
        </Pressable>
      </View>

      {activePanel === 'themes' ? (
        <>
          {logoThemesEnabled && logoUrl?.trim() ? (
            <Pressable
              accessibilityLabel="Auto-match card theme to company logo"
              accessibilityRole="button"
              onPress={() => { void handleAutoMatchLogo(); }}
              disabled={extractingLogo}
              className={`mb-3.5 flex-row items-center rounded-2xl border p-3 active:opacity-80 ${
                theme.customThemeName === 'Brand Match'
                  ? 'border-2 border-primary bg-primary/10 dark:bg-primary/20'
                  : 'border-blue-200 bg-blue-50/70 dark:border-blue-900/50 dark:bg-blue-950/20'
              }`}
            >
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/15 dark:bg-primary/25">
                {extractingLogo ? (
                  <ActivityIndicator size="small" color="#2563eb" />
                ) : (
                  <Sparkles color="#2563eb" size={20} />
                )}
              </View>
              <View className="ml-3 flex-1">
                <View className="flex-row items-center">
                  <Text className="text-sm font-bold text-textPrimary dark:text-dark-textPrimary">
                    Auto-match Company Logo
                  </Text>
                  {theme.customThemeName === 'Brand Match' ? (
                    <View className="ml-2 rounded-full bg-primary px-2 py-0.5">
                      <Text className="text-[10px] font-bold text-white">Active</Text>
                    </View>
                  ) : null}
                </View>
                <Text numberOfLines={1} className="mt-0.5 text-xs text-textMuted dark:text-slate-400">
                  Extracts brand colors & protects logo visibility
                </Text>
              </View>
            </Pressable>
          ) : null}

          {dynamicTagThemes ? (
            <View className="mb-4">
              <View className="mb-1.5 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Sparkles color="#2563eb" size={14} />
                  <Text className="ml-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                    Dynamic Brand Themes
                  </Text>
                </View>
                {logoPalette?.paletteSource === 'llm' ? (
                  <View className="rounded-full bg-primary/10 px-2 py-0.5">
                    <Text className="text-[10px] font-bold text-primary">AI Detected</Text>
                  </View>
                ) : null}
              </View>
              <Text className="mb-3 text-xs text-textMuted dark:text-slate-400">
                4 dynamic themes tuned specifically for your logo across card styles:
              </Text>
              <View className="flex-row flex-wrap" style={{ gap: gridGap }}>
                {TAG_THEME_KEYS.map(renderDynamicTheme)}
              </View>
            </View>
          ) : null}
          {!embedded ? <EditorSectionLabel title="Card themes" subtitle="One selection styles every card section." /> : null}
          {!useThemeCarousel ? (
            <View className="flex-row flex-wrap" style={{ gap: gridGap }}>
              {GLOBAL_THEME_OPTIONS.map(renderThemeOption)}
            </View>
          ) : (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                onMomentumScrollEnd={(event) => {
                  setThemePage(Math.round(event.nativeEvent.contentOffset.x / editorPaneWidth));
                }}
                style={{ width: editorPaneWidth }}
              >
                {themePages.map((page, pageIndex) => (
                  <View
                    key={`theme-page-${pageIndex}`}
                    className="flex-row flex-wrap"
                    style={{ gap: gridGap, width: editorPaneWidth }}
                  >
                    {page.map(renderThemeOption)}
                  </View>
                ))}
              </ScrollView>
              <View className="mt-3 flex-row items-center justify-center gap-2">
                {themePages.map((_, index) => (
                  <View
                    key={`theme-dot-${index}`}
                    className={index === themePage ? 'h-2 w-7 rounded-full bg-primary' : 'h-2 w-2 rounded-full bg-slate-600'}
                  />
                ))}
              </View>
            </>
          )}
        </>
      ) : (
        <>
          {!embedded ? <EditorSectionLabel title="Font styles" subtitle="The selected font applies across the complete card." /> : null}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: editorPaneWidth }}>
            <View className="flex-row flex-wrap" style={{ gap: gridGap, width: editorPaneWidth }}>
              {FONT_IDS.map((fontStyle) => {
                const selected = theme.fontStyle === fontStyle;
                return (
                  <Pressable
                    key={fontStyle}
                    accessibilityLabel={`Use ${FONT_NAMES[fontStyle]} font across all card sections`}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => onChange({ ...theme, fontStyle })}
                    className={`items-center justify-center rounded-2xl border px-3 ${selected ? 'border-2 border-primary bg-blue-50 dark:bg-blue-950/30' : 'border-slate-200 bg-card dark:border-slate-700 dark:bg-dark-card'}`}
                    style={{ height: editBarCollapsed ? 128 : 104, width: cardWidth }}
                  >
                    <Text style={{ fontFamily: getCardFontFamily(fontStyle) }} className="text-base text-textPrimary dark:text-dark-textPrimary">{FONT_NAMES[fontStyle]}</Text>
                    {selected ? (
                      <View className="absolute right-2 top-2 h-5 w-5 items-center justify-center rounded-full bg-primary">
                        <Check color="#ffffff" size={12} strokeWidth={3} />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </>
      )}
    </View>
  );
}
