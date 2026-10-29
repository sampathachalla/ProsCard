import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Text } from '@/common/ui/Text';
import { CardMediaHeader } from '@/pages/addCard/Components/CardMediaHeader';
import { FormField } from '@/pages/addCard/Components/FormField';
import { TAGLINE_FIELD } from '@/pages/addCard/Config/addCardFields';
import { SocialLinksFieldsBlock, type SocialLinksDraft } from '@/pages/onboarding/Components/SocialLinksFieldsBlock';
import type { Profile, ProfileFieldKey, SocialFieldKey } from '@/pages/profile/types/profile.types';
import type { AddCardImageField } from '@/pages/addCard/types/addCard.types';

const DEFAULT_GRADIENT: [string, string] = ['#2563eb', '#06b6d4'];
const FIELD_ROW_GAP = 12;

type TextFieldConfig = {
  key: ProfileFieldKey;
  label: string;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'email-address' | 'phone-pad' | 'url' | 'default';
};

const PROFILE_IMAGE_FIELD: Record<AddCardImageField, ProfileFieldKey> = {
  coverPhoto: 'coverPhotoUrl',
  profilePhoto: 'photoUrl',
  logo: 'companyLogoUrl',
};

type Props = {
  draft: Profile;
  onChange: (field: ProfileFieldKey, value: string) => void;
  onSocialChange: (field: SocialFieldKey, value: string) => void;
};

function SectionHeading({ subtitle, title }: { title: string; subtitle: string }) {
  return (
    <View className="mb-2 mt-4">
      <Text variant="subtitle">{title}</Text>
      <Text variant="muted">{subtitle}</Text>
    </View>
  );
}

function FieldRow({ children }: { children: ReactNode }) {
  return (
    <View className="mb-3 flex-row" style={{ gap: FIELD_ROW_GAP }}>
      {children}
    </View>
  );
}

export function AccountDetailsForm({ draft, onChange, onSocialChange }: Props) {
  const setImageField = (field: AddCardImageField, value: string) => {
    onChange(PROFILE_IMAGE_FIELD[field], value);
  };

  const field = (config: TextFieldConfig, options?: { dense?: boolean; flex?: number }) => {
    const input = (
      <FormField
        dense={options?.dense}
        label={config.label}
        value={draft[config.key] ?? ''}
        placeholder={config.placeholder}
        maxLength={config.maxLength}
        multiline={config.multiline}
        keyboardType={config.keyboardType}
        autoCapitalize={config.autoCapitalize}
        showCount={Boolean(config.maxLength && config.maxLength <= 60)}
        onChangeText={(value) => onChange(config.key, value)}
      />
    );
    if (options?.flex === undefined) {
      return input;
    }
    return <View style={{ flex: options.flex }}>{input}</View>;
  };

  return (
    <View className="w-full max-w-[560px] self-center">
      <CardMediaHeader
        coverPhoto={draft.coverPhotoUrl ?? ''}
        profilePhoto={draft.photoUrl ?? ''}
        logo={draft.companyLogoUrl ?? ''}
        logoBackdrop="#f8fafc"
        gradient={DEFAULT_GRADIENT}
        onChange={setImageField}
      />

      <SectionHeading title="Identity" subtitle="Same fields as onboarding — name, title, and tagline." />

      <FieldRow>
        {field(
          { key: 'firstName', label: 'First name', placeholder: 'Alex', maxLength: 50, autoCapitalize: 'words' },
          { dense: true, flex: 1 },
        )}
        {field(
          { key: 'lastName', label: 'Last name', placeholder: 'Morgan', maxLength: 50, autoCapitalize: 'words' },
          { dense: true, flex: 1 },
        )}
      </FieldRow>

      {field({
        key: 'title',
        label: 'Title',
        placeholder: 'e.g. Senior Product Manager',
        maxLength: 80,
        autoCapitalize: 'words',
      })}

      <FieldRow>
        {field(
          { key: 'middleName', label: 'Middle name', placeholder: 'Optional', maxLength: 50, autoCapitalize: 'words' },
          { dense: true, flex: 1 },
        )}
        {field(
          {
            key: 'accreditations',
            label: 'Accreditations',
            placeholder: 'e.g. MS, PhD',
            maxLength: 80,
            autoCapitalize: 'characters',
          },
          { dense: true, flex: 1 },
        )}
      </FieldRow>

      <FormField
        label={TAGLINE_FIELD.label}
        value={draft.tagline ?? ''}
        placeholder={TAGLINE_FIELD.placeholder}
        maxLength={120}
        autoCapitalize={TAGLINE_FIELD.autoCapitalize}
        showCount
        onChangeText={(value) => onChange('tagline', value)}
      />

      <SectionHeading title="Work & contact" subtitle="Email, company, phone, and optional contact details." />

      {field({
        key: 'email',
        label: 'Work email',
        placeholder: 'alex@company.com',
        maxLength: 80,
        keyboardType: 'email-address',
        autoCapitalize: 'none',
      })}

      <FieldRow>
        {field(
          {
            key: 'organization',
            label: 'Company',
            placeholder: 'Acme Innovations',
            maxLength: 100,
            autoCapitalize: 'words',
          },
          { dense: true, flex: 1 },
        )}
        {field(
          {
            key: 'department',
            label: 'Department',
            placeholder: 'Product',
            maxLength: 100,
            autoCapitalize: 'words',
          },
          { dense: true, flex: 1 },
        )}
      </FieldRow>

      <FieldRow>
        {field(
          {
            key: 'phone',
            label: 'Phone',
            placeholder: '+1 (555) 234-5678',
            maxLength: 24,
            keyboardType: 'phone-pad',
          },
          { dense: true, flex: 1 },
        )}
        {field(
          {
            key: 'website',
            label: 'Website',
            placeholder: 'https://…',
            maxLength: 120,
            keyboardType: 'url',
            autoCapitalize: 'none',
          },
          { dense: true, flex: 1 },
        )}
      </FieldRow>

      {field({
        key: 'businessAddress',
        label: 'Business address',
        placeholder: 'City, region, or full address',
        maxLength: 100,
        autoCapitalize: 'words',
      })}

      <FormField
        label="Short bio"
        value={draft.shortBio ?? ''}
        placeholder="One or two lines about your focus"
        maxLength={240}
        multiline
        autoCapitalize="sentences"
        showCount
        onChangeText={(value) => onChange('shortBio', value)}
      />

      <SectionHeading title="Social links" subtitle="Optional links shown on cards when you add them." />
      <SocialLinksFieldsBlock
        draft={draft.social as SocialLinksDraft}
        embedded
        updateDraft={(fields) => {
          for (const [key, value] of Object.entries(fields)) {
            onSocialChange(key as SocialFieldKey, value ?? '');
          }
        }}
        errors={{}}
      />
    </View>
  );
}
