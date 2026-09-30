import type { ReactNode } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Briefcase, Contact2, Image as ImageIcon, MapPinned, Phone, Share2 } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';
import { ImageUploadField } from '@/components/uiComponents/ImageUploadField';
import { SocialLinksFieldsBlock, type SocialLinksDraft } from '@/components/onboardingComponents/Components/SocialLinksFieldsBlock';
import type { Profile, ProfileFieldKey, SocialFieldKey } from '../types/profile.types';

type ProfileField = { key: ProfileFieldKey; label: string; keyboardType?: 'email-address' | 'phone-pad' | 'url'; multiline?: boolean };
type SocialField = { key: SocialFieldKey; label: string };
export type ProfileSectionId = 'identity' | 'professional' | 'contact' | 'bio' | 'media' | 'social';
type ProfileSection = { id: ProfileSectionId; heading: string; description: string; icon: LucideIcon; fields?: ProfileField[]; socialFields?: SocialField[]; media?: boolean; socialEditor?: boolean };

export const PROFILE_SECTIONS: ProfileSection[] = [
  {
    id: 'identity', heading: 'Name & identity', description: 'Name, degrees and tagline', icon: Contact2,
    fields: [
      { key: 'prefix', label: 'Prefix' }, { key: 'firstName', label: 'First name' }, { key: 'middleName', label: 'Middle name' },
      { key: 'lastName', label: 'Last name' }, { key: 'suffix', label: 'Suffix' }, { key: 'preferredName', label: 'Preferred name' },
      { key: 'accreditations', label: 'Accreditations / degrees' }, { key: 'tagline', label: 'Tagline' },
    ],
  },
  {
    id: 'professional', heading: 'Professional', description: 'Role and organization', icon: Briefcase,
    fields: [{ key: 'title', label: 'Title' }, { key: 'department', label: 'Department' }, { key: 'organization', label: 'Company' }],
  },
  {
    id: 'contact', heading: 'Contact', description: 'Email, phone and website', icon: Phone,
    fields: [
      { key: 'email', label: 'Email', keyboardType: 'email-address' }, { key: 'phone', label: 'Phone', keyboardType: 'phone-pad' },
      { key: 'website', label: 'Website', keyboardType: 'url' },
    ],
  },
  {
    id: 'bio', heading: 'Address & bio', description: 'Location and introduction', icon: MapPinned,
    fields: [{ key: 'businessAddress', label: 'Address' }, { key: 'shortBio', label: 'Bio (one or two lines)', multiline: true }],
  },
  { id: 'media', heading: 'Photos & logo', description: 'Profile, cover and brand', icon: ImageIcon, media: true },
  {
    id: 'social', heading: 'Social links', description: 'Social, messaging and video links', icon: Share2, socialEditor: true,
    socialFields: [
      { key: 'linkedin', label: 'LinkedIn URL' }, { key: 'youtube', label: 'YouTube URL' }, { key: 'github', label: 'GitHub URL' },
      { key: 'x', label: 'X URL' }, { key: 'instagram', label: 'Instagram URL' }, { key: 'facebook', label: 'Facebook URL' },
      { key: 'whatsapp', label: 'WhatsApp URL' }, { key: 'tiktok', label: 'TikTok URL' }, { key: 'portfolio', label: 'Portfolio URL' },
    ],
  },
];

function sectionSummary(section: ProfileSection, profile: Profile): string {
  if (section.media) {
    const count = [profile.photoUrl, profile.coverPhotoUrl, profile.companyLogoUrl].filter(Boolean).length;
    return count ? `${count} of 3 images added` : 'Add your images';
  }
  const values = section.fields
    ? section.fields.map(({ key }) => profile[key])
    : section.socialFields?.map(({ key }) => profile.social[key] ?? '') ?? [];
  return values.map((value) => value.trim()).filter(Boolean).slice(0, 2).join(' · ') || section.description;
}

export function ProfileSectionGrid({ profile, onSelect }: { profile: Profile; onSelect: (id: ProfileSectionId) => void }) {
  const { theme } = useThemeContext();
  const tint = theme === 'dark' ? Colors.dark.tint : Colors.light.tint;

  return (
    <View className="flex-row flex-wrap justify-between" style={{ rowGap: 14 }}>
      {PROFILE_SECTIONS.map((section) => {
        const Icon = section.icon;
        return (
          <TouchableOpacity
            key={section.id}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${section.heading}`}
            onPress={() => onSelect(section.id)}
            activeOpacity={0.75}
            className="min-h-[160px] items-center justify-center rounded-3xl border border-black/5 bg-card p-4 dark:border-white/5 dark:bg-dark-card"
            style={{ width: '48%' }}
          >
            <View
              className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 dark:bg-dark-primary/15"
            >
              <Icon color={tint} size={28} strokeWidth={2.2} />
            </View>
            <Text
              className="px-1 text-center text-[15px] font-bold text-textPrimary dark:text-dark-textPrimary"
              numberOfLines={2}
            >
              {section.heading}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function FieldInput({ label, value, onChangeText, keyboardType, multiline }: { label: string; value: string; onChangeText: (value: string) => void; keyboardType?: 'email-address' | 'phone-pad' | 'url'; multiline?: boolean }) {
  return (
    <View className="mb-4">
      <Text className="mb-1 ml-1 text-xs font-semibold uppercase text-textMuted dark:text-dark-textMuted">{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} keyboardType={keyboardType} autoCapitalize={keyboardType === 'email-address' || keyboardType === 'url' ? 'none' : 'sentences'} autoCorrect={keyboardType !== 'email-address' && keyboardType !== 'url'} multiline={multiline} numberOfLines={multiline ? 4 : undefined} placeholder={label} placeholderTextColor="#7A7A7A" className="rounded-2xl border border-black/5 bg-black/5 px-4 py-3 text-textPrimary dark:border-white/10 dark:bg-white/5 dark:text-dark-textPrimary" style={multiline ? { minHeight: 96, textAlignVertical: 'top' } : undefined} />
    </View>
  );
}

export function ProfileSectionEditor({ sectionId, draft, onChange, onSocialChange }: { sectionId: ProfileSectionId; draft: Profile; onChange: (field: ProfileFieldKey, value: string) => void; onSocialChange: (field: SocialFieldKey, value: string) => void }) {
  const section = PROFILE_SECTIONS.find(({ id }) => id === sectionId);
  if (!section) return null;
  return (
    <SectionCard heading={section.heading} icon={section.icon}>
      {section.fields?.map((field) => <FieldInput key={field.key} label={field.label} value={draft[field.key]} onChangeText={(value) => onChange(field.key, value)} keyboardType={field.keyboardType} multiline={field.multiline} />)}
      {section.media ? <>
        <ImageUploadField label="Profile photo" variant="avatar" value={draft.photoUrl} onChange={(value) => onChange('photoUrl', value)} onRemove={() => onChange('photoUrl', '')} />
        <ImageUploadField label="Cover photo" variant="banner" value={draft.coverPhotoUrl} onChange={(value) => onChange('coverPhotoUrl', value)} onRemove={() => onChange('coverPhotoUrl', '')} />
        <ImageUploadField label="Company logo" variant="logo" value={draft.companyLogoUrl} onChange={(value) => onChange('companyLogoUrl', value)} onRemove={() => onChange('companyLogoUrl', '')} />
      </> : null}
      {section.socialEditor ? (
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
      ) : section.socialFields?.map((field) => <FieldInput key={field.key} label={field.label} value={draft.social[field.key] ?? ''} onChangeText={(value) => onSocialChange(field.key, value)} keyboardType="url" />)}
    </SectionCard>
  );
}

function SectionCard({ children, heading, icon: Icon }: { children: ReactNode; heading: string; icon: LucideIcon }) {
  const { theme } = useThemeContext();
  const tint = theme === 'dark' ? Colors.dark.tint : Colors.light.tint;
  return (
    <View className="rounded-3xl border border-black/5 bg-card p-4 shadow-sm dark:border-white/5 dark:bg-dark-card">
      <View className="mb-5 flex-row items-center">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 dark:bg-dark-primary/15">
          <Icon color={tint} size={20} strokeWidth={2.2} />
        </View>
        <Text className="text-base font-bold text-textPrimary dark:text-dark-textPrimary">{heading}</Text>
      </View>
      {children}
    </View>
  );
}
