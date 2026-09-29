// components/onboardingComponents/Utils/onboardingMappers.ts
import { Colors } from '@/constants/Colors';
import type { Profile } from '@/components/profileComponents/types/profile.types';
import type { BusinessCard } from '@/components/cardsComponents/types/card.types';
import {
  createDefaultCardSectionThemes,
  DEFAULT_CARD_SECTION_LAYOUTS,
  DEFAULT_CARD_THEME,
} from '@/components/cardsComponents/types/card.types';
import type { OnboardingDraft } from '../types/onboardingStepper.types';
import { INITIAL_ONBOARDING_DRAFT } from '../types/onboardingStepper.types';
import { normalizeUrl } from './validateOnboarding';

export function buildFullName(
  draft: Pick<
    OnboardingDraft,
    'prefix' | 'firstName' | 'middleName' | 'lastName' | 'suffix' | 'fullName'
  >
): string {
  const structuredName = [draft.prefix, draft.firstName, draft.middleName, draft.lastName, draft.suffix]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' ');
  return structuredName || draft.fullName.trim();
}

function normalizeMediaUri(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (
    trimmed.startsWith('file:') ||
    trimmed.startsWith('content:') ||
    trimmed.startsWith('ph://') ||
    trimmed.startsWith('assets-library:') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }
  return normalizeUrl(trimmed, 'generic');
}

export function mapDraftToProfile(
  draft: OnboardingDraft,
  existingProfile?: Partial<Profile>
): Profile {
  const fullName = buildFullName(draft);
  return {
    prefix: draft.prefix.trim(),
    firstName: draft.firstName.trim(),
    middleName: draft.middleName.trim(),
    lastName: draft.lastName.trim(),
    suffix: draft.suffix.trim(),
    preferredName: draft.preferredName.trim(),
    accreditations: draft.accreditations.trim(),
    fullName,
    title: (draft.title ?? '').trim(),
    department: draft.department.trim(),
    organization: (draft.organization ?? '').trim(),
    companyLogoUrl:
      normalizeMediaUri(draft.companyLogoUrl) || existingProfile?.companyLogoUrl || '',
    email: (draft.email ?? '').trim(),
    phone: (draft.phone ?? '').trim(),
    photoUrl: normalizeMediaUri(draft.photoUrl) || existingProfile?.photoUrl || '',
    coverPhotoUrl:
      normalizeMediaUri(draft.coverPhotoUrl) || existingProfile?.coverPhotoUrl || '',
    website: normalizeUrl(draft.website ?? '', 'generic'),
    social: {
      linkedin: normalizeUrl(draft.linkedin ?? '', 'linkedin'),
      github: normalizeUrl(draft.github ?? '', 'github'),
      x: normalizeUrl(draft.x ?? '', 'x'),
      portfolio: normalizeUrl(draft.portfolio ?? '', 'generic'),
      instagram:
        normalizeUrl(draft.instagram, 'generic') || existingProfile?.social?.instagram || '',
      facebook:
        normalizeUrl(draft.facebook, 'generic') || existingProfile?.social?.facebook || '',
      whatsapp:
        normalizeUrl(draft.whatsapp, 'generic') || existingProfile?.social?.whatsapp || '',
      youtube: normalizeUrl(draft.youtube, 'generic') || existingProfile?.social?.youtube || '',
      tiktok: normalizeUrl(draft.tiktok, 'generic') || existingProfile?.social?.tiktok || '',
    },
    tagline: draft.tagline.trim() || existingProfile?.tagline || '',
    businessAddress: (draft.businessAddress ?? '').trim(),
    shortBio: (draft.shortBio ?? '').trim(),
  };
}

export function mapDraftToBusinessCard(
  draft: OnboardingDraft,
  existingCard?: Partial<BusinessCard>
): BusinessCard {
  const cardTheme = existingCard?.cardTheme ?? {
    ...DEFAULT_CARD_THEME,
    gradient: draft.cardGradient,
  };
  return {
    id: existingCard?.id || '1',
    category: (draft.cardCategory ?? '').trim() || existingCard?.category || 'Professional',
    name: draft.preferredName.trim() || buildFullName(draft) || 'ProsCard Member',
    title: (draft.title ?? '').trim() || 'Professional',
    company: (draft.organization ?? '').trim() || 'Independent',
    phone: (draft.phone ?? '').trim(),
    email: (draft.email ?? '').trim(),
    gradient:
      draft.cardGradient && draft.cardGradient.length === 2
        ? draft.cardGradient
        : existingCard?.gradient || [Colors.light.tint, Colors.palette.brandCyan],
    sectionLayouts: {
      ...DEFAULT_CARD_SECTION_LAYOUTS,
      ...(existingCard?.sectionLayouts ?? {}),
    },
    sectionOverrides: existingCard?.sectionOverrides ?? {},
    connectionFields: existingCard?.connectionFields ?? [],
    connectionFieldsCustomized: existingCard?.connectionFieldsCustomized ?? false,
    cardTheme,
    sectionThemes: existingCard?.sectionThemes ?? createDefaultCardSectionThemes(cardTheme),
  };
}

export function mapProfileToDraft(
  profile?: Partial<Profile>,
  card?: Partial<BusinessCard>
): OnboardingDraft {
  const legacyNameParts = (profile?.fullName ?? card?.name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const fallbackFirstName = legacyNameParts.length > 0 ? legacyNameParts[0] : '';
  const fallbackLastName = legacyNameParts.length > 1 ? legacyNameParts.slice(1).join(' ') : '';

  return {
    prefix: profile?.prefix ?? INITIAL_ONBOARDING_DRAFT.prefix,
    firstName: profile?.firstName ?? fallbackFirstName ?? INITIAL_ONBOARDING_DRAFT.firstName,
    middleName: profile?.middleName ?? INITIAL_ONBOARDING_DRAFT.middleName,
    lastName: profile?.lastName ?? fallbackLastName ?? INITIAL_ONBOARDING_DRAFT.lastName,
    suffix: profile?.suffix ?? INITIAL_ONBOARDING_DRAFT.suffix,
    preferredName: profile?.preferredName ?? INITIAL_ONBOARDING_DRAFT.preferredName,
    accreditations: profile?.accreditations ?? INITIAL_ONBOARDING_DRAFT.accreditations,
    fullName: profile?.fullName ?? card?.name ?? INITIAL_ONBOARDING_DRAFT.fullName,
    tagline: profile?.tagline ?? INITIAL_ONBOARDING_DRAFT.tagline,
    title: profile?.title ?? card?.title ?? INITIAL_ONBOARDING_DRAFT.title,
    department: profile?.department ?? INITIAL_ONBOARDING_DRAFT.department,
    organization: profile?.organization ?? card?.company ?? INITIAL_ONBOARDING_DRAFT.organization,
    companyLogoUrl: profile?.companyLogoUrl ?? INITIAL_ONBOARDING_DRAFT.companyLogoUrl,
    email: profile?.email ?? card?.email ?? INITIAL_ONBOARDING_DRAFT.email,
    phone: profile?.phone ?? card?.phone ?? INITIAL_ONBOARDING_DRAFT.phone,
    website: profile?.website ?? INITIAL_ONBOARDING_DRAFT.website,
    businessAddress: profile?.businessAddress ?? INITIAL_ONBOARDING_DRAFT.businessAddress,
    shortBio: profile?.shortBio ?? INITIAL_ONBOARDING_DRAFT.shortBio,
    photoUrl: profile?.photoUrl ?? INITIAL_ONBOARDING_DRAFT.photoUrl,
    coverPhotoUrl: profile?.coverPhotoUrl ?? INITIAL_ONBOARDING_DRAFT.coverPhotoUrl,
    linkedin: profile?.social?.linkedin ?? INITIAL_ONBOARDING_DRAFT.linkedin,
    github: profile?.social?.github ?? INITIAL_ONBOARDING_DRAFT.github,
    x: profile?.social?.x ?? INITIAL_ONBOARDING_DRAFT.x,
    facebook: profile?.social?.facebook ?? INITIAL_ONBOARDING_DRAFT.facebook,
    instagram: profile?.social?.instagram ?? INITIAL_ONBOARDING_DRAFT.instagram,
    whatsapp: profile?.social?.whatsapp ?? INITIAL_ONBOARDING_DRAFT.whatsapp,
    youtube: profile?.social?.youtube ?? INITIAL_ONBOARDING_DRAFT.youtube,
    tiktok: profile?.social?.tiktok ?? INITIAL_ONBOARDING_DRAFT.tiktok,
    portfolio: profile?.social?.portfolio ?? INITIAL_ONBOARDING_DRAFT.portfolio,
    cardGradient: card?.gradient ?? INITIAL_ONBOARDING_DRAFT.cardGradient,
    cardCategory: card?.category ?? INITIAL_ONBOARDING_DRAFT.cardCategory,
  };
}
