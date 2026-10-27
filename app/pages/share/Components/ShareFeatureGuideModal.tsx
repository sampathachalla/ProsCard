import React from 'react';
import { Modal, Platform, Pressable, ScrollView, Share, View } from 'react-native';
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
  onPrepareHomeScreenWidget: () => void | Promise<void>;
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
    title: 'Add VC Pros to your Home Screen',
    subtitle: 'Keep your digital business-card QR ready for instant sharing.',
    icon: LayoutGrid,
    steps: [
      'Touch and hold an empty area of your Home Screen until the apps begin to move.',
      'Open the widget gallery and search for “VC Pros QR Card”.',
      'Choose a widget size, tap Add Widget, and place it anywhere you like.',
    ],
    primaryLabel: 'Prepare My QR Widget',
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
  onPrepareHomeScreenWidget,
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
      void onPrepareHomeScreenWidget();
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

  if (kind === 'homescreen') {
    const platformSteps = Platform.OS === 'android'
      ? [
          ['1', 'Touch and hold your Home Screen', 'Choose Widgets from the Home Screen menu.'],
          ['2', 'Find VC Pros QR Card', 'Search for VC Pros, then choose the QR card widget.'],
          ['3', 'Add and position it', 'Drag the widget to a convenient place for instant sharing.'],
        ]
      : [
          ['1', 'Touch and hold your Home Screen', 'When the apps begin to move, tap Edit in the top-left corner.'],
          ['2', 'Open Add Widget', 'Tap Add Widget and search for “VC Pros QR Card”.'],
          ['3', 'Choose a size and place it', 'Tap Add Widget, then drag your QR card wherever you want it.'],
        ];

    return (
      <Modal transparent visible animationType="slide" onRequestClose={onClose}>
        <View className="flex-1 justify-end bg-slate-950/75">
          <View className="h-[90%] overflow-hidden rounded-t-[28px] bg-background dark:bg-dark-card">
            <View className="flex-row items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
              <View className="flex-1 pr-3">
                <Text variant="none" className="text-xl font-bold text-textPrimary dark:text-white">
                  Add VC Pros widget
                </Text>
                <Text variant="none" className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Your card QR, always one tap away
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close widget instructions"
                hitSlop={8}
                onPress={onClose}
                className="size-11 items-center justify-center rounded-full bg-slate-100 active:opacity-75 dark:bg-slate-800"
              >
                <X size={22} color={isDark ? '#e2e8f0' : '#0f172a'} strokeWidth={2.2} />
              </Pressable>
            </View>

            <ScrollView
              className="flex-1 px-6"
              contentContainerStyle={{ paddingBottom: 28, paddingTop: 22 }}
              showsVerticalScrollIndicator
            >
              <View className="mb-6 rounded-2xl bg-slate-950 p-5">
                <View className="flex-row items-center gap-4">
                  <View className="size-16 items-center justify-center rounded-xl bg-white">
                    <LayoutGrid size={34} color="#0284c7" strokeWidth={2.2} />
                  </View>
                  <View className="flex-1">
                    <Text variant="none" className="text-lg font-bold text-white">VC Pros QR Card</Text>
                    <Text variant="none" className="mt-1 text-sm leading-5 text-slate-300">
                      Shows the active card’s QR code and opens its public page when tapped.
                    </Text>
                  </View>
                </View>
              </View>

              <Text variant="none" className="mb-4 text-2xl font-bold text-textPrimary dark:text-white">
                {Platform.OS === 'android' ? 'Android setup' : 'iPhone setup'}
              </Text>

              {platformSteps.map(([number, title, description]) => (
                <View key={number} className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
                  <View className="flex-row items-start gap-4">
                    <View className="size-9 items-center justify-center rounded-full bg-primary">
                      <Text variant="none" className="text-sm font-bold text-white">{number}</Text>
                    </View>
                    <View className="flex-1">
                      <Text variant="none" className="text-base font-bold text-textPrimary dark:text-white">{title}</Text>
                      <Text variant="none" className="mt-1.5 text-sm leading-5 text-slate-600 dark:text-slate-300">{description}</Text>
                    </View>
                  </View>
                </View>
              ))}

              <View className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/30">
                <Text variant="none" className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                  The widget requires the native VC Pros TestFlight/App Store build. It is not available inside Expo Go.
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Prepare VC Pros QR widget"
                onPress={handlePrimaryAction}
                className="mt-5 min-h-[52px] items-center justify-center rounded-xl bg-primary px-4 active:opacity-90"
              >
                <Text variant="none" className="text-base font-semibold text-white">Prepare My QR Widget</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }

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
