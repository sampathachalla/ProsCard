import React from 'react';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Building, Mail, Phone, FileText, MapPin, Globe, Briefcase } from 'lucide-react-native';
import { ImageUploadField } from '@/components/uiComponents/ImageUploadField';
import type { OnboardingDraft } from '../types/onboardingStepper.types';
import { OnboardingFormField } from './OnboardingFormField';
import { OptionalFieldsDisclosure } from './OptionalFieldsDisclosure';
import { StepInfoBanner } from './StepInfoBanner';

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
        <StepInfoBanner
          icon={Briefcase}
          title="Work & contact"
          description="Email is required so contacts can reach you. Company and phone improve card usefulness but are optional."
        />

        <OnboardingFormField
          label="Work email"
          value={draft.email}
          onChangeText={(text) => updateDraft({ email: text })}
          placeholder="alex@company.com"
          error={errors.email}
          icon={Mail}
          required
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <OnboardingFormField
          label="Company / organization"
          value={draft.organization}
          onChangeText={(text) => updateDraft({ organization: text })}
          placeholder="e.g. Acme Innovations"
          error={errors.organization}
          icon={Building}
          autoCapitalize="words"
          maxLength={100}
        />

        <OnboardingFormField
          label="Phone"
          value={draft.phone}
          onChangeText={(text) => updateDraft({ phone: text })}
          placeholder="+1 (555) 234-5678"
          error={errors.phone}
          icon={Phone}
          keyboardType="phone-pad"
          autoCapitalize="none"
          hint="Optional. Enables one-tap calling from your card."
        />

        <OptionalFieldsDisclosure
          labelCollapsed="Add department, website, address, bio"
          labelExpanded="Hide additional contact details"
          hint="You can complete these later in Profile"
        >
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
            label="Website"
            value={draft.website}
            onChangeText={(text) => updateDraft({ website: text })}
            placeholder="https://yourcompany.com"
            error={errors.website}
            icon={Globe}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <OnboardingFormField
            label="Business address"
            value={draft.businessAddress}
            onChangeText={(text) => updateDraft({ businessAddress: text })}
            placeholder="City, region, or full address"
            error={errors.businessAddress}
            icon={MapPin}
            autoCapitalize="words"
            maxLength={100}
          />

          <OnboardingFormField
            label="Short bio"
            value={draft.shortBio}
            onChangeText={(text) => updateDraft({ shortBio: text })}
            placeholder="One or two lines about your focus"
            error={errors.shortBio}
            icon={FileText}
            multiline
            numberOfLines={3}
            maxLength={240}
          />

          <ImageUploadField
            label="Company logo"
            description="Optional mark shown on your card."
            value={draft.companyLogoUrl}
            onChange={(uri) => updateDraft({ companyLogoUrl: uri })}
            onRemove={() => updateDraft({ companyLogoUrl: '' })}
            variant="logo"
          />
        </OptionalFieldsDisclosure>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
