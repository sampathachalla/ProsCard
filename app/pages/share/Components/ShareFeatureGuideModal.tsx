import React from 'react';
import { Modal, Platform, Pressable, Share, View } from 'react-native';
import {
  LayoutGrid,
  Lock,
  Smartphone,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react-native';

import { Text } from '@/common/ui/Text';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';
import type { ShareGuideModalKind } from '../types/share.types';

export interface ShareFeatureGuideModalProps {
  kind: ShareGuideModalKind;
  cardName: string;
  shareUrl: string;
  onClose: () => void;
  onExportWalletPass: () => void;
  onOpenHomeScreenPage: () => void;
  onSaveQrImage: (dialogTitle?: string) => void;
}

interface GuideCopy {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  steps: string[];
  primaryLabel: string;
}

const GUIDE_CONTENT: Record<Exclude<ShareGuideModalKind, null>, GuideCopy> = {
  wallet: {
    title: 'Add card to wallet',
    subtitle: 'Save your VC Pros contact pass for instant offline access.',
    icon: Wallet,
    steps: [
      'Tap "Add to Wallet" below to generate your signed VC Pros pass.',
      'Review the pass in the Apple Wallet or Google Wallet system screen.',
      'Approve the system prompt to save the pass to your wallet.',
    ],
    primaryLabel: 'Add to Wallet',
  },
  lockscreen: {
    title: 'Add QR to lockscreen',
    subtitle: 'Let anyone scan your VC Pros card right from your lock screen.',
    icon: Lock,
    steps: [
      'Tap "Save QR for Lockscreen" below to save your high-contrast QR image.',
      'Open Settings → Wallpaper → Add New Wallpaper on your phone.',
      'Select your saved QR image or add a Lock Screen photo widget.',
    ],
    primaryLabel: 'Save QR for Lockscreen',
  },
  homescreen: {
    title: 'Add QR to homescreen',
    subtitle: 'Pin your digital business card QR to your home screen for 1-tap access.',
    icon: LayoutGrid,
    steps: [
      'Tap "Open Card in Browser" below to open your public card page.',
      'On iOS: Tap Share in Safari, then choose "Add to Home Screen".',
      'On Android: Open the browser menu, then choose "Add to Home screen".',
    ],
    primaryLabel: 'Open Card in Browser',
  },
  namedrop: {
    title: 'Share with NameDrop',
    subtitle: 'Hold the top of your iPhone near another iPhone or Apple Watch.',
    icon: Smartphone,
    steps: [
      'Bring the top edge of your phone within a few centimeters of their device.',
      'Wait for the contact glow to appear on both screens.',
      'Or tap "Open AirDrop / Share Sheet" below to beam your card link right now.',
    ],
    primaryLabel: 'Open AirDrop / Share Sheet',
  },
};

export function ShareFeatureGuideModal({
  kind,
  cardName,
  shareUrl,
  onClose,
  onExportWalletPass,
  onOpenHomeScreenPage,
  onSaveQrImage,
}: ShareFeatureGuideModalProps) {
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';
  const tint = isDark ? Colors.dark.tint : Colors.light.tint;

  if (!kind) return null;
  const content = GUIDE_CONTENT[kind];
  const Icon = content.icon;

  const handlePrimaryAction = () => {
    onClose();
    if (kind === 'wallet') {
      onExportWalletPass();
      return;
    }
    if (kind === 'lockscreen') {
      onSaveQrImage('Save QR for Lockscreen');
      return;
    }
    if (kind === 'homescreen') {
      onOpenHomeScreenPage();
      return;
    }
    if (kind === 'namedrop' && shareUrl) {
      void Share.share({
        message: `${cardName || 'My card'} | VC Pros:\n${shareUrl}`,
        url: Platform.OS === 'ios' ? shareUrl : undefined,
        title: `${cardName || 'VC Pros'} | NameDrop`,
      });
    }
  };

  return (
    <Modal
      transparent
      visible={Boolean(kind)}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-slate-950/75 px-5">
        <View className="w-full max-w-[400px] rounded-2xl border border-slate-200/80 bg-background p-5 dark:border-slate-800 dark:bg-dark-card">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2.5">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10 dark:bg-sky-500/15">
                <Icon size={20} color={tint} strokeWidth={2.2} />
              </View>
              <Text
                variant="none"
                className="text-[18px] font-bold text-textPrimary dark:text-dark-textPrimary"
              >
                {content.title}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close modal"
              hitSlop={8}
              onPress={onClose}
              className="h-9 w-9 items-center justify-center rounded-lg bg-slate-100 active:opacity-75 dark:bg-slate-800"
            >
              <X size={18} color={isDark ? '#cbd5e1' : '#475569'} strokeWidth={2.2} />
            </Pressable>
          </View>

          <Text
            variant="none"
            className="mt-2.5 text-[14px] leading-5 text-slate-500 dark:text-slate-400"
          >
            {content.subtitle}
          </Text>

          {/* Step-by-step instructions */}
          <View className="mt-4 gap-2.5 rounded-xl bg-slate-100 p-3.5 dark:bg-slate-800/70">
            {content.steps.map((step, idx) => (
              <View key={idx} className="flex-row items-start gap-2.5">
                <View className="mt-0.5 h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 dark:bg-sky-500/20">
                  <Text
                    variant="none"
                    style={{ color: tint }}
                    className="text-[11px] font-bold"
                  >
                    {idx + 1}
                  </Text>
                </View>
                <Text
                  variant="none"
                  className="flex-1 text-[13px] leading-5 text-textPrimary dark:text-dark-textPrimary"
                >
                  {step}
                </Text>
              </View>
            ))}
          </View>

          {/* Primary Action Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={content.primaryLabel}
            onPress={handlePrimaryAction}
            className="mt-5 min-h-[50px] items-center justify-center rounded-xl bg-primary px-4 py-3 active:opacity-90 dark:bg-[#2563eb]"
          >
            <Text variant="none" className="text-[15px] font-semibold text-white">
              {content.primaryLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
