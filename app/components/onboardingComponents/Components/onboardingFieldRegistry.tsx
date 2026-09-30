import React from 'react';
import { View } from 'react-native';
import {
  User,
  Briefcase,
  Building,
  Mail,
  Phone,
  FileText,
  MapPin,
  Globe,
  Award,
  Quote,
  Link2,
  GitFork,
  AtSign,
  MessageCircle,
  Play,
  type LucideIcon,
} from 'lucide-react-native';
import { Text } from '@/components/uiComponents/Text';
import { ImageUploadField } from '@/components/uiComponents/ImageUploadField';
import type { OnboardingDraft } from '../types/onboardingStepper.types';
import type { FieldSpec } from '../types/onboardingFlow.types';
import { OnboardingFormField } from './OnboardingFormField';
import { SocialLinksFieldsBlock } from './SocialLinksFieldsBlock';
const FIELD_ICONS: Partial<Record<keyof OnboardingDraft, LucideIcon>> = {
  firstName: User,
  lastName: User,
  prefix: User,
  middleName: User,
  suffix: User,
  title: Briefcase,
  organization: Building,
  department: Building,
  email: Mail,
  phone: Phone,
  website: Globe,
  businessAddress: MapPin,
  shortBio: FileText,
  accreditations: Award,
  tagline: Quote,
  linkedin: Link2,
  github: GitFork,
  x: AtSign,
  facebook: AtSign,
  instagram: AtSign,
  whatsapp: MessageCircle,
  youtube: Play,
  tiktok: Play,
  portfolio: Link2,
};

function rebuildFullName(parts: OnboardingDraft): string {
  return [parts.prefix, parts.firstName, parts.middleName, parts.lastName, parts.suffix]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' ');
}

const STRUCTURED_NAME_KEYS = new Set<keyof OnboardingDraft>([
  'prefix',
  'firstName',
  'middleName',
  'lastName',
  'suffix',
]);

const STRUCTURED_NAME_PLACEHOLDERS: Partial<Record<keyof OnboardingDraft, string>> = {
  prefix: 'Prefix',
  firstName: 'First name',
  middleName: 'Middle name',
  lastName: 'Last name',
  suffix: 'Suffix',
};

function structuredNamePresentation(spec: FieldSpec): { label: string; placeholder: string } {
  if (!STRUCTURED_NAME_KEYS.has(spec.key)) {
    return { label: spec.label, placeholder: spec.placeholder ?? spec.label };
  }
  return {
    label: '',
    placeholder: spec.placeholder ?? STRUCTURED_NAME_PLACEHOLDERS[spec.key] ?? spec.label,
  };
}

export function PresenceFieldsBlock({
  draft,
  updateDraft,
  errors,
}: {
  draft: OnboardingDraft;
  updateDraft: (fields: Partial<OnboardingDraft>) => void;
  errors: Record<string, string>;
}) {
  return (
    <View>
      <ImageUploadField
        label="Profile photo"
        value={draft.photoUrl}
        onChange={(uri) => updateDraft({ photoUrl: uri })}
        variant="avatar"
        presentation="compact"
      />

      <View className="mt-6 w-full">
        <View className="mb-3 flex-row items-center gap-2">
          <View className="h-9 w-9 items-center justify-center rounded-full bg-sky-500/15">
            <Quote size={18} color="#38bdf8" strokeWidth={2.2} />
          </View>
          <View className="flex-1">
            <Text
              variant="none"
              className="text-base font-semibold text-textPrimary dark:text-dark-textPrimary"
            >
              Enter your tagline
            </Text>
            <Text variant="none" className="mt-0.5 text-sm text-textMuted dark:text-dark-textMuted">
              One short line on your card
            </Text>
          </View>
        </View>
        <OnboardingFormField
          label=""
          value={draft.tagline}
          onChangeText={(text) => updateDraft({ tagline: text })}
          placeholder="Type your tagline here…"
          error={errors.tagline}
          variant="boxed"
          maxLength={120}
          multiline
          numberOfLines={3}
          autoCapitalize="sentences"
          showCharacterCount
          characterCountPlacement="top"
          hideClear
        />
      </View>

    </View>
  );
}

export function renderOnboardingField(
  spec: FieldSpec,
  draft: OnboardingDraft,
  updateDraft: (fields: Partial<OnboardingDraft>) => void,
  errors: Record<string, string>
): React.ReactNode {
  if (spec.widget === 'presence_block') {
    return (
      <PresenceFieldsBlock
        key="presence_block"
        draft={draft}
        updateDraft={updateDraft}
        errors={errors}
      />
    );
  }

  if (spec.widget === 'social_block') {
    return (
      <SocialLinksFieldsBlock
        key="social_block"
        draft={draft}
        updateDraft={updateDraft}
        errors={errors}
      />
    );
  }

  if (spec.widget === 'image_logo') {
    return (
      <View key={spec.key} className="w-full">
        <ImageUploadField
          label={spec.label}
          description="Optional logo on your card."
          value={String(draft[spec.key] ?? '')}
          onChange={(uri) => updateDraft({ [spec.key]: uri } as Partial<OnboardingDraft>)}
          onRemove={() => updateDraft({ [spec.key]: '' } as Partial<OnboardingDraft>)}
          variant="logo"
        />
        {errors[spec.key] ? <Text className="mt-2 text-sm text-rose-400">{errors[spec.key]}</Text> : null}
      </View>
    );
  }

  const value = String(draft[spec.key] ?? '');
  const icon = spec.hideIcon ? undefined : FIELD_ICONS[spec.key];
  const nameKeys = new Set(['prefix', 'firstName', 'middleName', 'lastName', 'suffix']);

  const onChangeText = (text: string) => {
    if (nameKeys.has(spec.key)) {
      const next = { ...draft, [spec.key]: text } as OnboardingDraft;
      updateDraft({
        [spec.key]: text,
        fullName: rebuildFullName(next),
      } as Partial<OnboardingDraft>);
      return;
    }
    updateDraft({ [spec.key]: text } as Partial<OnboardingDraft>);
  };

  if (spec.key === 'tagline') {
    return (
      <OnboardingFormField
        key={spec.key}
        label={spec.label}
        value={value}
        onChangeText={onChangeText}
        placeholder={spec.placeholder}
        error={errors[spec.key]}
        required={spec.required}
        hint={spec.hint}
        maxLength={spec.maxLength ?? 120}
        multiline
        numberOfLines={3}
        autoCapitalize={spec.autoCapitalize ?? 'sentences'}
        showCharacterCount
        hideClear
        compact
        centerAlign
      />
    );
  }

  if (spec.key === 'shortBio') {
    const bioOnOwnStep = !spec.label;
    if (bioOnOwnStep) {
      return (
        <View key={spec.key} className="w-full">
          <View className="mb-3 flex-row items-center gap-2">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-sky-500/15">
              <FileText size={18} color="#38bdf8" strokeWidth={2.2} />
            </View>
            <View className="flex-1">
              <Text
                variant="none"
                className="text-base font-semibold text-textPrimary dark:text-dark-textPrimary"
              >
                Write your short bio
              </Text>
              <Text
                variant="none"
                className="mt-0.5 text-sm text-textMuted dark:text-dark-textMuted"
              >
                A brief professional summary on your card
              </Text>
            </View>
          </View>
          <OnboardingFormField
            label=""
            value={value}
            onChangeText={onChangeText}
            placeholder="Describe what you do, your experience, or what you care about…"
            error={errors[spec.key]}
            variant="boxed"
            maxLength={spec.maxLength ?? 240}
            multiline
            numberOfLines={5}
            autoCapitalize={spec.autoCapitalize ?? 'sentences'}
            showCharacterCount
            characterCountPlacement="top"
            hideClear
          />
        </View>
      );
    }
    return (
      <OnboardingFormField
        key={spec.key}
        label={spec.label}
        value={value}
        onChangeText={onChangeText}
        placeholder={spec.placeholder}
        error={errors[spec.key]}
        icon={icon}
        required={spec.required}
        hint={spec.hint}
        maxLength={spec.maxLength}
        multiline
        numberOfLines={4}
        autoCapitalize={spec.autoCapitalize ?? 'sentences'}
      />
    );
  }

  const { label, placeholder } = structuredNamePresentation(spec);

  return (
    <OnboardingFormField
      key={spec.key}
      label={label}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      error={errors[spec.key]}
      icon={icon}
      keyboardType={spec.keyboardType}
      autoCapitalize={spec.autoCapitalize ?? 'sentences'}
      autoCorrect={spec.key === 'email' || spec.key === 'phone' ? false : true}
      required={spec.required}
      hint={spec.hint}
      maxLength={spec.maxLength}
      compact={STRUCTURED_NAME_KEYS.has(spec.key)}
      hideClear={
        STRUCTURED_NAME_KEYS.has(spec.key) ||
        label === '' ||
        spec.key === 'email' ||
        spec.key === 'phone'
      }
    />
  );
}
