// components/profileComponents/Components/ProfileForm.tsx
import type { ReactNode } from 'react';
import { View, Text, TextInput } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Contact2, Briefcase, Image as ImageIcon, Phone, MapPinned, Share2, MessageCircle, PlaySquare } from 'lucide-react-native';
import type { Profile, ProfileFieldKey, SocialFieldKey } from '../types/profile.types';

const SECTIONS: {
  heading: string;
  icon: LucideIcon;
  accentColor: string;
  fields: { key: ProfileFieldKey; label: string; keyboardType?: 'email-address' | 'phone-pad' | 'url'; multiline?: boolean }[];
}[] = [
  {
    heading: 'Name & identity',
    icon: Contact2,
    accentColor: '#2563eb',
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
    icon: Briefcase,
    accentColor: '#7c3aed',
    fields: [
      { key: 'title', label: 'Title' },
      { key: 'department', label: 'Department' },
      { key: 'organization', label: 'Company' },
    ],
  },
  {
    heading: 'Photos & logo',
    icon: ImageIcon,
    accentColor: '#db2777',
    fields: [
      { key: 'photoUrl', label: 'Profile photo URL', keyboardType: 'url' },
      { key: 'coverPhotoUrl', label: 'Cover photo URL', keyboardType: 'url' },
      { key: 'companyLogoUrl', label: 'Logo URL', keyboardType: 'url' },
    ],
  },
  {
    heading: 'Contact',
    icon: Phone,
    accentColor: '#0891b2',
    fields: [
      { key: 'email', label: 'Email', keyboardType: 'email-address' },
      { key: 'phone', label: 'Phone', keyboardType: 'phone-pad' },
      { key: 'website', label: 'Website', keyboardType: 'url' },
    ],
  },
  {
    heading: 'Address & bio',
    icon: MapPinned,
    accentColor: '#16a34a',
    fields: [
      { key: 'businessAddress', label: 'Address' },
      { key: 'shortBio', label: 'Bio (one or two lines)', multiline: true },
    ],
  },
];

const LINK_SECTIONS: { heading: string; icon: LucideIcon; accentColor: string; fields: { key: SocialFieldKey; label: string }[] }[] = [
  { heading: 'Social', icon: Share2, accentColor: '#f59e0b', fields: [
    { key: 'linkedin', label: 'LinkedIn URL' },
    { key: 'facebook', label: 'Facebook URL' },
    { key: 'x', label: 'X (Twitter) URL' },
    { key: 'instagram', label: 'Instagram URL' },
    { key: 'github', label: 'GitHub URL' },
    { key: 'portfolio', label: 'Portfolio URL' },
  ] },
  { heading: 'Communication', icon: MessageCircle, accentColor: '#059669', fields: [
    { key: 'whatsapp', label: 'WhatsApp URL' },
  ] },
  { heading: 'Entertainment', icon: PlaySquare, accentColor: '#dc2626', fields: [
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
        className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-4 py-3 text-textPrimary dark:text-dark-textPrimary"
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
        <SectionCard key={section.heading} accentColor={section.accentColor} fieldCount={section.fields.length} heading={section.heading} icon={section.icon}>
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
        </SectionCard>
      ))}

      {LINK_SECTIONS.map((section) => (
        <SectionCard key={section.heading} accentColor={section.accentColor} fieldCount={section.fields.length} heading={section.heading} icon={section.icon}>
          {section.fields.map((field) => (
            <FieldInput key={field.key} label={field.label} value={draft.social[field.key] ?? ''} onChangeText={(value) => onSocialChange(field.key, value)} keyboardType="url" />
          ))}
        </SectionCard>
      ))}
    </View>
  );
}

function SectionCard({
  accentColor,
  children,
  fieldCount,
  heading,
  icon: Icon,
}: {
  accentColor: string;
  children: ReactNode;
  fieldCount: number;
  heading: string;
  icon: LucideIcon;
}) {
  return (
    <View className="mb-5 rounded-3xl border border-black/5 bg-card p-4 shadow-sm dark:border-white/5 dark:bg-dark-card">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="mr-2.5 h-9 w-9 items-center justify-center rounded-2xl" style={{ backgroundColor: `${accentColor}1F` }}>
            <Icon color={accentColor} size={18} />
          </View>
          <Text className="text-sm font-bold uppercase tracking-wide text-textPrimary dark:text-dark-textPrimary">
            {heading}
          </Text>
        </View>
        <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: `${accentColor}1F` }}>
          <Text className="text-[10px] font-bold" style={{ color: accentColor }}>
            {fieldCount} {fieldCount === 1 ? 'field' : 'fields'}
          </Text>
        </View>
      </View>
      {children}
    </View>
  );
}
