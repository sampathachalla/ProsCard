import {
  resolveIdentityPreferredName,
  resolveIdentityTemplateId,
  resolveLayoutStyle,
  type BusinessCard,
  type CardSectionId,
  type CardTemplateId,
  type DynamicCardField,
} from '../types/card.types';
import type { Profile } from '@/components/profileComponents/types/profile.types';

export type CardDetailFieldType = 'text' | 'image' | 'multiline' | 'email' | 'phone' | 'url';

export type CardDetailField = {
  id: string;
  title: string;
  type: CardDetailFieldType;
  value: string;
};

export type CardDetailSection = {
  id: CardSectionId;
  title: string;
  templateId: CardTemplateId;
  fields: CardDetailField[];
};

function override(card: BusinessCard, id: keyof BusinessCard['sectionOverrides'], fallback: string): string {
  return card.sectionOverrides[id] ?? fallback;
}

function defaultConnections(card: BusinessCard, profile: Profile): DynamicCardField[] {
  return [
    { id: 'email', title: 'Email', type: 'email', value: profile.email || card.email || '' },
    { id: 'phone', title: 'Phone', type: 'phone', value: profile.phone || card.phone || '' },
    { id: 'website', title: 'Website', type: 'url', value: profile.website || '' },
    { id: 'address', title: 'Address', type: 'text', value: profile.businessAddress || '' },
    { id: 'linkedin', title: 'LinkedIn', type: 'url', value: profile.social?.linkedin || '' },
    { id: 'x', title: 'X', type: 'url', value: profile.social?.x || '' },
    { id: 'github', title: 'GitHub', type: 'url', value: profile.social?.github || '' },
    { id: 'portfolio', title: 'Portfolio', type: 'url', value: profile.social?.portfolio || '' },
    { id: 'instagram', title: 'Instagram', type: 'url', value: profile.social?.instagram || '' },
    { id: 'whatsapp', title: 'WhatsApp', type: 'url', value: profile.social?.whatsapp || '' },
    { id: 'youtube', title: 'YouTube', type: 'url', value: profile.social?.youtube || '' },
    { id: 'facebook', title: 'Facebook', type: 'url', value: profile.social?.facebook || '' },
    { id: 'tiktok', title: 'TikTok', type: 'url', value: profile.social?.tiktok || '' },
  ];
}

export function createCardDetailTemplate(
  card: BusinessCard,
  profile: Profile,
): CardDetailSection[] {
  // Empty profile fields stay empty (renderers show neutral placeholders), never demo data.
  const fallbackFirstName = card.name?.split(' ')[0] || '';
  const fallbackLastName = card.name?.split(' ').slice(1).join(' ') || '';

  return [
    {
      id: 'identity',
      title: 'Identity',
      templateId: resolveIdentityTemplateId(card.sectionLayouts.identity),
      fields: [
        {
          id: 'preferredName',
          title: 'Preferred name',
          type: 'text',
          value:
            card.sectionOverrides.preferredName !== undefined
              ? card.sectionOverrides.preferredName
              : resolveIdentityPreferredName({
                  profilePreferredName: profile.preferredName,
                  profileFirstName: profile.firstName,
                  profileLastName: profile.lastName,
                  profileFullName: profile.fullName,
                  cardName: card.name,
                }),
        },
        {
          id: 'coverPhoto',
          title: 'Cover photo',
          type: 'image',
          value: override(card, 'coverPhoto', profile.coverPhotoUrl || ''),
        },
        {
          id: 'profilePhoto',
          title: 'Profile photo',
          type: 'image',
          value: override(card, 'profilePhoto', profile.photoUrl || ''),
        },
        {
          id: 'logo',
          title: 'Logo',
          type: 'image',
          value: override(card, 'logo', profile.companyLogoUrl || ''),
        },
      ],
    },
    {
      id: 'professional',
      title: 'Professional identity',
      templateId: resolveLayoutStyle(card.sectionLayouts.professional),
      fields: [
        {
          id: 'title',
          title: 'Job title',
          type: 'text',
          value: override(card, 'title', profile.title || card.title || ''),
        },
        {
          id: 'company',
          title: 'Company name',
          type: 'text',
          value: override(card, 'company', profile.organization || card.company || ''),
        },
        {
          id: 'tagline',
          title: 'Tagline',
          type: 'text',
          value: override(card, 'tagline', profile.tagline || ''),
        },
        {
          id: 'accreditations',
          title: 'Accreditations',
          type: 'text',
          value: override(card, 'accreditations', profile.accreditations || ''),
        },
        {
          id: 'prefix',
          title: 'Prefix',
          type: 'text',
          value: override(card, 'prefix', profile.prefix || ''),
        },
        {
          id: 'firstName',
          title: 'First name',
          type: 'text',
          value: override(card, 'firstName', profile.firstName || fallbackFirstName),
        },
        {
          id: 'middleName',
          title: 'Middle name',
          type: 'text',
          value: override(card, 'middleName', profile.middleName || ''),
        },
        {
          id: 'lastName',
          title: 'Last name',
          type: 'text',
          value: override(card, 'lastName', profile.lastName || fallbackLastName),
        },
        {
          id: 'suffix',
          title: 'Suffix',
          type: 'text',
          value: override(card, 'suffix', profile.suffix || ''),
        },
      ],
    },
    {
      id: 'bio',
      title: 'About',
      templateId: resolveLayoutStyle(card.sectionLayouts.bio),
      fields: [
        {
          id: 'bio',
          title: 'Bio',
          type: 'multiline',
          value: override(card, 'bio', profile.shortBio || ''),
        },
      ],
    },
    {
      id: 'connections',
      title: 'Contact & links',
      templateId: resolveLayoutStyle(card.sectionLayouts.connections),
      fields: (card.connectionFieldsCustomized ? card.connectionFields : defaultConnections(card, profile)).map((field) => ({ ...field })),
    },
  ];
}
