import type { Profile } from '../types/profile.types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WEBSITE_PATTERN = /^https?:\/\/.+/i;

export function validateProfile(profile: Profile): string | null {
  if (!profile.firstName.trim() && !profile.fullName.trim()) return 'First name is required.';
  if (profile.firstName.trim() && !profile.lastName.trim()) return 'Last name is required.';
  if (profile.email.trim() && !EMAIL_PATTERN.test(profile.email.trim())) {
    return 'Enter a valid email address.';
  }
  if (profile.website.trim() && !WEBSITE_PATTERN.test(profile.website.trim())) {
    return 'Website must start with http:// or https://.';
  }
  const mediaUrls = [profile.photoUrl, profile.coverPhotoUrl, profile.companyLogoUrl];
  if (mediaUrls.some((url) => url.trim() && !WEBSITE_PATTERN.test(url.trim()))) {
    return 'Photo, cover, and logo URLs must start with http:// or https://.';
  }
  return null;
}
