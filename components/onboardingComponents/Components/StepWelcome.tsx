import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChevronRight, CreditCard, QrCode, ShieldCheck } from 'lucide-react-native';
import { BrandLogo } from '@/components/uiComponents/BrandLogo';
import { Button } from '@/components/uiComponents/Button';

export interface StepWelcomeProps {
  onGetStarted: () => void;
}

const HIGHLIGHTS = [
  {
    icon: CreditCard,
    title: 'Professional digital card',
    description: 'Create a shareable card with your name, role, and contact details.',
  },
  {
    icon: QrCode,
    title: 'Instant exchange',
    description: 'Share via QR so recipients can save your details in one scan.',
  },
  {
    icon: ShieldCheck,
    title: 'Edit anytime',
    description: 'Finish quickly now. Photos, links, and bio can be added later.',
  },
] as const;

export function StepWelcome({ onGetStarted }: StepWelcomeProps) {
  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onGetStarted();
  };

  return (
    <ScrollView
      className="flex-1 bg-background dark:bg-dark-background"
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View className="mb-8 items-center pt-2">
        <BrandLogo size="header" variant="wordmark" />
        <Text className="mt-5 text-center text-2xl font-bold text-textPrimary dark:text-dark-textPrimary">
          Set up your ProsCard
        </Text>
        <Text className="mt-2 px-2 text-center text-sm leading-5 text-textMuted dark:text-dark-textMuted">
          A short guided setup. Required fields only — optional details stay out of the way.
        </Text>
      </View>

      <View className="mb-8">
        {HIGHLIGHTS.map((item, index) => {
          const Icon = item.icon;
          return (
            <View
              key={item.title}
              className={`flex-row items-start rounded-2xl border border-slate-200 bg-card p-4 dark:border-slate-800 dark:bg-dark-card ${
                index < HIGHLIGHTS.length - 1 ? 'mb-3' : ''
              }`}
            >
              <View className="mr-3.5 h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                <Icon size={20} className="text-primary dark:text-dark-primary" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-textPrimary dark:text-dark-textPrimary">
                  {item.title}
                </Text>
                <Text className="mt-0.5 text-xs leading-4 text-textMuted dark:text-dark-textMuted">
                  {item.description}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <Button
        label="Continue"
        variant="primary"
        size="lg"
        icon={ChevronRight}
        iconPosition="right"
        onPress={handleGetStarted}
        className="w-full rounded-2xl"
      />
      <Text className="mt-3 text-center text-[11px] text-textMuted dark:text-dark-textMuted">
        About 1 minute for the essentials.
      </Text>
    </ScrollView>
  );
}
