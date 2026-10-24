import { describe, expect, it } from 'vitest';
import type { Profile } from '@/pages/profile/types/profile.types';
import type { BusinessCard } from '@/pages/cards/types/card.types';
import {
  connectionCounts,
  profileValueForConnection,
  profileWithConnectionFields,
  reusableConnectionValue,
} from '@/pages/profile/Services/profileConnections';

describe('profile connection fields', () => {
  const emptyProfile: Profile = {
    prefix: '', firstName: '', middleName: '', lastName: '', suffix: '', preferredName: '',
    accreditations: '', fullName: '', title: '', department: '', organization: '',
    companyLogoUrl: '', coverPhotoUrl: '', email: '', phone: '', photoUrl: '', website: '',
    social: {
      linkedin: '', x: '', instagram: '', facebook: '', github: '', portfolio: '',
      whatsapp: '', youtube: '', tiktok: '',
    },
    tagline: '', businessAddress: '', shortBio: '',
  };

  it('prefills a card field from the account profile', () => {
    const profile = {
      ...emptyProfile,
      email: 'person@example.com',
      social: { ...emptyProfile.social, linkedin: 'https://linkedin.com/in/person' },
    };
    expect(profileValueForConnection(profile, { id: 'email', title: 'Email' })).toBe('person@example.com');
    expect(profileValueForConnection(profile, { id: 'linkedin', title: 'LinkedIn' })).toBe(
      'https://linkedin.com/in/person',
    );
  });

  it('copies recognized card values back to the user profile', () => {
    const next = profileWithConnectionFields(emptyProfile, [
      { id: 'phone', title: 'Phone', type: 'phone', value: '+1 555 123 4567' },
      { id: 'linkedin', title: 'LinkedIn', type: 'url', value: 'https://linkedin.com/in/person' },
    ]);
    expect(next.phone).toBe('+1 555 123 4567');
    expect(next.social.linkedin).toBe('https://linkedin.com/in/person');
  });

  it('recovers a reusable value from an older card when the profile is empty', () => {
    const olderCard = {
      id: 'older-card',
      email: '',
      phone: '',
      connectionFields: [
        { id: 'linkedin', title: 'LinkedIn', type: 'url', value: 'https://linkedin.com/in/person' },
      ],
    } as BusinessCard;
    expect(reusableConnectionValue(
      emptyProfile,
      [olderCard],
      'new-card',
      { id: 'linkedin', title: 'LinkedIn' },
    )).toBe('https://linkedin.com/in/person');
  });

  it('reports populated and social field counts', () => {
    expect(connectionCounts([
      { id: 'email', title: 'Email', type: 'email', value: 'person@example.com' },
      { id: 'linkedin', title: 'LinkedIn', type: 'url', value: 'https://linkedin.com/in/person' },
      { id: 'github', title: 'GitHub', type: 'url', value: '' },
    ])).toEqual({ total: 2, social: 1 });
  });
});
