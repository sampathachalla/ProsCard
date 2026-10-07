import { useState } from 'react';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { Check, ChevronDown, ChevronLeft, ChevronUp, Palette, Type as TypeIcon } from 'lucide-react-native';
import {
  type CardFontStyle,
  type CardSectionId,
  type CardTemplateId,
  type CardVisualTheme,
  type SavedSectionTheme,
  getTemplatePaletteTier,
} from '@/components/cardsComponents/types/card.types';
import { getCardFontFamily } from '@/components/cardsComponents/Templates/cardTheme';
import { buildMultiTierSectionTheme, expandPresetColorsForLayoutTier } from '@/utils/cardThemeColor';
import { Text } from '@/components/uiComponents/Text';
import { EditorSectionLabel } from '@/components/uiComponents/editor/EditorSectionLabel';
import { ColorPickerDropdown } from '@/components/uiComponents/ColorPickerDropdown';

const FONT_NAMES: Record<CardFontStyle, string> = {
  modern: 'Modern',
  classic: 'Classic',
  rounded: 'Rounded',
  mono: 'Mono',
};

const FONT_IDS = Object.keys(FONT_NAMES) as CardFontStyle[];
type ColorTarget = 'background' | 'text';

export function CardStylingCustomizer({
  activeTemplateId,
  backLabel,
  editBarCollapsed = false,
  fullOpen = false,
  onBack,
  onChange,
  theme,
}: {
  activeTemplateId?: CardTemplateId;
  backLabel: string;
  customThemes: SavedSectionTheme[];
  editBarCollapsed?: boolean;
  fullOpen?: boolean;
  onBack: () => void;
  onChange: (theme: CardVisualTheme) => void;
  onSaveCustomTheme: (entry: SavedSectionTheme) => void;
  sectionId: CardSectionId;
  theme: CardVisualTheme;
}) {
  const { width } = useWindowDimensions();
  const editorPaneWidth = Math.min(720, Math.max(260, width - 48));
  const gridGap = 12;
  const fontCardHeight = editBarCollapsed
    ? Math.min(176, Math.max(128, editorPaneWidth * 0.34))
    : Math.min(144, Math.max(96, editorPaneWidth * 0.28));
  const [activeStylingPanel, setActiveStylingPanel] = useState<'background' | 'font'>('background');
  const [colorTarget, setColorTarget] = useState<ColorTarget>('background');
  const [colorTargetMenuOpen, setColorTargetMenuOpen] = useState(false);
  const layoutTier = activeTemplateId ? getTemplatePaletteTier(activeTemplateId) : theme.paletteTier || 3;

  const handleBackgroundChange = (backgroundColor: string) => {
    const currentColors = expandPresetColorsForLayoutTier(
      theme.paletteColors ?? [theme.backgroundColor, theme.surfaceColor, theme.accentColor],
      layoutTier,
      theme.fontStyle,
    );
    const nextColors = [...currentColors];
    nextColors[0] = backgroundColor;
    if (layoutTier >= 3) {
      nextColors[1] = backgroundColor;
    }

    const nextTheme = buildMultiTierSectionTheme(nextColors, theme.fontStyle);
    onChange({
      ...nextTheme,
      backgroundColor,
      surfaceColor: backgroundColor,
      gradient: [backgroundColor, nextTheme.gradient[1]],
      textColor: theme.textColorOverride ?? nextTheme.textColor,
      textColorOverride: theme.textColorOverride,
    });
  };

  const handleTextColorChange = (textColor: string) => {
    onChange({ ...theme, textColor, textColorOverride: textColor });
  };

  return (
    <View className="mb-5">
      <View className="mb-4 flex-row items-center justify-between">
        <Pressable
          accessibilityLabel={backLabel}
          accessibilityRole="button"
          className="flex-row items-center rounded-full border border-slate-200 bg-card px-3 py-2 active:opacity-70 dark:border-slate-700 dark:bg-dark-card"
          onPress={onBack}
        >
          <ChevronLeft color="#3b82f6" size={18} />
          <Text className="ml-1.5 text-sm font-bold text-primary dark:text-dark-primary">{backLabel}</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={`Show ${activeStylingPanel === 'background' ? 'font' : 'background'} styles`}
          accessibilityRole="button"
          className="flex-row items-center rounded-full border border-primary/50 bg-blue-50 px-3 py-2 active:opacity-70 dark:bg-blue-950/30"
          onPress={() => {
            setActiveStylingPanel((current) => (current === 'background' ? 'font' : 'background'));
          }}
        >
          {activeStylingPanel === 'background' ? (
            <TypeIcon color="#3b82f6" size={17} />
          ) : (
            <Palette color="#3b82f6" size={17} />
          )}
          <Text className="ml-2 text-sm font-bold text-primary dark:text-dark-primary">
            {activeStylingPanel === 'background' ? 'Fonts' : 'Background'}
          </Text>
        </Pressable>
      </View>
      {activeStylingPanel === 'background' ? (
        <>
          <View className="mb-2 flex-row items-center justify-between">
            <Pressable
              accessibilityLabel={`Editing ${colorTarget === 'background' ? 'background' : 'text'} color`}
              accessibilityRole="button"
              accessibilityState={{ expanded: colorTargetMenuOpen }}
              onPress={() => setColorTargetMenuOpen((open) => !open)}
              className="flex-row items-center rounded-lg py-2 pr-3 active:opacity-70"
            >
              <Text className="text-sm font-bold uppercase tracking-wider text-textPrimary dark:text-dark-textPrimary">
                {colorTarget === 'background' ? 'Background Color' : 'Text Color'}
              </Text>
              {colorTargetMenuOpen ? (
                <ChevronUp color="#64748b" size={18} style={{ marginLeft: 8 }} />
              ) : (
                <ChevronDown color="#64748b" size={18} style={{ marginLeft: 8 }} />
              )}
            </Pressable>
            <Pressable
              accessibilityLabel="Save color styling"
              accessibilityRole="button"
              onPress={onBack}
              className="min-h-[36px] items-center justify-center rounded-lg bg-primary px-4 active:opacity-70 dark:bg-dark-primary"
            >
              <Text className="text-sm font-bold text-white">Save</Text>
            </Pressable>
          </View>
          {colorTargetMenuOpen ? (
            <View className="mb-3 overflow-hidden rounded-xl border border-slate-200 bg-card dark:border-slate-700 dark:bg-dark-card">
              {(['background', 'text'] as ColorTarget[]).map((target, index) => {
                const selected = colorTarget === target;
                const label = target === 'background' ? 'Background Color' : 'Text Color';
                return (
                  <Pressable
                    key={target}
                    accessibilityLabel={`Edit ${label}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => {
                      setColorTarget(target);
                      setColorTargetMenuOpen(false);
                    }}
                    className={`min-h-[48px] flex-row items-center px-4 active:opacity-70 ${
                      index === 0 ? 'border-b border-slate-200 dark:border-slate-700' : ''
                    } ${selected ? 'bg-blue-50 dark:bg-blue-950/30' : ''}`}
                  >
                    <Text className="flex-1 text-sm font-semibold text-textPrimary dark:text-dark-textPrimary">
                      {label}
                    </Text>
                    {selected ? <Check color="#3b82f6" size={18} strokeWidth={3} /> : null}
                  </Pressable>
                );
              })}
            </View>
          ) : null}
          <ColorPickerDropdown
            editorExpanded={fullOpen}
            label={colorTarget === 'background' ? 'Background color' : 'Text color'}
            largeExpandedPicker
            value={colorTarget === 'background' ? theme.backgroundColor : (theme.textColorOverride ?? theme.textColor)}
            open
            responsiveToEditorSheet
            showLabel={false}
            showPanel
            showTrigger={false}
            onOpenChange={() => {}}
            onChange={colorTarget === 'background' ? handleBackgroundChange : handleTextColorChange}
          />
        </>
      ) : (
        <>
          <EditorSectionLabel title="Font styles" subtitle="Swipe sideways to browse font style groups." />
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
