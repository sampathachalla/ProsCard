// pages/addCard/Config/addCardFields.ts
import type { MediaKind } from '@/services/api/types';
import type {
  AddCardImageField,
  AddCardTextFieldConfig,
  ContactOption,
  PrimaryContactConfig,
} from '../types/addCard.types';

/** Identity and professional fields shown between the media header and the contact rows. */
export const PROFILE_TEXT_FIELDS: AddCardTextFieldConfig[] = [
  { id: 'name', label: 'Name', placeholder: 'e.g. Alex Morgan', maxLength: 32, autoCapitalize: 'words' },
  { id: 'title', label: 'Title', placeholder: 'e.g. Product Designer', maxLength: 60, autoCapitalize: 'words' },
  { id: 'company', label: 'Company', placeholder: 'e.g. MindPros', maxLength: 60, autoCapitalize: 'words' },
  { id: 'accreditations', label: 'Accreditations', placeholder: 'e.g. MBA, PMP', maxLength: 48, autoCapitalize: 'characters' },
];

export const TAGLINE_FIELD: AddCardTextFieldConfig = {
  id: 'tagline',
  label: 'Tag',
  placeholder: 'e.g. Building thoughtful digital products',
  maxLength: 50,
  autoCapitalize: 'sentences',
};

/** Ids match the default connection fields so profile values are pre-filled. */
export const PRIMARY_CONTACTS: PrimaryContactConfig[] = [
  { id: 'address', label: 'Location', type: 'text', placeholder: 'City, Country', keyboardType: 'default' },
  { id: 'email', label: 'Email', type: 'email', placeholder: 'name@company.com', keyboardType: 'email-address' },
  { id: 'phone', label: 'Phone', type: 'phone', placeholder: '+1 555 010 2030', keyboardType: 'phone-pad' },
];

export const PRIMARY_CONTACT_IDS = new Set<string>(PRIMARY_CONTACTS.map((contact) => contact.id));

export const CONTACT_OPTIONS: ContactOption[] = [
  { title: 'Website', type: 'url', placeholder: 'https://yoursite.com' },
  { title: 'LinkedIn', type: 'url', placeholder: 'https://linkedin.com/in/you' },
  { title: 'X', type: 'url', placeholder: 'https://x.com/you' },
  { title: 'GitHub', type: 'url', placeholder: 'https://github.com/you' },
  { title: 'Instagram', type: 'url', placeholder: 'https://instagram.com/you' },
  { title: 'Facebook', type: 'url', placeholder: 'https://facebook.com/you' },
  { title: 'WhatsApp', type: 'url', placeholder: 'https://wa.me/15550102030' },
  { title: 'YouTube', type: 'url', placeholder: 'https://youtube.com/@you' },
  { title: 'TikTok', type: 'url', placeholder: 'https://tiktok.com/@you' },
  { title: 'Threads', type: 'url', placeholder: 'https://threads.net/@you' },
  { title: 'Bluesky', type: 'url', placeholder: 'https://bsky.app/profile/you' },
  { title: 'Discord', type: 'url', placeholder: 'https://discord.gg/community' },
  { title: 'Telegram', type: 'url', placeholder: 'https://t.me/you' },
  { title: 'Snapchat', type: 'url', placeholder: 'https://snapchat.com/add/you' },
  { title: 'Pinterest', type: 'url', placeholder: 'https://pinterest.com/you' },
  { title: 'Reddit', type: 'url', placeholder: 'https://reddit.com/u/you' },
  { title: 'Portfolio', type: 'url', placeholder: 'https://portfolio.com/you' },
  { title: 'Work phone', type: 'phone', placeholder: '+1 555 010 2030' },
  { title: 'Work email', type: 'email', placeholder: 'team@company.com' },
];

export const BIO_MAX_LENGTH = 240;

export const IMAGE_ASPECTS: Record<AddCardImageField, [number, number]> = {
  coverPhoto: [16, 9],
  profilePhoto: [1, 1],
  logo: [1, 1],
};

export const IMAGE_MEDIA_KINDS: Record<AddCardImageField, Exclude<MediaKind, 'contactCard'>> = {
  coverPhoto: 'coverPhoto',
  profilePhoto: 'profilePhoto',
  logo: 'companyLogo',
};

export const IMAGE_LABELS: Record<AddCardImageField, string> = {
  coverPhoto: 'Cover photo',
  profilePhoto: 'Profile photo',
  logo: 'Logo',
};
