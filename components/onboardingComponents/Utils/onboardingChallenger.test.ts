// components/onboardingComponents/Utils/onboardingChallenger.test.ts
import {
  validatePersonalStep,
  validateProfessionalStep,
  validateSocialStep,
  validateCustomizationStep,
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

  // =========================================================================
  // SUITE 1: Validation Corner Cases - Personal Step (Step 2)
  // =========================================================================
  const s1 = 'Validation: Step 2 Personal';
  record(s1, 'empty_fullName_rejected', Boolean(validatePersonalStep({ fullName: '', title: '', phone: '', location: '' }).fullName));
  record(s1, 'whitespace_fullName_rejected', Boolean(validatePersonalStep({ fullName: '     ', title: '', phone: '', location: '' }).fullName));
  record(s1, 'single_char_name_rejected', Boolean(validatePersonalStep({ fullName: 'A', title: '', phone: '', location: '' }).fullName));
  record(s1, 'two_char_name_accepted', !validatePersonalStep({ fullName: 'Al', title: '', phone: '', location: '' }).fullName);
  record(s1, '50_char_name_accepted', !validatePersonalStep({ fullName: 'A'.repeat(50), title: '', phone: '', location: '' }).fullName);
  record(s1, '51_char_name_rejected', Boolean(validatePersonalStep({ fullName: 'A'.repeat(51), title: '', phone: '', location: '' }).fullName));
  record(s1, 'chinese_2char_name_accepted', !validatePersonalStep({ fullName: '李雷', title: '', phone: '', location: '' }).fullName);
  record(s1, 'accented_name_accepted', !validatePersonalStep({ fullName: 'José González', title: '', phone: '', location: '' }).fullName);
  record(s1, 'arabic_name_accepted', !validatePersonalStep({ fullName: 'طارق حسام', title: '', phone: '', location: '' }).fullName);
  record(s1, 'emoji_name_accepted', !validatePersonalStep({ fullName: '👩‍💻 Tech Lead', title: '', phone: '', location: '' }).fullName);
  record(s1, 'title_80_chars_accepted', !validatePersonalStep({ fullName: 'Valid Name', title: 'T'.repeat(80), phone: '', location: '' }).title);
  record(s1, 'title_81_chars_rejected', Boolean(validatePersonalStep({ fullName: 'Valid Name', title: 'T'.repeat(81), phone: '', location: '' }).title));
  record(s1, 'location_100_chars_accepted', !validatePersonalStep({ fullName: 'Valid Name', title: '', phone: '', location: 'L'.repeat(100) }).location);
  record(s1, 'location_101_chars_rejected', Boolean(validatePersonalStep({ fullName: 'Valid Name', title: '', phone: '', location: 'L'.repeat(101) }).location));
  record(s1, 'phone_us_formatted_accepted', !validatePersonalStep({ fullName: 'Valid Name', title: '', phone: '+1 (555) 123-4567', location: '' }).phone);
  record(s1, 'phone_7digits_accepted', !validatePersonalStep({ fullName: 'Valid Name', title: '', phone: '5551234', location: '' }).phone);
  record(s1, 'phone_dots_accepted', !validatePersonalStep({ fullName: 'Valid Name', title: '', phone: '555.123.4567', location: '' }).phone);
  record(s1, 'phone_6digits_rejected', Boolean(validatePersonalStep({ fullName: 'Valid Name', title: '', phone: '555123', location: '' }).phone));
  record(s1, 'phone_21chars_rejected', Boolean(validatePersonalStep({ fullName: 'Valid Name', title: '', phone: '123456789012345678901', location: '' }).phone));
  record(s1, 'phone_with_letters_rejected', Boolean(validatePersonalStep({ fullName: 'Valid Name', title: '', phone: '123-456-789a', location: '' }).phone));
  record(s1, 'phone_empty_accepted_since_optional', !validatePersonalStep({ fullName: 'Valid Name', title: '', phone: '', location: '' }).phone);
  record(s1, 'phone_whitespace_accepted_since_optional', !validatePersonalStep({ fullName: 'Valid Name', title: '', phone: '   ', location: '' }).phone);

  // =========================================================================
  // SUITE 2: Validation Corner Cases - Professional Step (Step 3)
  // =========================================================================
  const s2 = 'Validation: Step 3 Professional';
  record(s2, 'empty_workEmail_rejected', Boolean(validateProfessionalStep({ organization: '', workEmail: '', shortBio: '' }).workEmail));
  record(s2, 'whitespace_workEmail_rejected', Boolean(validateProfessionalStep({ organization: '', workEmail: '   ', shortBio: '' }).workEmail));
  record(s2, 'standard_email_accepted', !validateProfessionalStep({ organization: '', workEmail: 'user@example.com', shortBio: '' }).workEmail);
  record(s2, 'email_with_spaces_trimmed_accepted', !validateProfessionalStep({ organization: '', workEmail: '  user@example.com  ', shortBio: '' }).workEmail);
  record(s2, 'email_with_plus_tag_accepted', !validateProfessionalStep({ organization: '', workEmail: 'user+tag@example.co.uk', shortBio: '' }).workEmail);
  record(s2, 'email_subdomain_accepted', !validateProfessionalStep({ organization: '', workEmail: 'user@eng.corp.example.org', shortBio: '' }).workEmail);
  record(s2, 'email_missing_at_rejected', Boolean(validateProfessionalStep({ organization: '', workEmail: 'userexample.com', shortBio: '' }).workEmail));
  record(s2, 'email_missing_username_rejected', Boolean(validateProfessionalStep({ organization: '', workEmail: '@example.com', shortBio: '' }).workEmail));
  record(s2, 'email_missing_domain_rejected', Boolean(validateProfessionalStep({ organization: '', workEmail: 'user@', shortBio: '' }).workEmail));
  record(s2, 'email_missing_tld_dot_rejected', Boolean(validateProfessionalStep({ organization: '', workEmail: 'user@localhost', shortBio: '' }).workEmail));
  record(s2, 'email_double_at_rejected', Boolean(validateProfessionalStep({ organization: '', workEmail: 'user@@domain.com', shortBio: '' }).workEmail));
  record(s2, 'email_embedded_space_rejected', Boolean(validateProfessionalStep({ organization: '', workEmail: 'user name@domain.com', shortBio: '' }).workEmail));
  record(s2, 'organization_100_chars_accepted', !validateProfessionalStep({ organization: 'O'.repeat(100), workEmail: 'a@b.com', shortBio: '' }).organization);
  record(s2, 'organization_101_chars_rejected', Boolean(validateProfessionalStep({ organization: 'O'.repeat(101), workEmail: 'a@b.com', shortBio: '' }).organization));
  record(s2, 'shortBio_500_chars_accepted', !validateProfessionalStep({ organization: '', workEmail: 'a@b.com', shortBio: 'B'.repeat(500) }).shortBio);
  record(s2, 'shortBio_501_chars_rejected', Boolean(validateProfessionalStep({ organization: '', workEmail: 'a@b.com', shortBio: 'B'.repeat(501) }).shortBio));

  // =========================================================================
  // SUITE 3: Validation Corner Cases - Social Step (Step 4) & Injection
  // =========================================================================
  const s3 = 'Validation: Step 4 Social & Injection';
  record(s3, 'all_empty_social_fields_accepted', Object.keys(validateSocialStep({ linkedin: '', github: '', x: '', website: '', portfolio: '' })).length === 0);
  record(s3, 'valid_https_url_accepted', !validateSocialStep({ linkedin: '', github: '', x: '', website: 'https://mysite.com', portfolio: '' }).website);
  record(s3, 'valid_bare_domain_accepted', !validateSocialStep({ linkedin: '', github: '', x: '', website: 'mysite.com', portfolio: '' }).website);
  record(s3, 'valid_handle_accepted', !validateSocialStep({ linkedin: '', github: 'octocat', x: '', website: '', portfolio: '' }).github);
  record(s3, 'valid_at_handle_accepted', !validateSocialStep({ linkedin: '', github: '', x: '@sampath', website: '', portfolio: '' }).x);

  const maliciousPayloads = [
    { label: 'javascript_protocol', payload: 'javascript:alert(1)' },
    { label: 'javascript_void', payload: 'javascript:void(0)' },
    { label: 'data_uri', payload: 'data:text/html;base64,PHNjcmlwdD4=' },
    { label: 'vbscript', payload: 'vbscript:msgbox(1)' },
    { label: 'file_scheme', payload: 'file:///etc/passwd' },
    { label: 'script_tag', payload: '<script>alert(1)</script>' },
    { label: 'event_handler', payload: 'onclick=alert(1)' },
    { label: 'attribute_escape', payload: '" onmouseover="alert(1)' },
  ];

  for (const item of maliciousPayloads) {
    const res = validateSocialStep({
      linkedin: item.payload,
      github: item.payload,
      x: item.payload,
      website: item.payload,
      portfolio: item.payload,
    });
    const allRejected = Boolean(res.linkedin && res.github && res.x && res.website && res.portfolio);
    record(s3, `reject_${item.label}`, allRejected, allRejected ? undefined : `Payload not rejected on all fields: ${item.payload}`);
  }

  // =========================================================================
  // SUITE 4: Validation Corner Cases - Customization Step (Step 5)
  // =========================================================================
  const s4 = 'Validation: Step 5 Customization';
  record(s4, 'valid_gradient_and_category_accepted', Object.keys(validateCustomizationStep({ cardGradient: ['#2563eb', '#00a8e8'], cardCategory: 'Professional' })).length === 0);
  record(s4, 'empty_cardCategory_rejected', Boolean(validateCustomizationStep({ cardGradient: ['#2563eb', '#00a8e8'], cardCategory: '' }).cardCategory));
  record(s4, 'whitespace_cardCategory_rejected', Boolean(validateCustomizationStep({ cardGradient: ['#2563eb', '#00a8e8'], cardCategory: '   ' }).cardCategory));
  record(s4, 'empty_gradient_tuple_rejected', Boolean(validateCustomizationStep({ cardGradient: [] as any, cardCategory: 'Professional' }).cardGradient));
  record(s4, 'single_color_gradient_rejected', Boolean(validateCustomizationStep({ cardGradient: ['#2563eb'] as any, cardCategory: 'Professional' }).cardGradient));
  record(s4, 'empty_color_in_gradient_rejected', Boolean(validateCustomizationStep({ cardGradient: ['#2563eb', ''] as any, cardCategory: 'Professional' }).cardGradient));

  // =========================================================================
  // SUITE 5: URL Normalization
  // =========================================================================
  const s5 = 'URL Normalization';
  record(s5, 'bare_domain_prepends_https', normalizeUrl('example.com') === 'https://example.com');
  record(s5, 'preserves_https', normalizeUrl('https://example.com') === 'https://example.com');
  record(s5, 'preserves_http', normalizeUrl('http://example.com') === 'http://example.com');
  record(s5, 'github_bare_username', normalizeUrl('torvalds', 'github') === 'https://github.com/torvalds');
  record(s5, 'github_username_with_hyphen', normalizeUrl('john-doe', 'github') === 'https://github.com/john-doe');

  // Challenge: @ in github handle
  const ghAt = normalizeUrl('@torvalds', 'github');
  const ghAtPassed = ghAt === 'https://github.com/torvalds';
  record(s5, 'github_handle_with_at_prefix', ghAtPassed, ghAtPassed ? undefined : `normalizeUrl('@torvalds', 'github') returned '${ghAt}' instead of 'https://github.com/torvalds'`);

  record(s5, 'x_handle_with_at', normalizeUrl('@sampath', 'x') === 'https://x.com/sampath');
  record(s5, 'x_handle_without_at', normalizeUrl('sampath', 'x') === 'https://x.com/sampath');
  record(s5, 'x_full_url_preserved', normalizeUrl('https://x.com/sampath', 'x') === 'https://x.com/sampath');

  record(s5, 'linkedin_bare_username', normalizeUrl('janedoe', 'linkedin') === 'https://linkedin.com/in/janedoe');
  record(s5, 'linkedin_with_in_prefix', normalizeUrl('in/janedoe', 'linkedin') === 'https://linkedin.com/in/janedoe');
  record(s5, 'linkedin_with_slash_in_prefix', normalizeUrl('/in/janedoe', 'linkedin') === 'https://linkedin.com/in/janedoe');

  // Challenge: linkedin username with dot
  const liDot = normalizeUrl('john.doe', 'linkedin');
  const liDotPassed = liDot === 'https://linkedin.com/in/john.doe';
  record(s5, 'linkedin_username_with_dot', liDotPassed, liDotPassed ? undefined : `normalizeUrl('john.doe', 'linkedin') returned '${liDot}' instead of 'https://linkedin.com/in/john.doe'`);

  record(s5, 'empty_string_returns_empty', normalizeUrl('') === '');
  record(s5, 'whitespace_returns_empty', normalizeUrl('   ') === '');

  // =========================================================================
  // SUITE 6: Data Mapper Round-Trips & Information Preservation
  // =========================================================================
  const s6 = 'Data Mapper Round-Trips';

  const fullDraft: OnboardingDraft = {
    ...INITIAL_ONBOARDING_DRAFT,
    fullName: 'Ada Lovelace',
    title: 'Lead Computing Architect',
    phone: '+1 (555) 234-5678',
    location: 'London, UK',
    organization: 'Analytical Engine Corp',
    workEmail: 'ada@analytical.org',
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
  record(s6, 'complete_draft_round_trip_lossless', fullEqual, fullEqual ? undefined : 'Complete draft lost data during Profile+Card round-trip');

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

  // Challenge: Empty optional fields round-trip
  const emptyOptDraft: OnboardingDraft = {
    ...INITIAL_ONBOARDING_DRAFT,
    fullName: 'Jane Doe',
    workEmail: 'jane@example.com',
    title: '',
    organization: '',
  };
  const emptyProfile = mapDraftToProfile(emptyOptDraft);
  const emptyCard = mapDraftToBusinessCard(emptyOptDraft);
  const recEmptyDraft = mapProfileToDraft(emptyProfile, emptyCard);

  const titlePreserved = recEmptyDraft.title === '';
  record(s6, 'empty_title_preserved_without_fallback_mutation', titlePreserved, titlePreserved ? undefined : `Empty title '' was mutated to '${recEmptyDraft.title}' by card fallback`);

  const orgPreserved = recEmptyDraft.organization === '';
  record(s6, 'empty_org_preserved_without_fallback_mutation', orgPreserved, orgPreserved ? undefined : `Empty organization '' was mutated to '${recEmptyDraft.organization}' by card fallback`);

  // =========================================================================
  // SUITE 7: Step Validation Flow & Sequential Guards
  // =========================================================================
  const s7 = 'Step Validation Flow';
  const a1 = validateAllSteps(INITIAL_ONBOARDING_DRAFT);
  record(s7, 'all_steps_empty_draft_stops_at_step_2', a1.isValid === false && a1.firstErrorStep === 2 && Boolean(a1.errors.fullName));

  const a2 = validateAllSteps({ ...INITIAL_ONBOARDING_DRAFT, fullName: 'John Doe' });
  record(s7, 'all_steps_step2_filled_stops_at_step_3', a2.isValid === false && a2.firstErrorStep === 3 && Boolean(a2.errors.workEmail));

  const a3 = validateAllSteps({ ...INITIAL_ONBOARDING_DRAFT, fullName: 'John Doe', workEmail: 'john@doe.com', website: 'invalid site with space' });
  record(s7, 'all_steps_step3_filled_stops_at_step_4', a3.isValid === false && a3.firstErrorStep === 4 && Boolean(a3.errors.website));

  const a4 = validateAllSteps({ ...INITIAL_ONBOARDING_DRAFT, fullName: 'John Doe', workEmail: 'john@doe.com', cardCategory: '' });
  record(s7, 'all_steps_step4_filled_stops_at_step_5', a4.isValid === false && a4.firstErrorStep === 5 && Boolean(a4.errors.cardCategory));

  const a5 = validateAllSteps({ ...INITIAL_ONBOARDING_DRAFT, fullName: 'John Doe', workEmail: 'john@doe.com' });
  record(s7, 'all_steps_minimal_required_succeeds', a5.isValid === true && a5.firstErrorStep === null && Object.keys(a5.errors).length === 0);

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  return { total, passed, failed, results };
}
