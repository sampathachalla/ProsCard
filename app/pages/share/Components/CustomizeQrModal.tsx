import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
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
  return (
    <View className="mt-4">
      <Text
        variant="none"
        className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
      >
        {label}
      </Text>
      <View className="flex-row rounded-xl border border-slate-200/60 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-800/80">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onSelect(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              className={`min-h-[34px] flex-1 flex-row items-center justify-center rounded-lg px-2 py-1.5 ${
                selected
                  ? 'bg-white shadow-sm dark:bg-slate-700/90'
                  : 'active:opacity-75'
              }`}
            >
              <Text
                variant="none"
                numberOfLines={1}
                className={`text-[13px] ${
                  selected
                    ? 'font-semibold text-primary dark:text-white'
                    : 'font-medium text-slate-600 dark:text-slate-400'
                }`}
              >
                {option.label}
              </Text>
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
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';
  const tint = isDark ? Colors.dark.tint : Colors.light.tint;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 items-center justify-center bg-black/60 px-4 py-6"
      >
        <View className="max-h-[90%] w-full max-w-[420px] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-card shadow-2xl dark:border-slate-800 dark:bg-dark-card">
          {/* 1. Header (Sticky) */}
          <View className="flex-row items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800/80">
            <View className="flex-row items-center gap-2.5">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary/10 dark:bg-sky-500/15">
                <Palette size={18} color={tint} strokeWidth={2.2} />
              </View>
              <View>
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
              hitSlop={8}
              onPress={onClose}
              className="h-8 w-8 items-center justify-center rounded-full bg-slate-100 active:opacity-75 dark:bg-slate-800"
            >
              <X size={16} color={isDark ? '#cbd5e1' : '#64748b'} strokeWidth={2.2} />
            </Pressable>
          </View>

          {/* 2. Scrollable Options Body */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 20,
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
                    size={148}
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
                  <View className="h-[148px] w-[148px] items-center justify-center">
                    <Text
                      variant="none"
                      style={{ color: activePreset.foregroundColor }}
                      className="text-center text-xs"
                    >
                      QR Preview
                    </Text>
                  </View>
                )}

                {customization.captionVisible && customization.caption.trim() ? (
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
                      {customization.caption}
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
                    {customization.caption.length}/48
                  </Text>
                </View>
                <View className="h-11 flex-row items-center rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 focus-within:border-primary focus-within:bg-white dark:border-slate-700 dark:bg-slate-800/40 dark:focus-within:border-sky-400 dark:focus-within:bg-slate-800">
                  <TextInput
                    value={customization.caption}
                    maxLength={48}
                    onChangeText={(caption) => onChange({ caption })}
                    placeholder="Scan to share card"
                    placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                    className="flex-1 text-[14px] text-textPrimary dark:text-dark-textPrimary"
                  />
                  {customization.caption ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Clear caption"
                      hitSlop={8}
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
          <View className="border-t border-slate-100 bg-card px-5 py-3.5 dark:border-slate-800/80 dark:bg-dark-card">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Done customizing QR code"
              onPress={onClose}
              className="h-12 w-full items-center justify-center rounded-xl bg-primary shadow-sm active:opacity-90 dark:bg-dark-primary"
            >
              <Text
                variant="none"
                className="text-[15px] font-semibold text-white dark:text-slate-950"
              >
                Done
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
