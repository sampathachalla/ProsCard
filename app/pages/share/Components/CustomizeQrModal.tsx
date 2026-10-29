import React from 'react';
import { Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Check, Palette, X } from 'lucide-react-native';

import { QRCodeView } from '@/common/ui/QRCodeView';
import { Text } from '@/common/ui/Text';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';
import type { QrCustomization, QrCustomizationPreset } from '../types/share.types';

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
      <View className="flex-1 items-center justify-center bg-slate-950/75 px-5">
        <View className="max-h-[90%] w-full max-w-[400px] rounded-2xl border border-slate-200/80 bg-background p-5 dark:border-slate-800 dark:bg-dark-card">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2.5">
              <View className="h-9 w-9 items-center justify-center rounded-lg bg-primary/10 dark:bg-sky-500/15">
                <Palette size={18} color={tint} strokeWidth={2.2} />
              </View>
              <Text
                variant="none"
                className="text-[18px] font-bold text-textPrimary dark:text-dark-textPrimary"
              >
                Customize QR code
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close customize QR modal"
              hitSlop={8}
              onPress={onClose}
              className="h-9 w-9 items-center justify-center rounded-lg bg-slate-100 active:opacity-75 dark:bg-slate-800"
            >
              <X size={18} color={isDark ? '#cbd5e1' : '#475569'} strokeWidth={2.2} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Live QR Preview */}
          <View className="my-5 items-center">
            <View
              style={{
                backgroundColor: activePreset.backgroundColor,
                borderColor: customization.frameStyle === 'none' ? 'transparent' : 'rgba(148,163,184,0.28)',
                borderRadius: customization.frameStyle === 'simple' ? 8 : customization.frameStyle === 'none' ? 0 : 16,
              }}
              className="items-center justify-center border px-5 pb-4 pt-5"
            >
              {shareUrl ? (
                <QRCodeView
                  value={shareUrl}
                  size={156}
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
                <View className="h-[156px] w-[156px] items-center justify-center">
                  <Text
                    variant="none"
                    style={{ color: activePreset.foregroundColor }}
                    className="text-center text-xs"
                  >
                    QR Preview
                  </Text>
                </View>
              )}
              {customization.captionVisible ? <View style={customization.frameStyle === 'badge' ? { borderColor: activePreset.accentColor, backgroundColor: `${activePreset.accentColor}22` } : undefined} className={customization.frameStyle === 'badge' ? 'mt-3 rounded-full border px-3 py-1.5' : 'mt-3'}><Text
                variant="none"
                style={{ color: activePreset.foregroundColor }}
                className="text-center text-[13px] font-medium"
              >
                {customization.caption}
              </Text>
              </View> : null}
            </View>
          </View>

          <OptionRow label="QR pattern" value={customization.patternStyle} options={['dots', 'rounded', 'square']} onSelect={(patternStyle) => onChange({ patternStyle: patternStyle as QrCustomization['patternStyle'] })} />
          <OptionRow label="Corner style" value={customization.cornerStyle} options={['rounded', 'square', 'circle']} onSelect={(cornerStyle) => onChange({ cornerStyle: cornerStyle as QrCustomization['cornerStyle'] })} />
          <OptionRow label="Logo size" value={customization.logoSize} options={['small', 'medium', 'large']} onSelect={(logoSize) => onChange({ logoSize: logoSize as QrCustomization['logoSize'] })} />
          <OptionRow label="Frame" value={customization.frameStyle} options={['none', 'simple', 'rounded', 'badge']} onSelect={(frameStyle) => onChange({ frameStyle: frameStyle as QrCustomization['frameStyle'] })} />
          <OptionRow label="Caption" value={customization.captionVisible ? 'show' : 'hide'} options={['show', 'hide']} onSelect={(value) => onChange({ captionVisible: value === 'show' })} />
          {customization.captionVisible ? <View className="mt-4">
            <Text variant="none" className="mb-2 text-[14px] text-slate-500 dark:text-slate-400">Custom caption</Text>
            <TextInput value={customization.caption} maxLength={48} onChangeText={(caption) => onChange({ caption })}
              placeholder="Scan to share card" placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
              className="min-h-[48px] rounded-xl border border-slate-200 px-3.5 text-[15px] text-textPrimary dark:border-slate-700 dark:text-dark-textPrimary" />
          </View> : null}
          <OptionRow label="Export format" value={customization.exportFormat} options={['png', 'svg', 'pdf']} onSelect={(exportFormat) => onChange({ exportFormat: exportFormat as QrCustomization['exportFormat'] })} />

          {/* Done Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Done customizing QR code"
            onPress={onClose}
            className="mt-5 min-h-[50px] items-center justify-center rounded-xl bg-primary px-4 py-3 active:opacity-90 dark:bg-[#2563eb]"
          >
            <Text variant="none" className="text-[15px] font-semibold text-white">
              Done
            </Text>
          </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function OptionRow({ label, value, options, onSelect }: { label: string; value: string; options: string[]; onSelect: (value: string) => void }) {
  const { theme } = useThemeContext();
  const tint = theme === 'dark' ? Colors.dark.tint : Colors.light.tint;
  return <View className="mt-4">
    <Text variant="none" className="mb-2 text-[14px] text-slate-500 dark:text-slate-400">{label}</Text>
    <View className="flex-row flex-wrap gap-2">
      {options.map((option) => {
        const selected = value === option;
        return <Pressable key={option} onPress={() => onSelect(option)} accessibilityRole="button" accessibilityState={{ selected }}
          className={`min-h-[40px] flex-row items-center gap-1.5 rounded-lg border px-3 py-2 ${selected ? 'border-primary/50 bg-primary/10 dark:border-sky-400/50 dark:bg-sky-500/15' : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800'}`}>
          <Text variant="none" className={`capitalize ${selected ? 'font-semibold text-primary dark:text-sky-400' : 'text-textPrimary dark:text-dark-textPrimary'}`}>{option}</Text>
          {selected ? <Check size={14} color={tint} /> : null}
        </Pressable>;
      })}
    </View>
  </View>;
}
