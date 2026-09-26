import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeftRight } from 'lucide-react-native';
import type { CardFontStyle, CardVisualTheme } from '@/components/cardsComponents/types/card.types';
import { buildMultiTierSectionTheme } from '@/utils/cardThemeColor';
import { Text } from '@/components/uiComponents/Text';
import { ColorPickerDropdown } from '@/components/uiComponents/ColorPickerDropdown';
import { EditorPresentationCrossfade } from '@/components/uiComponents/editor/EditorPresentationCrossfade';

type ThemeCreateEditorProps = {
  gradient: [string, string];
  fontStyle: CardFontStyle;
  onPreviewChange: (theme: CardVisualTheme) => void;
  onSave: () => void;
  saveDisabled?: boolean;
};

const COLOR_SLOT_LABELS: string[] = [
  'Base / Bg',
  'Surface / Accent',
  'Accent / Link',
  'Highlight / Border',
];

export function ThemeCreateEditor({
  gradient,
  fontStyle,
  onPreviewChange,
  onSave,
  saveDisabled = false,
}: ThemeCreateEditorProps) {
  const [tier, setTier] = useState<2 | 3 | 4>(3);
  const [colors, setColors] = useState<string[]>([
    gradient[0],
    '#ffffff',
    gradient[1],
    '#38bdf8',
  ]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const applyColors = useCallback(
    (nextColors: string[], nextTier: 2 | 3 | 4) => {
      const activeColors = nextColors.slice(0, nextTier);
      onPreviewChange(buildMultiTierSectionTheme(activeColors, fontStyle));
    },
    [fontStyle, onPreviewChange],
  );

  const handleColorChange = (index: number, hex: string) => {
    const updated = [...colors];
    updated[index] = hex;
    setColors(updated);
    applyColors(updated, tier);
  };

  const handleTierChange = (nextTier: 2 | 3 | 4) => {
    setTier(nextTier);
    applyColors(colors, nextTier);
  };

  const activeColors = colors.slice(0, tier);

  return (
    <View>
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-sm font-bold text-textPrimary dark:text-dark-textPrimary">Custom Theme Tier</Text>
        <View className="flex-row gap-1 rounded-lg border border-slate-200 bg-card p-0.5 dark:border-slate-700 dark:bg-dark-card">
          {([2, 3, 4] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => handleTierChange(t)}
              className={`rounded-md px-2.5 py-1 ${tier === t ? 'bg-primary' : 'active:opacity-70'}`}
            >
              <Text className={`text-xs font-bold ${tier === t ? 'text-white' : 'text-textSecondary dark:text-dark-textSecondary'}`}>
                {t} Colors
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="mb-3 flex-row gap-2">
        {activeColors.map((color, index) => (
          <View key={index} className="flex-1">
            <ColorPickerDropdown
              compactTrigger
              label={COLOR_SLOT_LABELS[index] || `Color ${index + 1}`}
              value={color}
              open={openIndex === index}
              showPanel={false}
              onOpenChange={(next) => setOpenIndex(next ? index : null)}
              onChange={(hex) => handleColorChange(index, hex)}
            />
          </View>
        ))}
      </View>

      {openIndex !== null && openIndex < tier ? (
        <ColorPickerDropdown
          label={COLOR_SLOT_LABELS[openIndex] || `Color ${openIndex + 1}`}
          value={colors[openIndex]}
          open
          responsiveToEditorSheet
          showTrigger={false}
          onOpenChange={() => setOpenIndex(null)}
          onChange={(hex) => handleColorChange(openIndex, hex)}
        />
      ) : null}

      <View className="mb-3 h-14 overflow-hidden rounded-2xl border border-slate-600/40">
        <View className="h-full flex-row">
          {activeColors.map((color, idx) => (
            <View key={idx} className="flex-1 h-full" style={{ backgroundColor: color }} />
          ))}
        </View>
      </View>

      <Pressable
        onPress={onSave}
        disabled={saveDisabled}
        className={`h-12 items-center justify-center rounded-xl ${saveDisabled ? 'bg-slate-400' : 'bg-primary'}`}
      >
        <Text className="text-sm font-bold text-white">Save to my styles</Text>
      </Pressable>
    </View>
  );
}
