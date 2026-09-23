// components/profileComponents/Components/ProfileForm.tsx
import { View, Text, TextInput } from 'react-native';
import type { Profile, ProfileFieldKey, SocialFieldKey } from '../types/profile.types';

const SECTIONS: {
  heading: string;
  fields: { key: ProfileFieldKey; label: string; keyboardType?: 'email-address' | 'phone-pad' | 'url'; multiline?: boolean }[];
}[] = [
  {
    heading: 'Name & identity',
    fields: [
      { key: 'prefix', label: 'Prefix' },
      { key: 'firstName', label: 'First name' },
      { key: 'middleName', label: 'Middle name' },
      { key: 'lastName', label: 'Last name' },
      { key: 'suffix', label: 'Suffix' },
      { key: 'preferredName', label: 'Preferred name' },
      { key: 'accreditations', label: 'Accreditations / degrees' },
      { key: 'tagline', label: 'Tagline' },
    ],
  },
  {
    heading: 'Professional',
    fields: [
      { key: 'title', label: 'Title' },
      { key: 'department', label: 'Department' },
      { key: 'organization', label: 'Company' },
    ],
  },
  {
    heading: 'Photos & logo',
    fields: [
      { key: 'photoUrl', label: 'Profile photo URL', keyboardType: 'url' },
      { key: 'coverPhotoUrl', label: 'Cover photo URL', keyboardType: 'url' },
      { key: 'companyLogoUrl', label: 'Logo URL', keyboardType: 'url' },
    ],
  },
  {
    heading: 'Contact',
    fields: [
      { key: 'email', label: 'Email', keyboardType: 'email-address' },
      { key: 'phone', label: 'Phone', keyboardType: 'phone-pad' },
      { key: 'website', label: 'Website', keyboardType: 'url' },
    ],
  },
  {
    heading: 'Address & bio',
    fields: [
      { key: 'businessAddress', label: 'Address' },
      { key: 'shortBio', label: 'Bio (one or two lines)', multiline: true },
    ],
  },
];

const LINK_SECTIONS: { heading: string; fields: { key: SocialFieldKey; label: string }[] }[] = [
  { heading: 'Social', fields: [
    { key: 'linkedin', label: 'LinkedIn URL' },
    { key: 'facebook', label: 'Facebook URL' },
    { key: 'x', label: 'X (Twitter) URL' },
    { key: 'instagram', label: 'Instagram URL' },
    { key: 'github', label: 'GitHub URL' },
    { key: 'portfolio', label: 'Portfolio URL' },
  ] },
  { heading: 'Communication', fields: [
    { key: 'whatsapp', label: 'WhatsApp URL' },
  ] },
  { heading: 'Entertainment', fields: [
    { key: 'youtube', label: 'YouTube URL' },
    { key: 'tiktok', label: 'TikTok URL' },
  ] },
];

function FieldInput({
  label,
  value,
  onChangeText,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'email-address' | 'phone-pad' | 'url';
  multiline?: boolean;
}) {
  return (
    <View className="mb-4">
      <Text className="text-textMuted dark:text-dark-textMuted text-xs font-semibold uppercase mb-1 ml-1">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' || keyboardType === 'url' ? 'none' : 'sentences'}
        multiline={multiline}
        numberOfLines={multiline ? 4 : undefined}
        placeholder={label}
        placeholderTextColor="#7A7A7A"
        className="bg-card dark:bg-dark-card rounded-2xl px-4 py-3 text-textPrimary dark:text-dark-textPrimary"
        style={multiline ? { minHeight: 96, textAlignVertical: 'top' } : undefined}
      />
    </View>
  );
}

export function ProfileForm({
  draft,
  onChange,
  onSocialChange,
}: {
  draft: Profile;
  onChange: (field: ProfileFieldKey, value: string) => void;
  onSocialChange: (field: SocialFieldKey, value: string) => void;
}) {
  return (
    <View>
      {SECTIONS.map((section) => (
        <View key={section.heading} className="mb-2">
          <Text className="text-textMuted dark:text-dark-textMuted text-xs font-semibold uppercase mb-2 ml-1">
            {section.heading}
          </Text>
          {section.fields.map((field) => (
            <FieldInput
              key={field.key}
              label={field.label}
              value={draft[field.key]}
              onChangeText={(value) => onChange(field.key, value)}
              keyboardType={field.keyboardType}
              multiline={field.multiline}
            />
          ))}
        </View>
      ))}

      {LINK_SECTIONS.map((section) => (
        <View className="mb-2" key={section.heading}>
          <Text className="text-textMuted dark:text-dark-textMuted text-xs font-semibold uppercase mb-2 ml-1">{section.heading}</Text>
          {section.fields.map((field) => (
            <FieldInput key={field.key} label={field.label} value={draft.social[field.key] ?? ''} onChangeText={(value) => onSocialChange(field.key, value)} keyboardType="url" />
          ))}
        </View>
      ))}
    </View>
  );
}
