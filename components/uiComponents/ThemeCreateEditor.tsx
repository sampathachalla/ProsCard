import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeftRight } from 'lucide-react-native';
import type { CardFontStyle, CardVisualTheme } from '@/components/cardsComponents/types/card.types';
import { buildCustomSectionTheme } from '@/utils/cardThemeColor';
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

type ColorStopKey = 'start' | 'end';

export function ThemeCreateEditor({
  gradient,
  fontStyle,
  onPreviewChange,
  onSave,
  saveDisabled = false,
}: ThemeCreateEditorProps) {
  const [openStop, setOpenStop] = useState<ColorStopKey | null>(null);

  const applyGradient = useCallback(
    (next: [string, string]) => {
      onPreviewChange(buildCustomSectionTheme(next, fontStyle));
    },
    [fontStyle, onPreviewChange],
  );

  const setStart = (hex: string) => applyGradient([hex, gradient[1]]);
  const setEnd = (hex: string) => applyGradient([gradient[0], hex]);
  const swapStops = () => applyGradient([gradient[1], gradient[0]]);

  return (
    <View>
      <Text className="mb-3 text-sm font-bold text-textPrimary dark:text-dark-textPrimary">Create style</Text>

      <EditorPresentationCrossfade
        compactHeight={104}
        expandedHeight={88}
        compact={
          <View className="flex-row gap-2">
            <View className="flex-1">
              <ColorPickerDropdown
                compactTrigger
                label="Start color"
                value={gradient[0]}
                open={openStop === 'start'}
                showPanel={false}
                onOpenChange={(next) => setOpenStop(next ? 'start' : null)}
                onChange={setStart}
              />
            </View>
            <View className="flex-1">
              <ColorPickerDropdown
                compactTrigger
                label="End color"
                value={gradient[1]}
                open={openStop === 'end'}
                showPanel={false}
                onOpenChange={(next) => setOpenStop(next ? 'end' : null)}
                onChange={setEnd}
              />
            </View>
            <View className="flex-1">
              <Text className="mb-2 text-center text-xs font-bold uppercase tracking-wider text-textMuted dark:text-dark-textMuted">
                Final style
              </Text>
              <View className="h-[72px] items-center justify-center overflow-hidden rounded-xl border border-slate-600/40">
                <LinearGradient
                  colors={[gradient[0], gradient[1]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              </View>
            </View>
          </View>
        }
        expanded={
          <View className="flex-row gap-3">
            <View className="flex-1">
              <ColorPickerDropdown
                label="Start color"
                value={gradient[0]}
                open={openStop === 'start'}
                showPanel={false}
                onOpenChange={(next) => setOpenStop(next ? 'start' : null)}
                onChange={setStart}
              />
            </View>
            <View className="flex-1">
              <ColorPickerDropdown
                label="End color"
                value={gradient[1]}
                open={openStop === 'end'}
                showPanel={false}
                onOpenChange={(next) => setOpenStop(next ? 'end' : null)}
                onChange={setEnd}
              />
            </View>
          </View>
        }
      />

      {openStop ? (
        <ColorPickerDropdown
          label={openStop === 'start' ? 'Start color' : 'End color'}
          value={openStop === 'start' ? gradient[0] : gradient[1]}
          open
          responsiveToEditorSheet
          showTrigger={false}
          onOpenChange={() => setOpenStop(null)}
          onChange={openStop === 'start' ? setStart : setEnd}
        />
      ) : null}

      <EditorPresentationCrossfade
        compact={<View />}
        expanded={
          <View className="overflow-hidden rounded-2xl border border-slate-600/40" style={{ height: 56 }}>
            <LinearGradient
              colors={[gradient[0], gradient[1]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </View>
        }
        compactHeight={0}
        expandedHeight={68}
      />

      <EditorPresentationCrossfade
        compactHeight={48}
        expandedHeight={108}
        compact={
          <View className="flex-row gap-3">
            <Pressable
              onPress={swapStops}
              className="h-12 flex-1 flex-row items-center justify-center rounded-xl border border-slate-200 px-2 dark:border-slate-700"
            >
              <ArrowLeftRight color="#64748b" size={16} />
              <Text className="ml-2 text-sm font-semibold text-textPrimary dark:text-dark-textPrimary">
                Swap colors
              </Text>
            </Pressable>
            <Pressable
              onPress={onSave}
              disabled={saveDisabled}
              className={`h-12 flex-1 items-center justify-center rounded-xl px-2 ${saveDisabled ? 'bg-slate-400' : 'bg-primary'}`}
            >
              <Text numberOfLines={1} className="text-sm font-bold text-white">Save style</Text>
            </Pressable>
          </View>
        }
        expanded={
          <View>
            <Pressable
              onPress={swapStops}
              className="mb-3 h-12 flex-row items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700"
            >
              <ArrowLeftRight color="#64748b" size={16} />
              <Text className="ml-2 text-sm font-semibold text-textPrimary dark:text-dark-textPrimary">
                Swap colors
              </Text>
            </Pressable>
            <Pressable
              onPress={onSave}
              disabled={saveDisabled}
              className={`h-12 items-center justify-center rounded-xl ${saveDisabled ? 'bg-slate-400' : 'bg-primary'}`}
            >
              <Text className="text-sm font-bold text-white">Save to my styles</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}
