// components/onboardingComponents/Utils/onboardingChallenger.test.ts
import {
  validatePersonalStep,
  validateProfessionalStep,
  validateSocialStep,
  validateAllSteps,
  normalizeUrl,
} from './validateOnboarding';
import {
  mapDraftToProfile,
  mapDraftToBusinessCard,
  mapProfileToDraft,
} from './onboardingMappers';
import {
  INITIAL_ONBOARDING_DRAFT,
  OnboardingDraft,
} from '../types/onboardingStepper.types';
import type { Profile } from '@/components/profileComponents/types/profile.types';
import type { BusinessCard } from '@/components/cardsComponents/types/card.types';

export interface AdversarialTestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
}

export function runAdversarialTests(): {
  total: number;
  passed: number;
  failed: number;
  results: AdversarialTestResult[];
} {
  const results: AdversarialTestResult[] = [];

  function record(suite: string, name: string, passed: boolean, error?: string) {
    results.push({ suite, name, passed, error });
  }

  const validIdentity = { firstName: 'Ada', lastName: 'Lovelace', title: 'Engineer' };

  // =========================================================================
  // SUITE 1: Validation — Identity (Step 2)
  // =========================================================================
  const s1 = 'Validation: Step 2 Identity';
  record(s1, 'empty_firstName_rejected', Boolean(validatePersonalStep({ firstName: '', lastName: 'L', title: 'E' }).firstName));
  record(s1, 'empty_lastName_rejected', Boolean(validatePersonalStep({ firstName: 'A', lastName: '', title: 'E' }).lastName));
  record(s1, 'empty_title_rejected', Boolean(validatePersonalStep({ firstName: 'A', lastName: 'L', title: '' }).title));
  record(s1, 'valid_identity_accepted', Object.keys(validatePersonalStep(validIdentity)).length === 0);
  record(s1, 'firstName_50_chars_accepted', !validatePersonalStep({ ...validIdentity, firstName: 'A'.repeat(50) }).firstName);
  record(s1, 'firstName_51_chars_rejected', Boolean(validatePersonalStep({ ...validIdentity, firstName: 'A'.repeat(51) }).firstName));
  record(s1, 'chinese_name_accepted', !validatePersonalStep({ firstName: '李', lastName: '雷', title: '工程师' }).firstName);
  record(s1, 'accented_name_accepted', !validatePersonalStep({ firstName: 'José', lastName: 'González', title: 'Lead' }).firstName);
  record(s1, 'title_80_chars_accepted', !validatePersonalStep({ ...validIdentity, title: 'T'.repeat(80) }).title);
  record(s1, 'title_81_chars_rejected', Boolean(validatePersonalStep({ ...validIdentity, title: 'T'.repeat(81) }).title));
  record(s1, 'tagline_120_chars_accepted', !validatePersonalStep({ ...validIdentity, tagline: 'T'.repeat(120) }).tagline);
  record(s1, 'tagline_121_chars_rejected', Boolean(validatePersonalStep({ ...validIdentity, tagline: 'T'.repeat(121) }).tagline));

  // =========================================================================
  // SUITE 2: Validation — Contact (Step 3)
  // =========================================================================
  const s2 = 'Validation: Step 3 Contact';
  record(s2, 'empty_email_rejected', Boolean(validateProfessionalStep({ organization: '', email: '', phone: '' }).email));
  record(s2, 'whitespace_email_rejected', Boolean(validateProfessionalStep({ organization: '', email: '   ', phone: '' }).email));
  record(s2, 'standard_email_accepted', !validateProfessionalStep({ organization: '', email: 'user@example.com', phone: '' }).email);
  record(s2, 'email_with_spaces_trimmed_accepted', !validateProfessionalStep({ organization: '', email: '  user@example.com  ', phone: '' }).email);
  record(s2, 'email_with_plus_tag_accepted', !validateProfessionalStep({ organization: '', email: 'user+tag@example.co.uk', phone: '' }).email);
  record(s2, 'email_subdomain_accepted', !validateProfessionalStep({ organization: '', email: 'user@eng.corp.example.org', phone: '' }).email);
  record(s2, 'email_missing_at_rejected', Boolean(validateProfessionalStep({ organization: '', email: 'userexample.com', phone: '' }).email));
  record(s2, 'email_missing_username_rejected', Boolean(validateProfessionalStep({ organization: '', email: '@example.com', phone: '' }).email));
  record(s2, 'email_missing_domain_rejected', Boolean(validateProfessionalStep({ organization: '', email: 'user@', phone: '' }).email));
  record(s2, 'email_missing_tld_dot_rejected', Boolean(validateProfessionalStep({ organization: '', email: 'user@localhost', phone: '' }).email));
  record(s2, 'email_double_at_rejected', Boolean(validateProfessionalStep({ organization: '', email: 'user@@domain.com', phone: '' }).email));
  record(s2, 'email_embedded_space_rejected', Boolean(validateProfessionalStep({ organization: '', email: 'user name@domain.com', phone: '' }).email));
  record(s2, 'organization_100_chars_accepted', !validateProfessionalStep({ organization: 'O'.repeat(100), email: 'a@b.com', phone: '' }).organization);
  record(s2, 'organization_101_chars_rejected', Boolean(validateProfessionalStep({ organization: 'O'.repeat(101), email: 'a@b.com', phone: '' }).organization));
  record(s2, 'shortBio_240_chars_accepted', !validateProfessionalStep({ organization: '', email: 'a@b.com', phone: '', shortBio: 'B'.repeat(240) }).shortBio);
  record(s2, 'shortBio_241_chars_rejected', Boolean(validateProfessionalStep({ organization: '', email: 'a@b.com', phone: '', shortBio: 'B'.repeat(241) }).shortBio));
  record(s2, 'phone_us_formatted_accepted', !validateProfessionalStep({ organization: '', email: 'a@b.com', phone: '+1 (555) 123-4567' }).phone);
  record(s2, 'phone_7digits_accepted', !validateProfessionalStep({ organization: '', email: 'a@b.com', phone: '5551234' }).phone);
  record(s2, 'phone_6digits_rejected', Boolean(validateProfessionalStep({ organization: '', email: 'a@b.com', phone: '555123' }).phone));
  record(s2, 'phone_empty_accepted_since_optional', !validateProfessionalStep({ organization: '', email: 'a@b.com', phone: '' }).phone);
  record(s2, 'businessAddress_100_chars_accepted', !validateProfessionalStep({ organization: '', email: 'a@b.com', phone: '', businessAddress: 'L'.repeat(100) }).businessAddress);
  record(s2, 'businessAddress_101_chars_rejected', Boolean(validateProfessionalStep({ organization: '', email: 'a@b.com', phone: '', businessAddress: 'L'.repeat(101) }).businessAddress));
  record(s2, 'invalid_website_rejected', Boolean(validateProfessionalStep({ organization: '', email: 'a@b.com', phone: '', website: 'not a url' }).website));

  // =========================================================================
  // SUITE 3: Validation — Presence (Step 4)
  // =========================================================================
  const s3 = 'Validation: Step 4 Presence';
  record(s3, 'all_empty_social_fields_accepted', Object.keys(validateSocialStep({})).length === 0);
  record(s3, 'valid_handle_accepted', !validateSocialStep({ github: 'octocat' }).github);
  record(s3, 'valid_at_handle_accepted', !validateSocialStep({ x: '@sampath' }).x);
  record(s3, 'valid_linkedin_url_accepted', !validateSocialStep({ linkedin: 'https://linkedin.com/in/ada' }).linkedin);
  record(s3, 'invalid_portfolio_rejected', Boolean(validateSocialStep({ portfolio: 'not_a_url' }).portfolio));

  const maliciousPayloads = [
    { label: 'javascript_protocol', payload: 'javascript:alert(1)' },
    { label: 'data_uri', payload: 'data:text/html,<script>alert(1)</script>' },
  ];
  for (const { label, payload } of maliciousPayloads) {
    record(s3, `malicious_${label}_rejected_on_portfolio`, Boolean(validateSocialStep({ portfolio: payload }).portfolio));
  }

  // =========================================================================
  // SUITE 5: URL normalization
  // =========================================================================
  const s5 = 'URL Normalization';
  record(s5, 'empty_string_returns_empty', normalizeUrl('') === '');
  record(s5, 'whitespace_returns_empty', normalizeUrl('   ') === '');
  record(s5, 'bare_domain_gets_https', normalizeUrl('example.com') === 'https://example.com');
  record(s5, 'github_handle', normalizeUrl('torvalds', 'github') === 'https://github.com/torvalds');
  record(s5, 'x_handle', normalizeUrl('@sampath', 'x') === 'https://x.com/sampath');
  record(s5, 'linkedin_handle', normalizeUrl('ada.lovelace', 'linkedin') === 'https://linkedin.com/in/ada.lovelace');

  // =========================================================================
  // SUITE 6: Mapper round-trips
  // =========================================================================
  const s6 = 'Data Mapper Round-Trips';

  const fullDraft: OnboardingDraft = {
    ...INITIAL_ONBOARDING_DRAFT,
    firstName: 'Ada',
    lastName: 'Lovelace',
    fullName: 'Ada Lovelace',
    title: 'Lead Computing Architect',
    phone: '+1 (555) 234-5678',
    businessAddress: 'London, UK',
    organization: 'Analytical Engine Corp',
    email: 'ada@analytical.org',
    shortBio: 'Pioneering computer algorithms.',
    linkedin: 'https://linkedin.com/in/adalovelace',
    github: 'https://github.com/adalovelace',
    x: 'https://x.com/adalovelace',
    website: 'https://adalovelace.org',
    portfolio: 'https://adalovelace.org/work',
    cardGradient: ['#2563eb', '#00a8e8'],
    cardCategory: 'Professional',
  };

  const p1 = mapDraftToProfile(fullDraft);
  const c1 = mapDraftToBusinessCard(fullDraft);
  const recDraft1 = mapProfileToDraft(p1, c1);
  const fullEqual = JSON.stringify(fullDraft) === JSON.stringify(recDraft1);
  record(
    s6,
    'complete_draft_round_trip_lossless',
    fullEqual,
    fullEqual ? undefined : 'Complete draft lost data during Profile+Card round-trip'
  );

  const p2 = mapDraftToProfile(recDraft1);
  const c2 = mapDraftToBusinessCard(recDraft1);
  record(s6, 'profile_mapping_idempotent', JSON.stringify(p1) === JSON.stringify(p2));
  record(s6, 'card_mapping_idempotent', JSON.stringify(c1) === JSON.stringify(c2));

  const existingProfile: Partial<Profile> = {
    companyLogoUrl: 'https://example.com/logo.png',
    photoUrl: 'https://example.com/avatar.png',
    tagline: 'Custom Tagline',
    social: {
      linkedin: '',
      x: '',
      github: '',
      portfolio: '',
      instagram: 'https://instagram.com/adalovelace',
      facebook: '',
      whatsapp: '',
      youtube: '',
      tiktok: '',
    },
  };
  const mergedProfile = mapDraftToProfile(fullDraft, existingProfile);
  record(s6, 'preserves_existing_companyLogoUrl', mergedProfile.companyLogoUrl === 'https://example.com/logo.png');
  record(s6, 'preserves_existing_photoUrl', mergedProfile.photoUrl === 'https://example.com/avatar.png');
  record(s6, 'preserves_existing_tagline', mergedProfile.tagline === 'Custom Tagline');
  record(s6, 'preserves_existing_instagram', mergedProfile.social.instagram === 'https://instagram.com/adalovelace');

  const existingCard: Partial<BusinessCard> = {
    id: 'card-99',
    category: 'Special',
    gradient: ['#111', '#222'],
  };
  const mergedCard = mapDraftToBusinessCard(fullDraft, existingCard);
  record(s6, 'preserves_existing_card_id', mergedCard.id === 'card-99');

  const emptyOptDraft: OnboardingDraft = {
    ...INITIAL_ONBOARDING_DRAFT,
    firstName: 'Jane',
    lastName: 'Doe',
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    title: '',
    organization: '',
  };
  const emptyProfile = mapDraftToProfile(emptyOptDraft);
  const emptyCard = mapDraftToBusinessCard(emptyOptDraft);
  const recEmptyDraft = mapProfileToDraft(emptyProfile, emptyCard);

  record(s6, 'empty_title_preserved_without_fallback_mutation', recEmptyDraft.title === '');
  record(s6, 'empty_org_preserved_without_fallback_mutation', recEmptyDraft.organization === '');

  // =========================================================================
  // SUITE 7: Sequential step guards
  // =========================================================================
  const s7 = 'Step Validation Flow';
  const a1 = validateAllSteps(INITIAL_ONBOARDING_DRAFT);
  record(s7, 'all_steps_empty_draft_stops_at_step_2', a1.isValid === false && a1.firstErrorStep === 2 && Boolean(a1.errors.firstName));

  const a2 = validateAllSteps({
    ...INITIAL_ONBOARDING_DRAFT,
    firstName: 'John',
    lastName: 'Doe',
    title: 'Engineer',
  });
  record(s7, 'all_steps_step2_filled_stops_at_step_3', a2.isValid === false && a2.firstErrorStep === 3 && Boolean(a2.errors.email));

  const a3 = validateAllSteps({
    ...INITIAL_ONBOARDING_DRAFT,
    firstName: 'John',
    lastName: 'Doe',
    title: 'Engineer',
    email: 'john@doe.com',
    portfolio: 'invalid site with space',
  });
  record(s7, 'all_steps_step3_filled_stops_at_step_4', a3.isValid === false && a3.firstErrorStep === 4 && Boolean(a3.errors.portfolio));

  const a4 = validateAllSteps({
    ...INITIAL_ONBOARDING_DRAFT,
    firstName: 'John',
    lastName: 'Doe',
    title: 'Engineer',
    email: 'john@doe.com',
    cardCategory: '',
  });
  record(s7, 'all_steps_step4_filled_stops_at_step_5', a4.isValid === false && a4.firstErrorStep === 5 && Boolean(a4.errors.cardCategory));

  const a5 = validateAllSteps({
    ...INITIAL_ONBOARDING_DRAFT,
    firstName: 'John',
    lastName: 'Doe',
    title: 'Engineer',
    email: 'john@doe.com',
  });
  record(s7, 'all_steps_minimal_required_succeeds', a5.isValid === true && a5.firstErrorStep === null && Object.keys(a5.errors).length === 0);

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  return { total, passed, failed, results };
}
