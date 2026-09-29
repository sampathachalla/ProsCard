import React from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { Link2, GitFork, AtSign, Share2, MessageCircle, Play } from 'lucide-react-native';
import { ImageUploadField } from '@/components/uiComponents/ImageUploadField';
import type { OnboardingDraft } from '../types/onboardingStepper.types';
import { OnboardingFormField } from './OnboardingFormField';
import { OptionalFieldsDisclosure } from './OptionalFieldsDisclosure';
import { StepInfoBanner } from './StepInfoBanner';

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
        <StepInfoBanner
          icon={Share2}
          title="Photo & links"
          description="Optional. Skip anytime — you can add a photo and social profiles from Profile after your card is created."
        />

        <ImageUploadField
          label="Profile photo"
          description="Your headshot on the card and profile."
          value={draft.photoUrl}
          onChange={(uri) => updateDraft({ photoUrl: uri })}
          onRemove={() => updateDraft({ photoUrl: '' })}
          variant="avatar"
        />

        <OnboardingFormField
          label="LinkedIn"
          value={draft.linkedin}
          onChangeText={(text) => updateDraft({ linkedin: text })}
          placeholder="linkedin.com/in/username or username"
          error={errors.linkedin}
          icon={Link2}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <OptionalFieldsDisclosure
          labelCollapsed="Add more links"
          labelExpanded="Hide additional links"
          hint="GitHub, X, Instagram, website portfolio, and more"
        >
          <ImageUploadField
            label="Cover photo"
            description="Optional banner for your profile."
            value={draft.coverPhotoUrl}
            onChange={(uri) => updateDraft({ coverPhotoUrl: uri })}
            onRemove={() => updateDraft({ coverPhotoUrl: '' })}
            variant="banner"
          />

          <OnboardingFormField
            label="GitHub"
            value={draft.github}
            onChangeText={(text) => updateDraft({ github: text })}
            placeholder="@username or github.com/username"
            error={errors.github}
            icon={GitFork}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <OnboardingFormField
            label="X (Twitter)"
            value={draft.x}
            onChangeText={(text) => updateDraft({ x: text })}
            placeholder="@username"
            error={errors.x}
            icon={AtSign}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <OnboardingFormField
            label="Facebook"
            value={draft.facebook}
            onChangeText={(text) => updateDraft({ facebook: text })}
            placeholder="facebook.com/username"
            error={errors.facebook}
            icon={AtSign}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <OnboardingFormField
            label="Instagram"
            value={draft.instagram}
            onChangeText={(text) => updateDraft({ instagram: text })}
            placeholder="instagram.com/username"
            error={errors.instagram}
            icon={AtSign}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text className="mb-3 mt-1 text-xs font-semibold uppercase tracking-wider text-textMuted dark:text-dark-textMuted">
            Communication
          </Text>
          <OnboardingFormField
            label="WhatsApp"
            value={draft.whatsapp}
            onChangeText={(text) => updateDraft({ whatsapp: text })}
            placeholder="https://wa.me/15551234567"
            error={errors.whatsapp}
            icon={MessageCircle}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text className="mb-3 mt-1 text-xs font-semibold uppercase tracking-wider text-textMuted dark:text-dark-textMuted">
            Media
          </Text>
          <OnboardingFormField
            label="YouTube"
            value={draft.youtube}
            onChangeText={(text) => updateDraft({ youtube: text })}
            placeholder="youtube.com/@channel"
            error={errors.youtube}
            icon={Play}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <OnboardingFormField
            label="TikTok"
            value={draft.tiktok}
            onChangeText={(text) => updateDraft({ tiktok: text })}
            placeholder="tiktok.com/@username"
            error={errors.tiktok}
            icon={Play}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <OnboardingFormField
            label="Portfolio"
            value={draft.portfolio}
            onChangeText={(text) => updateDraft({ portfolio: text })}
            placeholder="https://portfolio.me"
            error={errors.portfolio}
            icon={Link2}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </OptionalFieldsDisclosure>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
