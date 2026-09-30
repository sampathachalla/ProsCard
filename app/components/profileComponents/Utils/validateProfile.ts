import type { Profile } from '../types/profile.types';
import { isMediaReference } from '../Services/pendingMedia';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WEBSITE_PATTERN = /^https?:\/\/.+/i;

export type ProfileValidationSection = 'all' | 'identity' | 'professional' | 'contact' | 'bio' | 'media' | 'social';

export function validateProfile(profile: Profile, section: ProfileValidationSection = 'all'): string | null {
  if (section === 'all' || section === 'identity') {
    if (!profile.firstName.trim() && !profile.fullName.trim()) return 'First name is required.';
    if (profile.firstName.trim() && !profile.lastName.trim()) return 'Last name is required.';
  }

  if (section === 'all' || section === 'contact') {
    if (profile.email.trim() && !EMAIL_PATTERN.test(profile.email.trim())) {
      return 'Enter a valid email address.';
    }
    if (profile.website.trim() && !WEBSITE_PATTERN.test(profile.website.trim())) {
      return 'Website must start with http:// or https://.';
    }
  }

  if (section === 'all' || section === 'media') {
    const mediaFields = [
      ['Profile photo', profile.photoUrl],
      ['Cover photo', profile.coverPhotoUrl],
      ['Company logo', profile.companyLogoUrl],
    ] as const;
    const invalid = mediaFields.find(([, value]) => {
      const trimmed = value.trim();
      return trimmed && !WEBSITE_PATTERN.test(trimmed) && !isMediaReference(trimmed);
    });
    if (invalid) return `${invalid[0]} could not be prepared for upload. Select the image again.`;
  }

  return null;
}
