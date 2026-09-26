import React from 'react';
import { View, Text } from 'react-native';
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
import { ImageUploadField } from '@/components/uiComponents/ImageUploadField';
import type { OnboardingDraft } from '../types/onboardingStepper.types';
import type { FieldSpec } from '../types/onboardingFlow.types';
import { OnboardingFormField } from './OnboardingFormField';
import { OptionalFieldsDisclosure } from './OptionalFieldsDisclosure';

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
        hint="GitHub, X, Instagram, and more"
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

  if (spec.widget === 'image_logo') {
    return (
      <ImageUploadField
        key={spec.key}
        label={spec.label}
        description="Optional logo on your card."
        value={String(draft[spec.key] ?? '')}
        onChange={(uri) => updateDraft({ [spec.key]: uri } as Partial<OnboardingDraft>)}
        onRemove={() => updateDraft({ [spec.key]: '' } as Partial<OnboardingDraft>)}
        variant="logo"
      />
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
        icon={icon}
        required={spec.required}
        hint={spec.hint}
        maxLength={spec.maxLength}
        multiline
        numberOfLines={2}
        autoCapitalize={spec.autoCapitalize ?? 'sentences'}
      />
    );
  }

  if (spec.key === 'shortBio') {
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
        autoCapitalize={spec.autoCapitalize}
      />
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
      keyboardType={spec.keyboardType}
      autoCapitalize={spec.autoCapitalize ?? 'sentences'}
      autoCorrect={spec.key === 'email' || spec.key === 'phone' ? false : true}
      required={spec.required}
      hint={spec.hint}
      maxLength={spec.maxLength}
    />
  );
}
