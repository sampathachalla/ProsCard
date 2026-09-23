// components/profileComponents/types/profile.types.ts
export type StoredUser = {
  id: string;
  username: string;
};

export type SocialLinks = {
  linkedin: string;
  x: string;
  instagram: string;
  facebook: string;
  github?: string;
  portfolio?: string;
  whatsapp: string;
  youtube: string;
  tiktok: string;
};

export type Profile = {
  prefix: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  preferredName: string;
  accreditations: string;
  fullName: string;
  title: string;
  department: string;
  organization: string;
  companyLogoUrl: string;
  coverPhotoUrl: string;
  email: string;
  phone: string;
  photoUrl: string;
  website: string;
  social: SocialLinks;
  tagline: string;
  businessAddress: string;
  shortBio: string;
};

export type ProfileFieldKey = keyof Omit<Profile, 'social'>;
export type SocialFieldKey = keyof SocialLinks;
