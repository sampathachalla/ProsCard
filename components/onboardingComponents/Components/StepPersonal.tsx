import React from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { User, Briefcase, Phone, MapPin, BadgeCheck, Image, Quote, Award } from 'lucide-react-native';
import type { OnboardingDraft } from '../types/onboardingStepper.types';
import { OnboardingFormField } from './OnboardingFormField';

export interface StepPersonalProps {
  draft: OnboardingDraft;
  updateDraft: (fields: Partial<OnboardingDraft>) => void;
  errors: Record<string, string>;
}

export function StepPersonal({ draft, updateDraft, errors }: StepPersonalProps) {
  const updateName = (field: 'prefix' | 'firstName' | 'middleName' | 'lastName' | 'suffix', value: string) => {
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
        {/* Informational Banner */}
        <View className="flex-row items-start p-4 mb-6 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
          <BadgeCheck size={20} className="text-primary dark:text-dark-primary mt-0.5 mr-3 shrink-0" />
          <View className="flex-1">
            <Text className="text-sm font-bold text-textPrimary dark:text-dark-textPrimary">
              Personal Identity
            </Text>
            <Text className="text-xs text-textMuted dark:text-dark-textMuted mt-0.5 leading-4">
              Your name and headline form the centerpiece of your business card front.
            </Text>
          </View>
        </View>

        {/* Form Fields */}
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
              label="First name"
              value={draft.firstName}
              onChangeText={(text) => updateName('firstName', text)}
              placeholder="Alex"
              error={errors.firstName || errors.fullName}
              icon={User}
              required
              autoCapitalize="words"
              maxLength={50}
            />
          </View>
        </View>

        <OnboardingFormField
          label="Middle name"
          value={draft.middleName}
          onChangeText={(text) => updateName('middleName', text)}
          placeholder="Optional"
          icon={User}
          autoCapitalize="words"
          maxLength={50}
        />

        <View className="flex-row" style={{ gap: 12 }}>
          <View className="flex-1">
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

        <OnboardingFormField label="Preferred name" value={draft.preferredName} onChangeText={(text) => updateDraft({ preferredName: text })} placeholder="How people should address you" icon={User} autoCapitalize="words" maxLength={50} />
        <OnboardingFormField label="Accreditations / degrees" value={draft.accreditations} onChangeText={(text) => updateDraft({ accreditations: text })} placeholder="e.g. MS, PhD, CPA" icon={Award} autoCapitalize="characters" maxLength={80} />
        <OnboardingFormField label="Tagline" value={draft.tagline} onChangeText={(text) => updateDraft({ tagline: text })} placeholder="A short one-line introduction" error={errors.tagline} icon={Quote} maxLength={120} />

        <OnboardingFormField
          label="Professional Headline / Title"
          value={draft.title}
          onChangeText={(text) => updateDraft({ title: text })}
          placeholder="e.g. Senior Software Architect"
          error={errors.title}
          icon={Briefcase}
          autoCapitalize="words"
          maxLength={80}
          hint="Your current position or professional specialization."
        />

        <OnboardingFormField label="Profile photo URL" value={draft.profilePhotoUrl} onChangeText={(text) => updateDraft({ profilePhotoUrl: text })} placeholder="https://example.com/profile.jpg" error={errors.profilePhotoUrl} icon={Image} keyboardType="url" autoCapitalize="none" autoCorrect={false} />
        <OnboardingFormField label="Cover photo URL" value={draft.coverPhotoUrl} onChangeText={(text) => updateDraft({ coverPhotoUrl: text })} placeholder="https://example.com/cover.jpg" error={errors.coverPhotoUrl} icon={Image} keyboardType="url" autoCapitalize="none" autoCorrect={false} />

        <OnboardingFormField
          label="Phone Number"
          value={draft.phone}
          onChangeText={(text) => updateDraft({ phone: text })}
          placeholder="e.g. +1 (555) 234-5678"
          error={errors.phone}
          icon={Phone}
          keyboardType="phone-pad"
          autoCapitalize="none"
          hint="Optional. Enables one-tap calling from your digital card."
        />

        <OnboardingFormField
          label="Location"
          value={draft.location}
          onChangeText={(text) => updateDraft({ location: text })}
          placeholder="e.g. San Francisco, CA"
          error={errors.location}
          icon={MapPin}
          autoCapitalize="words"
          maxLength={100}
          hint="Optional. City, region, or remote status."
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
