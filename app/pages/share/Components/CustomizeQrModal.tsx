import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as NativeText,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Palette, X } from 'lucide-react-native';

import { QRCodeView } from '@/common/ui/QRCodeView';
import { Text } from '@/common/ui/Text';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';
import type {
  QrCornerStyle,
  QrCustomization,
  QrCustomizationPreset,
  QrExportFormat,
  QrFrameStyle,
  QrLogoSize,
  QrPatternStyle,
} from '../types/share.types';

export interface CustomizeQrModalProps {
  visible: boolean;
  shareUrl: string;
  activePreset: QrCustomizationPreset;
  centerLogoUrl?: string;
  centerLogoBackground?: string;
  centerLogoBorderColor?: string;
  customization: QrCustomization;
  onChange: (patch: Partial<QrCustomization>) => void;
  onClose: () => void;
}

interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

const PATTERN_OPTIONS: SegmentOption<QrPatternStyle>[] = [
  { value: 'dots', label: 'Dots' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'square', label: 'Square' },
];

const CORNER_OPTIONS: SegmentOption<QrCornerStyle>[] = [
  { value: 'rounded', label: 'Rounded' },
  { value: 'square', label: 'Square' },
  { value: 'circle', label: 'Circle' },
];

const LOGO_SIZE_OPTIONS: SegmentOption<QrLogoSize>[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

const FRAME_OPTIONS: SegmentOption<QrFrameStyle>[] = [
  { value: 'none', label: 'None' },
  { value: 'simple', label: 'Simple' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'badge', label: 'Badge' },
];

const CAPTION_OPTIONS: SegmentOption<'show' | 'hide'>[] = [
  { value: 'show', label: 'Show' },
  { value: 'hide', label: 'Hide' },
];

const EXPORT_OPTIONS: SegmentOption<QrExportFormat>[] = [
  { value: 'png', label: 'PNG' },
  { value: 'svg', label: 'SVG' },
  { value: 'pdf', label: 'PDF' },
];

// ThemeContext resolves the user's light/dark/system preference and drives
// NativeWind's `dark:` classes, so inline colors must follow it alone.
function useIsDarkMode() {
  const { theme } = useThemeContext();
  return theme === 'dark';
}

function SegmentedRow<T extends string>({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: T;
  options: SegmentOption<T>[];
  onSelect: (value: T) => void;
}) {
  const isDark = useIsDarkMode();

  const selectedBg = isDark ? '#0ea5e9' : '#2563eb';
  const selectedBorder = isDark ? '#38bdf8' : '#2563eb';
  const selectedTextColor = '#ffffff';
  const unselectedTextColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <View className="mt-4">
      <Text
        variant="none"
        className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
      >
        {label}
      </Text>
      <View
        className="flex-row rounded-xl border p-1"
        style={{
          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : '#f1f5f9',
          borderColor: isDark ? 'rgba(51, 65, 85, 0.8)' : '#e2e8f0',
        }}
      >
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <Pressable
              key={option.value}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              onPress={() => onSelect(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              className="min-h-[36px] flex-1 flex-row items-center justify-center rounded-lg px-2 py-1.5 active:opacity-80"
              style={
                selected
                  ? {
                      backgroundColor: selectedBg,
                      borderColor: selectedBorder,
                      borderWidth: 1,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: isDark ? 0.3 : 0.08,
                      shadowRadius: 2,
                      elevation: 2,
                    }
                  : undefined
              }
            >
              <NativeText
                numberOfLines={1}
                pointerEvents="none"
                maxFontSizeMultiplier={1.2}
                style={{
                  color: selected ? selectedTextColor : unselectedTextColor,
                  fontSize: options.length > 3 ? 12 : 13,
                  fontWeight: selected ? '700' : '500',
                  textAlign: 'center',
                }}
              >
                {option.label}
              </NativeText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function CustomizeQrModal({
  visible,
  shareUrl,
  activePreset,
  centerLogoUrl,
  centerLogoBackground,
  centerLogoBorderColor,
  customization,
  onChange,
  onClose,
}: CustomizeQrModalProps) {
  const isDark = useIsDarkMode();
  const tint = isDark ? Colors.dark.tint : Colors.light.tint;
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const compactHeight = windowHeight < 720;
  const sheetMaxHeight = Math.max(
    420,
    windowHeight - Math.max(insets.top, 12) - Math.max(insets.bottom, 8) - 12,
  );
  const previewSize = Math.max(
    116,
    Math.min(compactHeight ? 132 : 168, windowWidth - 112),
  );
  const caption = customization.caption ?? '';

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdropOverlay}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss modal"
          style={[StyleSheet.absoluteFill, styles.backdropPressable]}
          onPress={onClose}
        />

        {/* Tap-through wrapper; sheet uses pointerEvents="auto" so touches reach controls. */}
        <View pointerEvents="box-none" style={styles.sheetAnchor}>
          <View
            pointerEvents="auto"
            style={{
              width: '100%',
              maxWidth: 420,
              height: sheetMaxHeight,
              maxHeight: sheetMaxHeight,
            }}
            className="flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-800 dark:bg-dark-card"
          >
              {/* 1. Header (Sticky) */}
              <View className="flex-row items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800/80">
                <View className="flex-row items-center gap-2.5">
                  <View
                    className="h-9 w-9 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: isDark
                        ? 'rgba(56, 189, 248, 0.15)'
                        : 'rgba(37, 99, 235, 0.1)',
                    }}
                  >
                    <Palette size={18} color={tint} strokeWidth={2.2} />
                  </View>
                  <View className="min-w-0 flex-1 pr-2">
                    <Text
                      variant="none"
                      className="text-[17px] font-bold tracking-tight text-textPrimary dark:text-dark-textPrimary"
                    >
                      Customize QR Code
                    </Text>
                    <Text
                      variant="none"
                      className="text-[12px] font-normal text-slate-500 dark:text-slate-400"
                    >
                      Real-time pattern, style & export options
                    </Text>
                  </View>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close customize QR modal"
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  onPress={onClose}
                  className="h-8 w-8 items-center justify-center rounded-full bg-slate-100 active:opacity-75 dark:bg-slate-800"
                >
                  <X size={16} color={isDark ? '#cbd5e1' : '#64748b'} strokeWidth={2.2} />
                </Pressable>
              </View>

              <ScrollView
                style={styles.scrollArea}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="always"
                keyboardDismissMode="on-drag"
                nestedScrollEnabled={true}
                contentContainerStyle={{
                  paddingHorizontal: 20,
                  paddingTop: 16,
                  paddingBottom: 24,
                }}
              >
            {/* Live QR Preview Pedestal */}
            <View className="items-center justify-center rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <View
                style={{
                  backgroundColor: activePreset.backgroundColor,
                  borderColor:
                    customization.frameStyle === 'none'
                      ? 'transparent'
                      : 'rgba(148,163,184,0.28)',
                  borderRadius:
                    customization.frameStyle === 'simple'
                      ? 8
                      : customization.frameStyle === 'none'
                        ? 0
                        : 16,
                }}
                className="items-center justify-center border px-4 pb-3.5 pt-4 shadow-sm"
              >
                {shareUrl ? (
                  <QRCodeView
                    value={shareUrl}
                    size={previewSize}
                    foregroundColor={activePreset.foregroundColor}
                    backgroundColor={activePreset.backgroundColor}
                    accentColor={activePreset.accentColor}
                    framed={false}
                    showCenterLogo
                    centerLogoUrl={centerLogoUrl}
                    centerLogoBackground={centerLogoBackground}
                    centerLogoBorderColor={centerLogoBorderColor}
                    patternStyle={customization.patternStyle}
                    cornerStyle={customization.cornerStyle}
                    logoSize={customization.logoSize}
                  />
                ) : (
                  <View
                    style={{ width: previewSize, height: previewSize }}
                    className="items-center justify-center"
                  >
                    <Text
                      variant="none"
                      style={{ color: activePreset.foregroundColor }}
                      className="text-center text-xs"
                    >
                      QR Preview
                    </Text>
                  </View>
                )}

                {customization.captionVisible && caption.trim() ? (
                  <View
                    style={
                      customization.frameStyle === 'badge'
                        ? {
                            borderColor: activePreset.accentColor,
                            backgroundColor: `${activePreset.accentColor}22`,
                          }
                        : undefined
                    }
                    className={
                      customization.frameStyle === 'badge'
                        ? 'mt-2.5 rounded-full border px-3 py-1'
                        : 'mt-2.5'
                    }
                  >
                    <Text
                      variant="none"
                      style={{ color: activePreset.foregroundColor }}
                      className="text-center text-[12px] font-medium"
                    >
                      {caption}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Segmented Controls */}
            <SegmentedRow
              label="QR pattern"
              value={customization.patternStyle}
              options={PATTERN_OPTIONS}
              onSelect={(patternStyle) => onChange({ patternStyle })}
            />

            <SegmentedRow
              label="Corner style"
              value={customization.cornerStyle}
              options={CORNER_OPTIONS}
              onSelect={(cornerStyle) => onChange({ cornerStyle })}
            />

            <SegmentedRow
              label="Logo size"
              value={customization.logoSize}
              options={LOGO_SIZE_OPTIONS}
              onSelect={(logoSize) => onChange({ logoSize })}
            />

            <SegmentedRow
              label="Frame style"
              value={customization.frameStyle}
              options={FRAME_OPTIONS}
              onSelect={(frameStyle) => onChange({ frameStyle })}
            />

            <SegmentedRow
              label="Caption"
              value={customization.captionVisible ? 'show' : 'hide'}
              options={CAPTION_OPTIONS}
              onSelect={(value) => onChange({ captionVisible: value === 'show' })}
            />

            {/* Custom Caption Input Field */}
            {customization.captionVisible ? (
              <View className="mt-4">
                <View className="mb-1.5 flex-row items-center justify-between">
                  <Text
                    variant="none"
                    className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                  >
                    Custom caption
                  </Text>
                  <Text
                    variant="none"
                    className="text-[11px] text-slate-400 dark:text-slate-500"
                  >
                    {caption.length}/48
                  </Text>
                </View>
                <View
                  className="h-11 flex-row items-center rounded-xl border px-3.5"
                  style={{
                    borderColor: isDark ? 'rgba(51, 65, 85, 0.8)' : '#e2e8f0',
                    backgroundColor: isDark
                      ? 'rgba(30, 41, 59, 0.4)'
                      : 'rgba(248, 250, 252, 0.7)',
                  }}
                >
                  <TextInput
                    value={caption}
                    maxLength={48}
                    onChangeText={(caption) => onChange({ caption })}
                    placeholder="Scan to share card"
                    placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                    className="flex-1 text-[14px] text-textPrimary dark:text-dark-textPrimary"
                  />
                  {caption ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Clear caption"
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      onPress={() => onChange({ caption: '' })}
                      className="ml-2 h-5 w-5 items-center justify-center rounded-full bg-slate-200 active:opacity-75 dark:bg-slate-700"
                    >
                      <X
                        size={12}
                        color={isDark ? '#94a3b8' : '#64748b'}
                        strokeWidth={2.5}
                      />
                    </Pressable>
                  ) : null}
                </View>
              </View>
            ) : null}

            <SegmentedRow
              label="Export format"
              value={customization.exportFormat}
              options={EXPORT_OPTIONS}
              onSelect={(exportFormat) => onChange({ exportFormat })}
            />
          </ScrollView>

          {/* 3. Pinned Action Footer (Always visible, perfectly positioned) */}
          <View
            className="border-t border-slate-100 bg-white px-5 pt-3.5 dark:border-slate-800/80 dark:bg-dark-card"
            style={{ paddingBottom: Math.max(insets.bottom, 14) }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Done customizing QR code"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={onClose}
              className="min-h-[48px] w-full items-center justify-center rounded-xl bg-primary active:opacity-90"
            >
              <Text variant="none" className="text-[15px] font-semibold text-white">
                Done
              </Text>
            </Pressable>
          </View>
        </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdropOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  backdropPressable: {
    zIndex: 0,
  },
  sheetAnchor: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 1,
  },
  scrollArea: {
    flex: 1,
    minHeight: 0,
  },
});
