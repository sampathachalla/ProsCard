import type { ProfileMediaKind, UserMediaLibraryItem } from '@/services/api/types';

export function groupUserMediaByKind(items: UserMediaLibraryItem[]): Record<ProfileMediaKind, UserMediaLibraryItem[]> {
  return {
    coverPhoto: items.filter((item) => item.kind === 'coverPhoto'),
    profilePhoto: items.filter((item) => item.kind === 'profilePhoto'),
    companyLogo: items.filter((item) => item.kind === 'companyLogo'),
  };
}
