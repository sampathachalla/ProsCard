import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  Sparkles,
  RotateCcw,
  Check,
  Mail,
  Phone,
  MapPin,
  Globe,
  GitFork,
  Link2,
  AtSign,
  Briefcase,
  Layers,
  type LucideIcon,
} from 'lucide-react-native';

import mindProsLogoDark from '@/assets/mindpros-logo-dark.png';
import { FlippableCard } from '@/components/gestures/FlippableCard';
import {
  StandardWalletCard,
  StandardWalletCardBack,
} from '@/components/uiComponents/StandardWalletCard';
import { Button } from '@/components/uiComponents/Button';

import type {
  CardGradientPreset,
  OnboardingDraft,
} from '../types/onboardingStepper.types';
import {
  CARD_GRADIENT_PRESETS,
  DEFAULT_CARD_CATEGORIES,
} from '../types/onboardingStepper.types';

export const CARD_ASPECT_RATIO = 1.586;

export const PRESET_CATEGORY_MAP: Record<string, string> = {
  'pro-cyan': 'Professional',
  midnight: 'Personal',
  slate: 'Professional',
  teal: 'Networking',
  indigo: 'Business',
  copper: 'Personal',
};

export interface StepCardCustomizationProps {
  draft: OnboardingDraft;
  updateDraft: (fields: Partial<OnboardingDraft>) => void;
  onFinish: () => void;
  isSaving: boolean;
}

export function StepCardCustomization({
  draft,
  updateDraft,
  onFinish,
  isSaving,
}: StepCardCustomizationProps) {
  const { width: windowWidth } = useWindowDimensions();

  // Responsive card dimensions clamped for optimal readability and mobile display
  const cardWidth = Math.min(Math.max((windowWidth || 360) - 48, 280), 340);
  const cardHeight = Math.round(cardWidth / CARD_ASPECT_RATIO);

  // Safe fallback values matching design defaults
  const displayName =
    draft.preferredName?.trim() ||
    [draft.firstName, draft.lastName].map((p) => p?.trim()).filter(Boolean).join(' ') ||
    draft.fullName?.trim() ||
    'Your Name';
  const safeName = displayName;
  const safeTitle = draft.title?.trim() || 'Professional Role';
  const safeCompany = draft.organization?.trim() || 'Company / Organization';
  const safeCategory = draft.cardCategory || 'Professional';
  const safeGradient: [string, string] =
    Array.isArray(draft.cardGradient) && draft.cardGradient.length === 2
      ? draft.cardGradient
      : ['#2563eb', '#00a8e8'];

  const qrUrl = `https://proscard.mindpros.com/p/${encodeURIComponent(
    draft.firstName?.trim() || draft.fullName?.trim() || 'user'
  )}`;

  // Handle Preset Gradient Selection
  const handleSelectPreset = (preset: CardGradientPreset) => {
    Haptics.selectionAsync().catch(() => {});
    const mappedCategory =
      PRESET_CATEGORY_MAP[preset.id] || draft.cardCategory || 'Professional';
    updateDraft({
      cardGradient: preset.gradient,
      cardCategory: mappedCategory,
    });
  };

  // Handle Category Selection
  const handleSelectCategory = (category: string) => {
    Haptics.selectionAsync().catch(() => {});
    updateDraft({
      cardCategory: category,
    });
  };

  // Handle Finish CTA
  const handleFinish = () => {
    if (isSaving) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onFinish();
  };

  // Verified draft summary chips
  const summaryChips = useMemo(() => {
    const chips: { icon: LucideIcon; label: string; key: string }[] = [];

    if (draft.email?.trim()) {
      chips.push({ icon: Mail, label: draft.email.trim(), key: 'email' });
    }
    if (draft.phone?.trim()) {
      chips.push({ icon: Phone, label: draft.phone.trim(), key: 'phone' });
    }
    if (draft.businessAddress?.trim()) {
      chips.push({ icon: MapPin, label: draft.businessAddress.trim(), key: 'address' });
    }
    if (draft.linkedin?.trim()) {
      chips.push({ icon: Link2, label: `in/${draft.linkedin.trim()}`, key: 'linkedin' });
    }
    if (draft.github?.trim()) {
      chips.push({ icon: GitFork, label: `gh/${draft.github.trim()}`, key: 'github' });
    }
    if (draft.x?.trim()) {
      const handle = draft.x.trim();
      chips.push({
        icon: AtSign,
        label: handle.startsWith('@') ? handle : `@${handle}`,
        key: 'x',
      });
    }
    if (draft.website?.trim()) {
      chips.push({
        icon: Globe,
        label: draft.website.trim().replace(/^https?:\/\//i, ''),
        key: 'website',
      });
    }
    if (draft.portfolio?.trim()) {
      chips.push({
        icon: Briefcase,
        label: draft.portfolio.trim().replace(/^https?:\/\//i, ''),
        key: 'portfolio',
      });
    }

    return chips;
  }, [
    draft.email,
    draft.phone,
    draft.businessAddress,
    draft.linkedin,
    draft.github,
    draft.x,
    draft.website,
    draft.portfolio,
  ]);

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 48,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Informational Banner */}
        <View className="mb-5 flex-row items-start rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
          <Sparkles
            size={20}
            className="mr-3 mt-0.5 shrink-0 text-primary dark:text-dark-primary"
          />
          <View className="flex-1">
            <Text className="text-sm font-bold text-textPrimary dark:text-dark-textPrimary">
              Card style
            </Text>
            <Text className="mt-0.5 text-xs leading-4 text-textMuted dark:text-dark-textMuted">
              Choose a category and theme. Tap the card to preview the reverse side.
            </Text>
          </View>
        </View>

        {/* 3D Interactive Flippable Card Preview */}
        <View className="my-2 items-center justify-center">
          <FlippableCard
            accessibilityLabel={`${safeCategory} digital business card for ${safeName}`}
            front={
              <StandardWalletCard
                category={safeCategory}
                company={safeCompany}
                gradient={safeGradient}
                logoSource={mindProsLogoDark}
                name={safeName}
                title={safeTitle}
                width={cardWidth}
              />
            }
            back={
              <StandardWalletCardBack
                category={safeCategory}
                gradient={safeGradient}
                qrValue={qrUrl}
                width={cardWidth}
              />
            }
            height={cardHeight}
            width={cardWidth}
            onDoubleTap={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            }}
          />

          {/* Hint banner */}
          <View className="mt-3 flex-row items-center justify-center rounded-full border border-slate-200/90 bg-slate-100/90 px-3.5 py-1.5 dark:border-slate-800 dark:bg-slate-800/80">
            <RotateCcw
              size={12}
              className="mr-1.5 text-primary dark:text-dark-primary"
            />
            <Text className="text-[11px] font-semibold text-textMuted dark:text-dark-textMuted">
              Tap card to flip • 3D Preview
            </Text>
          </View>
        </View>

        {/* Card Category Selector */}
        <View className="mb-5 mt-6">
          <View className="mb-2.5 flex-row items-center">
            <Layers size={14} className="mr-1.5 text-primary dark:text-dark-primary" />
            <Text className="text-xs font-bold uppercase tracking-wider text-textMuted dark:text-dark-textMuted">
              Card Category
            </Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {DEFAULT_CARD_CATEGORIES.map((cat) => {
              const isSelected =
                safeCategory.trim().toLowerCase() === cat.trim().toLowerCase();
              return (
                <Pressable
                  key={cat}
                  onPress={() => handleSelectCategory(cat)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${cat} category`}
                  accessibilityState={{ selected: isSelected }}
                  className={`rounded-xl border px-3.5 py-2 transition-all active:scale-95 ${
                    isSelected
                      ? 'border-primary bg-primary dark:border-dark-primary dark:bg-dark-primary'
                      : 'border-slate-200 bg-card dark:border-slate-800 dark:bg-dark-card'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      isSelected
                        ? 'text-white'
                        : 'text-textPrimary dark:text-dark-textPrimary'
                    }`}
                  >
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Theme Gradient Selector */}
        <View className="mb-6">
          <Text className="mb-1 text-xs font-bold uppercase tracking-wider text-textMuted dark:text-dark-textMuted">
            Theme Gradient
          </Text>
          <Text className="mb-3 text-xs text-textMuted dark:text-dark-textMuted">
            Choose from signature color schemes designed for light and dark contrast.
          </Text>

          <View className="flex-row flex-wrap justify-between">
            {CARD_GRADIENT_PRESETS.map((preset) => {
              const isSelected =
                safeGradient[0].toLowerCase() === preset.gradient[0].toLowerCase() &&
                safeGradient[1].toLowerCase() === preset.gradient[1].toLowerCase();

              return (
                <Pressable
                  key={preset.id}
                  onPress={() => handleSelectPreset(preset)}
                  accessibilityRole="button"
                  accessibilityLabel={`${preset.label} gradient preset`}
                  accessibilityState={{ selected: isSelected }}
                  className={`mb-3 w-[48%] rounded-2xl border p-2.5 active:scale-[0.98] ${
                    isSelected
                      ? 'border-primary bg-blue-50/50 shadow-sm dark:border-dark-primary dark:bg-blue-950/20'
                      : 'border-slate-200 bg-card dark:border-slate-800 dark:bg-dark-card'
                  }`}
                >
                  <LinearGradient
                    colors={preset.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="mb-2 h-14 w-full items-end justify-start rounded-xl p-1.5"
                  >
                    {isSelected && (
                      <View className="h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
                        <Check size={12} color="#0f172a" strokeWidth={3} />
                      </View>
                    )}
                  </LinearGradient>
                  <Text
                    numberOfLines={1}
                    className="text-xs font-bold text-textPrimary dark:text-dark-textPrimary"
                  >
                    {preset.label}
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="mt-0.5 text-[10px] text-textMuted dark:text-dark-textMuted"
                  >
                    {PRESET_CATEGORY_MAP[preset.id] || 'Custom'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Profile Summary Preview */}
        <View className="mb-6 rounded-2xl border border-slate-200/90 bg-card/70 p-4 dark:border-slate-800/90 dark:bg-dark-card/70">
          <View className="mb-2.5 flex-row items-center justify-between">
            <Text className="text-xs font-bold uppercase tracking-wider text-textMuted dark:text-dark-textMuted">
              Included Profile Info
            </Text>
            <Text className="text-[11px] font-medium text-textMuted dark:text-dark-textMuted">
              {summaryChips.length} {summaryChips.length === 1 ? 'detail' : 'details'} linked
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-2">
            {summaryChips.map((chip) => {
              const Icon = chip.icon;
              return (
                <View
                  key={chip.key}
                  className="flex-row items-center rounded-lg border border-slate-200/80 bg-slate-100/90 px-2.5 py-1.5 dark:border-slate-700/80 dark:bg-slate-800/80"
                >
                  <Icon
                    size={12}
                    color="#2563eb"
                    className="mr-1.5 text-primary dark:text-dark-primary"
                  />
                  <Text
                    numberOfLines={1}
                    className="max-w-[210px] text-[11px] font-medium text-textPrimary dark:text-dark-textPrimary"
                  >
                    {chip.label}
                  </Text>
                </View>
              );
            })}

            {summaryChips.length === 0 && (
              <Text className="py-1 text-xs italic text-textMuted dark:text-dark-textMuted">
                No optional contact details added. Your card still features your name, title, and organization.
              </Text>
            )}
          </View>
        </View>

        {/* Confirmation Finish CTA */}
        <View className="mb-4 mt-2">
          <Button
            label={isSaving ? 'Creating Card...' : 'Create My Card'}
            variant="primary"
            size="lg"
            icon={Check}
            iconPosition="right"
            loading={isSaving}
            disabled={isSaving}
            onPress={handleFinish}
            className="w-full rounded-2xl"
            accessibilityLabel="Create my card and finish onboarding"
          />
          <Text className="mt-2 text-center text-[11px] text-textMuted dark:text-dark-textMuted">
            You can customize your card, colors, and links anytime from your dashboard.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
