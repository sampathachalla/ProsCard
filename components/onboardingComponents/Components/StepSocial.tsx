import React from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Link2, GitFork, AtSign, Globe, Share2, MessageCircle, Play } from 'lucide-react-native';
import type { OnboardingDraft } from '../types/onboardingStepper.types';
import { OnboardingFormField } from './OnboardingFormField';

export interface StepSocialProps {
  draft: OnboardingDraft;
  updateDraft: (fields: Partial<OnboardingDraft>) => void;
  errors: Record<string, string>;
}

export function StepSocial({ draft, updateDraft, errors }: StepSocialProps) {
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background dark:bg-dark-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Informational Banner */}
        <View className="flex-row items-start p-4 mb-6 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
          <Share2 size={20} className="text-purple-600 dark:text-purple-400 mt-0.5 mr-3 shrink-0" />
          <View className="flex-1">
            <Text className="text-sm font-bold text-textPrimary dark:text-dark-textPrimary">
              Social & Web Presence
            </Text>
            <Text className="text-xs text-textMuted dark:text-dark-textMuted mt-0.5 leading-4">
              Add your online handles and website links. Recipients can tap them directly on your digital card.
            </Text>
          </View>
        </View>

        {/* LinkedIn */}
        <OnboardingFormField
          label="LinkedIn Profile"
          value={draft.linkedin}
          onChangeText={(text) => updateDraft({ linkedin: text })}
          placeholder="linkedin.com/in/username or username"
          error={errors.linkedin}
          icon={Link2}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          hint="Your LinkedIn username or profile URL."
        />

        {/* GitHub */}
        <OnboardingFormField
          label="GitHub Profile"
          value={draft.github}
          onChangeText={(text) => updateDraft({ github: text })}
          placeholder="github.com/username or @username"
          error={errors.github}
          icon={GitFork}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          hint="Developer profile or portfolio repository."
        />

        {/* Twitter / X */}
        <OnboardingFormField
          label="Twitter / X"
          value={draft.x}
          onChangeText={(text) => updateDraft({ x: text })}
          placeholder="@username or x.com/username"
          error={errors.x}
          icon={AtSign}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          hint="Your Twitter/X handle or URL."
        />

        <OnboardingFormField label="Facebook" value={draft.facebook} onChangeText={(text) => updateDraft({ facebook: text })} placeholder="facebook.com/username" error={errors.facebook} icon={AtSign} keyboardType="url" autoCapitalize="none" autoCorrect={false} />
        <OnboardingFormField label="Instagram" value={draft.instagram} onChangeText={(text) => updateDraft({ instagram: text })} placeholder="instagram.com/username" error={errors.instagram} icon={AtSign} keyboardType="url" autoCapitalize="none" autoCorrect={false} />

        <Text className="mb-3 mt-2 text-xs font-semibold uppercase tracking-wider text-textMuted dark:text-dark-textMuted">Communication</Text>
        <OnboardingFormField label="WhatsApp link" value={draft.whatsapp} onChangeText={(text) => updateDraft({ whatsapp: text })} placeholder="https://wa.me/15551234567" error={errors.whatsapp} icon={MessageCircle} keyboardType="url" autoCapitalize="none" autoCorrect={false} />

        <Text className="mb-3 mt-2 text-xs font-semibold uppercase tracking-wider text-textMuted dark:text-dark-textMuted">Entertainment</Text>
        <OnboardingFormField label="YouTube" value={draft.youtube} onChangeText={(text) => updateDraft({ youtube: text })} placeholder="youtube.com/@channel" error={errors.youtube} icon={Play} keyboardType="url" autoCapitalize="none" autoCorrect={false} />
        <OnboardingFormField label="TikTok" value={draft.tiktok} onChangeText={(text) => updateDraft({ tiktok: text })} placeholder="tiktok.com/@username" error={errors.tiktok} icon={Play} keyboardType="url" autoCapitalize="none" autoCorrect={false} />

        {/* Website */}
        <OnboardingFormField
          label="Personal or Company Website"
          value={draft.website}
          onChangeText={(text) => updateDraft({ website: text })}
          placeholder="https://yourwebsite.com"
          error={errors.website}
          icon={Globe}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          hint="Your primary homepage or blog link."
        />

        {/* Portfolio */}
        <OnboardingFormField
          label="Portfolio / Projects Link"
          value={draft.portfolio}
          onChangeText={(text) => updateDraft({ portfolio: text })}
          placeholder="https://portfolio.me or behance/dribbble"
          error={errors.portfolio}
          icon={Link2}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          hint="Showcase of your designs, case studies, or publications."
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
