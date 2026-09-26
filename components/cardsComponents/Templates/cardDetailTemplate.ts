import { Asset } from 'expo-asset';

import mindProsLogoDark from '@/assets/mindpros-logo-dark.png';
import type { BusinessCard, CardSectionId, CardTemplateId, DynamicCardField } from '../types/card.types';
import type { Profile } from '@/components/profileComponents/types/profile.types';

export const DUMMY_CARD_MEDIA = {
  coverPhoto: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80',
  profilePhoto: 'https://i.pravatar.cc/600?img=12',
  logo: '',
} as const;

export const DUMMY_CARD_PROFESSIONAL = {
  title: 'Founder & CEO',
  company: 'MindPros Technologies',
  tagline: 'Building next-generation digital networking tools for visionary professionals worldwide.',
  accreditations: 'MBA, AWS Certified Architect, PMP',
  prefix: 'Dr.',
  firstName: 'Sampath',
  middleName: 'Kumar',
  lastName: 'Kambhampati',
  suffix: 'PhD',
} as const;

export const DUMMY_CARD_BIO =
  'Founder and product builder focused on creating thoughtful digital experiences that help professionals connect, share their work, and build meaningful relationships across global ecosystems.';

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
    { id: 'email', title: 'Email', type: 'email', value: profile.email || card.email || 'sampath@proscard.app' },
    { id: 'phone', title: 'Phone', type: 'phone', value: profile.phone || card.phone || '+1 (555) 010-2030' },
    { id: 'website', title: 'Website', type: 'url', value: profile.website || 'https://proscard.app' },
    { id: 'address', title: 'Address', type: 'text', value: profile.businessAddress || 'San Francisco, CA' },
    { id: 'linkedin', title: 'LinkedIn', type: 'url', value: profile.social?.linkedin || 'https://linkedin.com/in/sampath' },
    { id: 'x', title: 'X', type: 'url', value: profile.social?.x || 'https://x.com/sampath' },
    { id: 'github', title: 'GitHub', type: 'url', value: profile.social?.github || 'https://github.com/sampath' },
    { id: 'portfolio', title: 'Portfolio', type: 'url', value: profile.social?.portfolio || 'https://sampath.dev' },
    { id: 'instagram', title: 'Instagram', type: 'url', value: profile.social?.instagram || 'https://instagram.com/sampath' },
    { id: 'whatsapp', title: 'WhatsApp', type: 'url', value: profile.social?.whatsapp || '+15550102030' },
    { id: 'youtube', title: 'YouTube', type: 'url', value: profile.social?.youtube || 'https://youtube.com/@sampath' },
    { id: 'facebook', title: 'Facebook', type: 'url', value: profile.social?.facebook || 'https://facebook.com/sampath' },
    { id: 'tiktok', title: 'TikTok', type: 'url', value: profile.social?.tiktok || 'https://tiktok.com/@sampath' },
  ];
}

export function createCardDetailTemplate(
  card: BusinessCard,
  profile: Profile,
): CardDetailSection[] {
  const fallbackFirstName = card.name?.split(' ')[0] || DUMMY_CARD_PROFESSIONAL.firstName;
  const fallbackLastName = card.name?.split(' ').slice(1).join(' ') || DUMMY_CARD_PROFESSIONAL.lastName;

  return [
    {
      id: 'identity',
      title: 'Identity',
      templateId: card.sectionLayouts.identity,
      fields: [
        {
          id: 'preferredName',
          title: 'Preferred name',
          type: 'text',
          value: override(card, 'preferredName', profile.preferredName || card.name || 'Sampath Kambhampati'),
        },
        {
          id: 'coverPhoto',
          title: 'Cover photo',
          type: 'image',
          value: override(card, 'coverPhoto', profile.coverPhotoUrl || DUMMY_CARD_MEDIA.coverPhoto),
        },
        {
          id: 'profilePhoto',
          title: 'Profile photo',
          type: 'image',
          value: override(card, 'profilePhoto', profile.photoUrl || DUMMY_CARD_MEDIA.profilePhoto),
        },
        {
          id: 'logo',
          title: 'Logo',
          type: 'image',
          value: override(card, 'logo', profile.companyLogoUrl || DUMMY_CARD_MEDIA.logo),
        },
      ],
    },
    {
      id: 'professional',
      title: 'Professional identity',
      templateId: card.sectionLayouts.professional,
      fields: [
        {
          id: 'title',
          title: 'Job title',
          type: 'text',
          value: override(card, 'title', profile.title || card.title || DUMMY_CARD_PROFESSIONAL.title),
        },
        {
          id: 'company',
          title: 'Company name',
          type: 'text',
          value: override(card, 'company', profile.organization || card.company || DUMMY_CARD_PROFESSIONAL.company),
        },
        {
          id: 'tagline',
          title: 'Tagline',
          type: 'text',
          value: override(card, 'tagline', profile.tagline || DUMMY_CARD_PROFESSIONAL.tagline),
        },
        {
          id: 'accreditations',
          title: 'Accreditations',
          type: 'text',
          value: override(card, 'accreditations', profile.accreditations || DUMMY_CARD_PROFESSIONAL.accreditations),
        },
        {
          id: 'prefix',
          title: 'Prefix',
          type: 'text',
          value: override(card, 'prefix', profile.prefix || DUMMY_CARD_PROFESSIONAL.prefix),
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
          value: override(card, 'middleName', profile.middleName || DUMMY_CARD_PROFESSIONAL.middleName),
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
          value: override(card, 'suffix', profile.suffix || DUMMY_CARD_PROFESSIONAL.suffix),
        },
      ],
    },
    {
      id: 'bio',
      title: 'About',
      templateId: card.sectionLayouts.bio,
      fields: [
        {
          id: 'bio',
          title: 'Bio',
          type: 'multiline',
          value: override(card, 'bio', profile.shortBio || DUMMY_CARD_BIO),
        },
      ],
    },
    {
      id: 'connections',
      title: 'Contact & links',
      templateId: card.sectionLayouts.connections,
      fields: (card.connectionFieldsCustomized ? card.connectionFields : defaultConnections(card, profile)).map((field) => ({ ...field })),
    },
  ];
}
