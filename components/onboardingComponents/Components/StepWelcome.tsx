import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Sparkles, ChevronRight, CreditCard, QrCode, Users } from 'lucide-react-native';
import { BrandLogo } from '@/components/uiComponents/BrandLogo';
import { Button } from '@/components/uiComponents/Button';
import { OnboardingDots } from './OnboardingDots';
import { ONBOARDING_SLIDES } from '../Services/onboardingService';

export interface StepWelcomeProps {
  onGetStarted: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function StepWelcome({ onGetStarted }: StepWelcomeProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const slideScrollRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / Math.max(1, SCREEN_WIDTH - 48));
    if (index !== activeSlide && index >= 0 && index < ONBOARDING_SLIDES.length) {
      setActiveSlide(index);
      Haptics.selectionAsync().catch(() => {});
    }
  };

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onGetStarted();
  };

  return (
    <ScrollView
      className="flex-1 bg-background dark:bg-dark-background"
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Brand Header */}
      <View className="items-center mb-6 pt-2">
        <BrandLogo size="header" variant="wordmark" />
        <View className="flex-row items-center mt-3 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50">
          <Sparkles size={14} className="text-primary dark:text-dark-primary mr-1.5" />
          <Text className="text-xs font-semibold text-primary dark:text-dark-primary">
            Next-Gen Digital Networking
          </Text>
        </View>
        <Text className="text-2xl font-black text-center text-textPrimary dark:text-dark-textPrimary mt-3">
          Your Professional Identity,{'\n'}Reimagined.
        </Text>
        <Text className="text-sm text-center text-textMuted dark:text-dark-textMuted mt-2 px-4 leading-5">
          Build interactive 3D digital business cards, share via QR code, and connect seamlessly with new contacts.
        </Text>
      </View>

      {/* Interactive Value Proposition Slider */}
      <View className="mb-6">
        <ScrollView
          ref={slideScrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          className="rounded-3xl"
        >
          {ONBOARDING_SLIDES.map((slide) => {
            const Icon = slide.icon;
            return (
              <View
                key={slide.id}
                style={{ width: SCREEN_WIDTH - 48 }}
                className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 items-center justify-center min-h-[190px]"
              >
                <View className="w-16 h-16 rounded-2xl bg-primary/10 dark:bg-dark-primary/20 items-center justify-center mb-4 border border-primary/20 dark:border-dark-primary/30">
                  <Icon size={32} className="text-primary dark:text-dark-primary" strokeWidth={2.2} />
                </View>
                <Text className="text-lg font-bold text-center text-textPrimary dark:text-dark-textPrimary mb-1.5">
                  {slide.title}
                </Text>
                <Text className="text-xs text-center text-textMuted dark:text-dark-textMuted leading-5 px-3">
                  {slide.description}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Carousel pagination indicator */}
        <View className="mt-4">
          <OnboardingDots count={ONBOARDING_SLIDES.length} activeIndex={activeSlide} />
        </View>
      </View>

      {/* Feature Highlights Grid / List */}
      <View className="mb-8 space-y-3">
        <View className="flex-row items-center p-3.5 rounded-2xl bg-card dark:bg-dark-card border border-slate-200/60 dark:border-slate-800/80 mb-2.5">
          <View className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 items-center justify-center mr-3.5">
            <CreditCard size={20} className="text-primary dark:text-dark-primary" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-textPrimary dark:text-dark-textPrimary">
              3D Live Card Customization
            </Text>
            <Text className="text-xs text-textMuted dark:text-dark-textMuted mt-0.5">
              Choose gradient themes and flip between front and back in real time.
            </Text>
          </View>
        </View>

        <View className="flex-row items-center p-3.5 rounded-2xl bg-card dark:bg-dark-card border border-slate-200/60 dark:border-slate-800/80 mb-2.5">
          <View className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 items-center justify-center mr-3.5">
            <QrCode size={20} className="text-brandCyan dark:text-brandCyanLight" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-textPrimary dark:text-dark-textPrimary">
              Instant Contact Exchange
            </Text>
            <Text className="text-xs text-textMuted dark:text-dark-textMuted mt-0.5">
              Recipients scan your QR code to instantly download your vCard.
            </Text>
          </View>
        </View>

        <View className="flex-row items-center p-3.5 rounded-2xl bg-card dark:bg-dark-card border border-slate-200/60 dark:border-slate-800/80">
          <View className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 items-center justify-center mr-3.5">
            <Users size={20} className="text-purple-600 dark:text-purple-400" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-textPrimary dark:text-dark-textPrimary">
              Unified Social Presence
            </Text>
            <Text className="text-xs text-textMuted dark:text-dark-textMuted mt-0.5">
              Connect LinkedIn, GitHub, X, and your personal portfolio website.
            </Text>
          </View>
        </View>
      </View>

      {/* Get Started Action */}
      <View className="mt-2">
        <Button
          label="Get Started"
          variant="primary"
          size="lg"
          icon={ChevronRight}
          iconPosition="right"
          onPress={handleGetStarted}
          className="w-full rounded-2xl shadow-md"
        />
        <Text className="text-[11px] text-center text-textMuted dark:text-dark-textMuted mt-3">
          Takes under 2 minutes to complete your digital setup.
        </Text>
      </View>
    </ScrollView>
  );
}
