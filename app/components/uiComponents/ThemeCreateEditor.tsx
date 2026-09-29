import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import type { CardFontStyle, CardVisualTheme } from '@/components/cardsComponents/types/card.types';
import { buildMultiTierSectionTheme } from '@/utils/cardThemeColor';
import { Text } from '@/components/uiComponents/Text';
import { ColorPickerDropdown } from '@/components/uiComponents/ColorPickerDropdown';

type ThemeCreateEditorProps = {
  gradient: [string, string];
  fontStyle: CardFontStyle;
  initialTier?: 2 | 3 | 4;
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
  initialTier = 3,
  onPreviewChange,
  onSave,
  saveDisabled = false,
}: ThemeCreateEditorProps) {
  const [colors, setColors] = useState<string[]>([
    gradient[0],
    '#ffffff',
    gradient[1],
    '#38bdf8',
  ]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const applyColors = useCallback(
    (nextColors: string[]) => {
      const activeColors = nextColors.slice(0, initialTier);
      onPreviewChange(buildMultiTierSectionTheme(activeColors, fontStyle));
    },
    [fontStyle, initialTier, onPreviewChange],
  );

  const handleColorChange = (index: number, hex: string) => {
    const updated = [...colors];
    updated[index] = hex;
    setColors(updated);
    applyColors(updated);
  };

  const activeColors = colors.slice(0, initialTier);

  return (
    <View>
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

      {openIndex !== null && openIndex < initialTier ? (
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

      <View className="mb-3 h-10 overflow-hidden rounded-xl border border-slate-600/40">
        <View className="h-full flex-row">
          {activeColors.map((color, idx) => (
            <View key={idx} className="flex-1 h-full" style={{ backgroundColor: color }} />
          ))}
        </View>
      </View>

      <Pressable
        onPress={onSave}
        disabled={saveDisabled}
        className={`h-10 items-center justify-center rounded-xl ${saveDisabled ? 'bg-slate-400' : 'bg-primary'}`}
      >
        <Text className="text-sm font-bold text-white">Save</Text>
      </Pressable>
    </View>
  );
}
