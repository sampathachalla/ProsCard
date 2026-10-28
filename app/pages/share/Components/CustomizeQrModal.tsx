import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Check, Palette, X } from 'lucide-react-native';

import { QRCodeView } from '@/common/ui/QRCodeView';
import { Text } from '@/common/ui/Text';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';
import { QR_CUSTOMIZATION_PRESETS } from '../Config/shareActionsConfig';
import type { QrCustomizationPreset } from '../types/share.types';

export interface CustomizeQrModalProps {
  visible: boolean;
  shareUrl: string;
  activePreset: QrCustomizationPreset;
  centerLogoUrl?: string;
  onSelectPreset: (presetId: string) => void;
  onClose: () => void;
}

export function CustomizeQrModal({
  visible,
  shareUrl,
  activePreset,
  centerLogoUrl,
  onSelectPreset,
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
        <View className="w-full max-w-[400px] rounded-2xl border border-slate-200/80 bg-background p-5 dark:border-slate-800 dark:bg-dark-card">
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

          {/* Live Dot-Matrix VC QR Preview */}
          <View className="my-5 items-center">
            <View
              style={{
                backgroundColor: activePreset.backgroundColor,
                borderColor: 'rgba(148,163,184,0.28)',
              }}
              className="items-center justify-center rounded-xl border px-5 pb-4 pt-5"
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
              <Text
                variant="none"
                style={{ color: activePreset.foregroundColor }}
                className="mt-3 text-center text-[13px] font-medium"
              >
                Scan to share card
              </Text>
            </View>
          </View>

          {/* Theme Presets */}
          <Text
            variant="none"
            className="mb-2.5 text-[14px] font-normal text-slate-500 dark:text-slate-400"
          >
            QR color theme
          </Text>
          <View className="gap-2">
            {QR_CUSTOMIZATION_PRESETS.map((preset) => {
              const isSelected = preset.id === activePreset.id;
              return (
                <Pressable
                  key={preset.id}
                  accessibilityRole="button"
                  accessibilityLabel={preset.label}
                  onPress={() => onSelectPreset(preset.id)}
                  className={`min-h-[50px] flex-row items-center justify-between rounded-lg border px-3.5 py-2.5 ${
                    isSelected
                      ? 'border-primary/50 bg-primary/10 dark:border-sky-400/50 dark:bg-sky-500/15'
                      : 'border-transparent bg-slate-100 dark:bg-slate-800/80'
                  }`}
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      style={{
                        backgroundColor: preset.backgroundColor,
                        borderColor: preset.accentColor,
                      }}
                      className="h-7 w-7 items-center justify-center rounded-md border"
                    >
                      <View
                        style={{ backgroundColor: preset.foregroundColor }}
                        className="h-3 w-3 rounded-full"
                      />
                    </View>
                    <Text
                      variant="none"
                      className={`text-[15px] ${
                        isSelected
                          ? 'font-semibold text-primary dark:text-sky-400'
                          : 'font-normal text-textPrimary dark:text-dark-textPrimary'
                      }`}
                    >
                      {preset.label}
                    </Text>
                  </View>

                  {isSelected ? (
                    <Check size={18} color={tint} strokeWidth={2.5} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>

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
        </View>
      </View>
    </Modal>
  );
}
