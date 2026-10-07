import { useCallback, useEffect, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ColorPicker, { BrightnessSlider, HueSlider, Panel1, Preview, SaturationSlider } from 'reanimated-color-picker';
import { Text } from '@/components/uiComponents/Text';
import { EditorPresentationCrossfade } from '@/components/uiComponents/editor/EditorPresentationCrossfade';
import { normalizeHexColor } from '@/utils/cardThemeColor';

/** Rainbow spectrum fallback behind HueSlider — the library's own hue track
 * relies solely on a bundled image with no background-color fallback (unlike
 * Saturation/Brightness), so it can render blank with no visible track. */
const HUE_SPECTRUM_COLORS = ['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ff0000'] as const;

type ColorPickerDropdownProps = {
  compactTrigger?: boolean;
  editorExpanded?: boolean;
  largeExpandedPicker?: boolean;
  label: string;
  value: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (hex: string) => void;
  responsiveToEditorSheet?: boolean;
  showLabel?: boolean;
  showPickerPreview?: boolean;
  showPanel?: boolean;
  showTrigger?: boolean;
};

const PICKER_THUMB = {
  thumbShape: 'circle' as const,
  thumbSize: 20,
  thumbColor: '#ffffff',
  boundedThumb: true,
};

export function ColorPickerDropdown({
  compactTrigger = false,
  editorExpanded,
  largeExpandedPicker = false,
  label,
  value,
  open,
  onOpenChange,
  onChange,
  responsiveToEditorSheet = false,
  showLabel = true,
  showPickerPreview = true,
  showPanel = open,
  showTrigger = true,
}: ColorPickerDropdownProps) {
  const normalizedValue = normalizeHexColor(value) ?? '#2563eb';
  const expandedPreviewHeight = largeExpandedPicker ? 88 : 52;
  const expandedPanelHeight = largeExpandedPicker ? 300 : 148;
  const expandedPickerHeight = largeExpandedPicker ? 492 : 304;
  const [hexDraft, setHexDraft] = useState(normalizedValue.replace('#', '').toUpperCase());

  useEffect(() => {
    const next = normalizeHexColor(value);
    if (!next) return;
    const frame = requestAnimationFrame(() => {
      setHexDraft(next.replace('#', '').toUpperCase());
    });
    return () => cancelAnimationFrame(frame);
  }, [value]);

  const handlePickerChange = useCallback(
    (colors: { hex: string }) => {
      const next = normalizeHexColor(colors.hex);
      if (!next) return;
      setHexDraft(next.replace('#', '').toUpperCase());
      onChange(next);
    },
    [onChange],
  );

  const commitHex = () => {
    const normalized = normalizeHexColor(hexDraft);
    if (!normalized) {
      setHexDraft(normalizedValue.replace('#', '').toUpperCase());
      return;
    }
    onChange(normalized);
  };

  const hexInput = (
    <View className="flex-row items-center rounded-xl border border-slate-200 bg-background px-3 dark:border-slate-700 dark:bg-dark-background">
      <Text className="mr-1 text-sm font-semibold text-textMuted dark:text-dark-textMuted">#</Text>
      <TextInput
        value={hexDraft}
        onChangeText={(text) =>
          setHexDraft(
            text
              .replace(/[^0-9a-fA-F]/g, '')
              .slice(0, 6)
              .toUpperCase(),
          )
        }
        onBlur={commitHex}
        onSubmitEditing={commitHex}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={6}
        className="flex-1 py-2.5 font-mono text-sm font-semibold text-textPrimary dark:text-dark-textPrimary"
      />
    </View>
  );

  const compactPicker = (
    <ColorPicker
      value={normalizedValue}
      onChangeJS={handlePickerChange}
      sliderThickness={24}
      {...PICKER_THUMB}
      style={{ width: '100%' }}
    >
      <View className="h-[192px] flex-row gap-4">
        <View className={showPickerPreview ? 'flex-[1.65] justify-center' : 'flex-1 justify-center'}>
          <View className="mb-4">
            <Text className="mb-2 text-[10px] font-bold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
              Hue
            </Text>
            <LinearGradient
              colors={HUE_SPECTRUM_COLORS}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                width: '100%',
                height: 18,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: 'rgba(148, 163, 184, 0.35)',
                overflow: 'hidden',
              }}
            >
              <HueSlider
                {...PICKER_THUMB}
                sliderThickness={18}
                style={{ width: '100%', height: 18, borderRadius: 999 }}
              />
            </LinearGradient>
          </View>
          <View className="mb-4">
            <Text className="mb-2 text-[10px] font-bold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
              Saturation
            </Text>
            <SaturationSlider
              {...PICKER_THUMB}
              sliderThickness={18}
              style={{ width: '100%', height: 18, borderRadius: 999 }}
            />
          </View>
          <View>
            <Text className="mb-2 text-[10px] font-bold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
              Light
            </Text>
            <BrightnessSlider
              reverse
              {...PICKER_THUMB}
              sliderThickness={18}
              style={{ width: '100%', height: 18, borderRadius: 999 }}
            />
          </View>
        </View>
        {showPickerPreview ? (
          <View className="flex-1 justify-center">
            <Text className="mb-2 text-center text-[10px] font-bold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
              Color
            </Text>
            <Preview
              hideText
              hideInitialColor
              disableOpacityTexture
              style={{
                alignSelf: 'center',
                width: 58,
                height: 58,
                borderRadius: 14,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: 'rgba(148, 163, 184, 0.35)',
              }}
            />
            {hexInput}
          </View>
        ) : null}
      </View>
    </ColorPicker>
  );

  const expandedPicker = (
    <ColorPicker
      value={normalizedValue}
      onChangeJS={handlePickerChange}
      sliderThickness={12}
      {...PICKER_THUMB}
      style={{ width: '100%' }}
    >
      {showPickerPreview ? (
        <Preview
          hideText
          hideInitialColor
          disableOpacityTexture
          style={{
            width: '100%',
            height: expandedPreviewHeight,
            borderRadius: 14,
            marginBottom: 14,
            borderWidth: 1,
            borderColor: 'rgba(148, 163, 184, 0.35)',
          }}
        />
      ) : null}

      <Panel1
        {...PICKER_THUMB}
        style={{
          width: '100%',
          height: expandedPanelHeight,
          borderRadius: 16,
          marginBottom: 14,
          borderWidth: 1,
          borderColor: 'rgba(148, 163, 184, 0.25)',
        }}
      />

      <LinearGradient
        colors={HUE_SPECTRUM_COLORS}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          width: '100%',
          height: 14,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: 'rgba(148, 163, 184, 0.2)',
          overflow: 'hidden',
        }}
      >
        <HueSlider {...PICKER_THUMB} sliderThickness={14} style={{ width: '100%', height: 14, borderRadius: 999 }} />
      </LinearGradient>

      {showPickerPreview ? <View className="mt-4">{hexInput}</View> : null}
    </ColorPicker>
  );

  return (
    <View className={compactTrigger ? 'mb-0' : 'mb-4'}>
      {showTrigger ? (
        <>
          {!compactTrigger && showLabel ? (
            <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-textMuted dark:text-dark-textMuted">
              {label}
            </Text>
          ) : null}
          <Pressable
            accessibilityLabel={`${label}: ${normalizedValue}`}
            accessibilityRole="button"
            accessibilityState={{ expanded: open }}
            onPress={() => onOpenChange(!open)}
            className={`${compactTrigger ? 'min-h-[72px] items-center justify-center px-1.5 py-2' : 'flex-row items-center px-3 py-3'} rounded-xl border bg-card dark:bg-dark-card ${
              open ? 'border-primary dark:border-dark-primary' : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            <View
              className={`${compactTrigger ? 'mb-1 h-7 w-7' : 'mr-2 h-8 w-8'} rounded-full border border-white/25`}
              style={{ backgroundColor: normalizedValue }}
            />
            <Text
              className={`${compactTrigger ? 'text-[10px]' : 'flex-1 text-xs'} font-mono font-semibold text-textPrimary dark:text-dark-textPrimary`}
              numberOfLines={1}
            >
              #{hexDraft}
            </Text>
            <View className={compactTrigger ? 'absolute right-1.5 top-1.5' : ''}>
              {open ? (
                <ChevronUp color="#64748b" size={compactTrigger ? 14 : 17} />
              ) : (
                <ChevronDown color="#64748b" size={compactTrigger ? 14 : 17} />
              )}
            </View>
          </Pressable>
        </>
      ) : null}

      {showPanel ? (
        <View
          className={`${showTrigger ? 'mt-3' : ''} rounded-2xl border border-slate-200 bg-card p-4 dark:border-slate-700 dark:bg-dark-card`}
        >
          {responsiveToEditorSheet && editorExpanded === undefined ? (
            <EditorPresentationCrossfade
              compact={compactPicker}
              expanded={expandedPicker}
              compactHeight={192}
              expandedHeight={expandedPickerHeight}
            />
          ) : editorExpanded === false ? (
            compactPicker
          ) : (
            expandedPicker
          )}
        </View>
      ) : null}
    </View>
  );
}
