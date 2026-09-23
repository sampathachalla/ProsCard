import React from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Building, Mail, FileText, Briefcase, Image } from 'lucide-react-native';
import type { OnboardingDraft } from '../types/onboardingStepper.types';
import { OnboardingFormField } from './OnboardingFormField';

export interface StepProfessionalProps {
  draft: OnboardingDraft;
  updateDraft: (fields: Partial<OnboardingDraft>) => void;
  errors: Record<string, string>;
}

export function StepProfessional({ draft, updateDraft, errors }: StepProfessionalProps) {
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
        <View className="flex-row items-start p-4 mb-6 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900/40">
          <Briefcase size={20} className="text-brandCyan dark:text-brandCyanLight mt-0.5 mr-3 shrink-0" />
          <View className="flex-1">
            <Text className="text-sm font-bold text-textPrimary dark:text-dark-textPrimary">
              Professional Details
            </Text>
            <Text className="text-xs text-textMuted dark:text-dark-textMuted mt-0.5 leading-4">
              Connect your organization and primary work contact email to build credibility with recipients.
            </Text>
          </View>
        </View>

        {/* Company / Organization */}
        <OnboardingFormField
          label="Company / Organization"
          value={draft.organization}
          onChangeText={(text) => updateDraft({ organization: text })}
          placeholder="e.g. Acme Innovations Corp"
          error={errors.organization}
          icon={Building}
          autoCapitalize="words"
          maxLength={100}
          hint="The organization or brand you currently represent."
        />

        <OnboardingFormField
          label="Department"
          value={draft.department}
          onChangeText={(text) => updateDraft({ department: text })}
          placeholder="e.g. Product Engineering"
          error={errors.department}
          icon={Building}
          autoCapitalize="words"
          maxLength={100}
        />

        <OnboardingFormField
          label="Company logo URL"
          value={draft.companyLogoUrl}
          onChangeText={(text) => updateDraft({ companyLogoUrl: text })}
          placeholder="https://example.com/logo.png"
          error={errors.companyLogoUrl}
          icon={Image}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Work Email */}
        <OnboardingFormField
          label="Work Email"
          value={draft.workEmail}
          onChangeText={(text) => updateDraft({ workEmail: text })}
          placeholder="e.g. alex@acme.com"
          error={errors.workEmail}
          icon={Mail}
          required
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          hint="Required. Primary email where contacts can reach you."
        />

        {/* Bio / About Summary */}
        <OnboardingFormField
          label="Bio / About Summary"
          value={draft.shortBio}
          onChangeText={(text) => updateDraft({ shortBio: text })}
          placeholder="e.g. Passionate product architect focused on building distributed systems and high-impact developer tooling."
          error={errors.shortBio}
          icon={FileText}
          multiline
          numberOfLines={4}
          maxLength={240}
          hint="A concise summary featured on your digital card back and public profile."
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
