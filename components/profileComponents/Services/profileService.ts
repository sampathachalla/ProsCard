// components/profileComponents/Services/profileService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Profile, StoredUser } from '../types/profile.types';

const PROFILE_STORAGE_KEY = 'userProfile';

export const DEFAULT_PROFILE: Profile = {
  prefix: 'Dr.',
  firstName: 'Sampath',
  middleName: 'Kumar',
  lastName: 'Kambhampati',
  suffix: 'PhD',
  preferredName: 'Sampath Kambhampati',
  accreditations: 'MBA, AWS Certified Architect, PMP',
  fullName: 'Dr. Sampath Kumar Kambhampati PhD',
  title: 'Founder & CEO',
  department: 'Executive Leadership',
  organization: 'MindPros Technologies',
  companyLogoUrl: '',
  coverPhotoUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80',
  email: 'sampath@proscard.app',
  phone: '+1 (555) 010-2030',
  photoUrl: 'https://i.pravatar.cc/600?img=12',
  website: 'https://proscard.app',
  social: {
    linkedin: 'https://linkedin.com/in/sampath',
    x: 'https://x.com/sampath',
    instagram: 'https://instagram.com/sampath',
    facebook: 'https://facebook.com/sampath',
    github: 'https://github.com/sampath',
    portfolio: 'https://sampath.dev',
    whatsapp: '+15550102030',
    youtube: 'https://youtube.com/@sampath',
    tiktok: 'https://tiktok.com/@sampath',
  },
  tagline: 'Building next-generation digital networking tools for visionary professionals worldwide.',
  businessAddress: '500 Howard St, Suite 400, San Francisco, CA 94105',
  shortBio:
    'Founder and product builder focused on creating thoughtful digital experiences that help professionals connect, share their work, and build meaningful relationships across global ecosystems.',
};

export async function getStoredUser(): Promise<StoredUser | null> {
  const raw = await AsyncStorage.getItem('userInfo');
  return raw ? (JSON.parse(raw) as StoredUser) : null;
}

export async function logoutUser(): Promise<void> {
  await AsyncStorage.removeItem('userInfo');
}

export async function getProfile(): Promise<Profile> {
  const raw = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) return DEFAULT_PROFILE;
  const parsed = JSON.parse(raw) as Partial<Profile>;
  const legacyNameParts = (parsed.fullName ?? '').trim().split(/\s+/).filter(Boolean);
  return {
    ...DEFAULT_PROFILE,
    ...parsed,
    firstName: parsed.firstName || legacyNameParts[0] || DEFAULT_PROFILE.firstName,
    lastName: parsed.lastName || (legacyNameParts.length > 1 ? legacyNameParts.slice(1).join(' ') : DEFAULT_PROFILE.lastName),
    social: {
      ...DEFAULT_PROFILE.social,
      ...(parsed.social ?? {}),
    },
  };
}

export function saveProfile(profile: Profile): Promise<Profile> {
  return AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile)).then(() => profile);
}
