import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { User, Briefcase, Award, Quote, BadgeCheck } from 'lucide-react-native';
import type { OnboardingDraft } from '../types/onboardingStepper.types';
import { OnboardingFormField } from './OnboardingFormField';
import { OptionalFieldsDisclosure } from './OptionalFieldsDisclosure';
import { StepInfoBanner } from './StepInfoBanner';

export interface StepPersonalProps {
  draft: OnboardingDraft;
  updateDraft: (fields: Partial<OnboardingDraft>) => void;
  errors: Record<string, string>;
}

export function StepPersonal({ draft, updateDraft, errors }: StepPersonalProps) {
  const updateName = (
    field: 'prefix' | 'firstName' | 'middleName' | 'lastName' | 'suffix',
    value: string
  ) => {
    const parts = { ...draft, [field]: value };
    const fullName = [parts.prefix, parts.firstName, parts.middleName, parts.lastName, parts.suffix]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(' ');
    updateDraft({ [field]: value, fullName });
  };

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
          icon={BadgeCheck}
          title="Identity"
          description="Only three fields are required. Additional name details can be added now or later from your profile."
        />

        <OnboardingFormField
          label="First name"
          value={draft.firstName}
          onChangeText={(text) => updateName('firstName', text)}
          placeholder="Alex"
          error={errors.firstName}
          icon={User}
          required
          autoCapitalize="words"
          maxLength={50}
        />

        <OnboardingFormField
          label="Last name"
          value={draft.lastName}
          onChangeText={(text) => updateName('lastName', text)}
          placeholder="Morgan"
          error={errors.lastName}
          icon={User}
          required
          autoCapitalize="words"
          maxLength={50}
        />

        <OnboardingFormField
          label="Title"
          value={draft.title}
          onChangeText={(text) => updateDraft({ title: text })}
          placeholder="e.g. Senior Product Manager"
          error={errors.title}
          icon={Briefcase}
          required
          autoCapitalize="words"
          maxLength={80}
          hint="Shown on the front of your card."
        />

        <OptionalFieldsDisclosure
          labelCollapsed="Add more name details"
          labelExpanded="Hide extra name details"
          hint="Prefix, preferred name, accreditations, and tagline"
        >
          <View className="flex-row" style={{ gap: 12 }}>
            <View className="w-24">
              <OnboardingFormField
                label="Prefix"
                value={draft.prefix}
                onChangeText={(text) => updateName('prefix', text)}
                placeholder="Dr."
                icon={User}
                autoCapitalize="words"
                maxLength={15}
              />
            </View>
            <View className="flex-1">
              <OnboardingFormField
                label="Middle name"
                value={draft.middleName}
                onChangeText={(text) => updateName('middleName', text)}
                placeholder="Optional"
                icon={User}
                autoCapitalize="words"
                maxLength={50}
              />
            </View>
            <View className="w-24">
              <OnboardingFormField
                label="Suffix"
                value={draft.suffix}
                onChangeText={(text) => updateName('suffix', text)}
                placeholder="Jr."
                icon={User}
                autoCapitalize="words"
                maxLength={15}
              />
            </View>
          </View>

          <OnboardingFormField
            label="Preferred name"
            value={draft.preferredName}
            onChangeText={(text) => updateDraft({ preferredName: text })}
            placeholder="How people should address you"
            error={errors.preferredName}
            icon={User}
            autoCapitalize="words"
            maxLength={50}
          />

          <OnboardingFormField
            label="Accreditations / degrees"
            value={draft.accreditations}
            onChangeText={(text) => updateDraft({ accreditations: text })}
            placeholder="e.g. MS, PhD, CPA"
            error={errors.accreditations}
            icon={Award}
            autoCapitalize="characters"
            maxLength={80}
          />

          <OnboardingFormField
            label="Tagline"
            value={draft.tagline}
            onChangeText={(text) => updateDraft({ tagline: text })}
            placeholder="A short one-line introduction"
            error={errors.tagline}
            icon={Quote}
            maxLength={120}
          />
        </OptionalFieldsDisclosure>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
