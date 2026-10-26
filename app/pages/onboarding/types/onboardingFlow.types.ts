import type { OnboardingDraft } from './onboardingStepper.types';

export type OnboardingFlowGroupId =
  | 'name_legal'
  | 'name_formal'
  | 'role_company'
  | 'credentials'
  | 'tagline'
  | 'contact_email'
  | 'contact_phone'
  | 'work_logo_website'
  | 'work_dept_address'
  | 'short_bio'
  | 'presence'
  | 'social_links'
  | 'card_style';

export type OnboardingStepIconKey =
  | 'user'
  | 'briefcase'
  | 'mail'
  | 'quote'
  | 'file-text'
  | 'camera'
  | 'link';

export type FieldWidget =
  | 'text'
  | 'image_avatar'
  | 'image_banner'
  | 'image_logo'
  | 'presence_block'
  | 'social_block';

export type DraftFieldKey = keyof OnboardingDraft;

export interface FieldSpec {
  key: DraftFieldKey;
  widget?: FieldWidget;
  label: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'url';
  autoCapitalize?: 'none' | 'words' | 'characters' | 'sentences';
  maxLength?: number;
  /** Underline fields without leading icon (name / role style). */
  hideIcon?: boolean;
}

/** One card: conversational prompt + inputs together (no separate question screen). */
export type OnboardingFlowItem =
  | { kind: 'welcome' }
  | {
      kind: 'group';
      groupId: OnboardingFlowGroupId;
      title: string;
      subtitle?: string;
      /** Short label for the segmented header step indicator. */
      stepLabel?: string;
      /** Icon key for the segmented header step indicator. */
      stepIcon?: OnboardingStepIconKey;
      /** Fixed two-line helper under the title (avoids awkward wraps). */
      subtitleLines?: [string, string];
      /** Cycles on screen with a fade animation (e.g. Professional, Friendly). */
      highlightWords?: string[];
      /** Small playful pill under the title. */
      funTag?: string;
      fields: FieldSpec[];
      skippable?: boolean;
    }
  | {
      kind: 'card_style';
      groupId: 'card_style';
      title: string;
      subtitle?: string;
    }
  | { kind: 'complete' };

export const ONBOARDING_FLOW: OnboardingFlowItem[] = [
  { kind: 'welcome' },
  // Step 1: Name
  {
    kind: 'group',
    groupId: 'name_legal',
    title: "What's your name?",
    stepLabel: 'Name',
    stepIcon: 'user',
    fields: [
      {
        key: 'firstName',
        label: 'First name',
        placeholder: 'First name',
        required: true,
        autoCapitalize: 'words',
        maxLength: 50,
      },
      {
        key: 'lastName',
        label: 'Last name',
        placeholder: 'Last name',
        required: true,
        autoCapitalize: 'words',
        maxLength: 50,
      },
    ],
  },
  // Step 2: Job title, company and accreditations
  {
    kind: 'group',
    groupId: 'role_company',
    title: 'What you do',
    stepLabel: 'Job',
    stepIcon: 'briefcase',
    fields: [
      {
        key: 'title',
        label: 'Job title',
        placeholder: 'Software Developer',
        required: true,
        autoCapitalize: 'words',
        maxLength: 80,
      },
      {
        key: 'organization',
        label: 'Company',
        placeholder: 'Company or organization',
        autoCapitalize: 'words',
        maxLength: 100,
      },
      {
        key: 'accreditations',
        label: 'Accreditations',
        placeholder: 'Degrees, certs, or licenses (optional)',
        autoCapitalize: 'characters',
        maxLength: 80,
      },
    ],
  },
  // Step 3: Email, phone and location
  {
    kind: 'group',
    groupId: 'contact_email',
    title: 'How to reach you',
    stepLabel: 'Contact',
    stepIcon: 'mail',
    fields: [
      {
        key: 'email',
        label: 'Email',
        placeholder: 'Work email',
        required: true,
        keyboardType: 'email-address',
        autoCapitalize: 'none',
      },
      {
        key: 'phone',
        label: 'Phone',
        placeholder: 'Phone (optional)',
        keyboardType: 'phone-pad',
        autoCapitalize: 'none',
      },
      {
        key: 'businessAddress',
        label: 'Location',
        placeholder: 'City, State or full address',
        autoCapitalize: 'words',
        maxLength: 100,
      },
    ],
  },
  // Step 4: Tag
  {
    kind: 'group',
    groupId: 'tagline',
    title: 'Your headline',
    stepLabel: 'Tag',
    stepIcon: 'quote',
    skippable: true,
    fields: [
      {
        key: 'tagline',
        label: 'Tagline',
        placeholder: 'One short line that appears on your card',
        autoCapitalize: 'sentences',
        maxLength: 120,
      },
    ],
  },
  // Step 5: Bio
  {
    kind: 'group',
    groupId: 'short_bio',
    title: 'About you',
    stepLabel: 'Bio',
    stepIcon: 'file-text',
    skippable: true,
    fields: [
      {
        key: 'shortBio',
        label: 'Short bio',
        placeholder: 'I am here to build tools for the future',
        autoCapitalize: 'sentences',
        maxLength: 240,
      },
    ],
  },
  // Step 6: Images (profile, logo, cover)
  {
    kind: 'group',
    groupId: 'presence',
    title: 'Make it yours',
    stepLabel: 'Image',
    stepIcon: 'camera',
    skippable: true,
    fields: [{ key: 'photoUrl', widget: 'presence_block', label: 'Images' }],
  },
  // Step 7: Social links
  {
    kind: 'group',
    groupId: 'social_links',
    title: 'Connect your links',
    stepLabel: 'Links',
    stepIcon: 'link',
    fields: [{ key: 'linkedin', widget: 'social_block', label: 'Social profiles' }],
  },
  // Step 8: Completion
  { kind: 'complete' },
];

/** Keep flow index in range when flow length changes (e.g. hot reload). */
export function clampFlowIndex(index: number): number {
  const max = Math.max(0, ONBOARDING_FLOW.length - 1);
  if (!Number.isFinite(index)) return 0;
  return Math.min(Math.max(0, Math.trunc(index)), max);
}

export function flowItemAtIndex(index: number): OnboardingFlowItem | undefined {
  return ONBOARDING_FLOW[clampFlowIndex(index)];
}

/** Map draft field errors to first flow index that collects that field. */
const SOCIAL_DRAFT_FIELD_KEYS = new Set([
  'linkedin',
  'github',
  'x',
  'facebook',
  'instagram',
  'whatsapp',
  'youtube',
  'tiktok',
  'portfolio',
  'website',
  'socialLinks',
]);

export function flowIndexForField(fieldKey: string): number {
  if (SOCIAL_DRAFT_FIELD_KEYS.has(fieldKey)) {
    const socialIndex = ONBOARDING_FLOW.findIndex(
      (item) => item.kind === 'group' && item.groupId === 'social_links'
    );
    if (socialIndex >= 0) return socialIndex;
  }
  if (
    fieldKey === 'photoUrl' ||
    fieldKey === 'coverPhotoUrl' ||
    fieldKey === 'companyLogoUrl'
  ) {
    const presenceIndex = ONBOARDING_FLOW.findIndex(
      (item) => item.kind === 'group' && item.groupId === 'presence'
    );
    if (presenceIndex >= 0) return presenceIndex;
  }
  if (fieldKey === 'tagline') {
    const taglineIndex = ONBOARDING_FLOW.findIndex(
      (item) => item.kind === 'group' && item.groupId === 'tagline'
    );
    if (taglineIndex >= 0) return taglineIndex;
  }
  if (
    fieldKey === 'firstName' ||
    fieldKey === 'lastName' ||
    fieldKey === 'prefix' ||
    fieldKey === 'middleName' ||
    fieldKey === 'suffix' ||
    fieldKey === 'preferredName'
  ) {
    const nameIndex = ONBOARDING_FLOW.findIndex(
      (item) => item.kind === 'group' && item.groupId === 'name_legal'
    );
    if (nameIndex >= 0) return nameIndex;
  }
  for (let i = 0; i < ONBOARDING_FLOW.length; i++) {
    const item = ONBOARDING_FLOW[i];
    if (item.kind === 'group') {
      if (item.fields.some((f) => f.key === fieldKey)) {
        return i;
      }
    }
    if (item.kind === 'card_style' && (fieldKey === 'cardGradient' || fieldKey === 'cardCategory')) {
      return i;
    }
  }
  return clampFlowIndex(1);
}

/** After skip: jump to next group screen. */
export function indexAfterSkip(currentIndex: number): number {
  const safeIndex = clampFlowIndex(currentIndex);
  for (let i = safeIndex + 1; i < ONBOARDING_FLOW.length; i++) {
    const next = ONBOARDING_FLOW[i];
    if (next.kind === 'group' || next.kind === 'complete') return i;
  }
  return clampFlowIndex(ONBOARDING_FLOW.length - 1);
}

export function isFlowItemSkippable(item: OnboardingFlowItem): boolean {
  if (item.kind === 'group') {
    return Boolean(item.skippable);
  }
  return false;
}

export function countProgressSteps(): number {
  return ONBOARDING_FLOW.filter(
    (item) => item.kind !== 'welcome' && item.kind !== 'card_style' && item.kind !== 'complete'
  ).length;
}

/** 0-based index among progress-counted steps, or -1 when not on a progress step. */
export function progressStepIndex(flowIndex: number): number {
  const safeIndex = clampFlowIndex(flowIndex);
  let progress = -1;
  for (let i = 0; i <= safeIndex; i++) {
    const item = ONBOARDING_FLOW[i];
    if (!item) continue;
    if (item.kind === 'welcome' || item.kind === 'card_style' || item.kind === 'complete') {
      continue;
    }
    progress += 1;
  }
  const current = ONBOARDING_FLOW[safeIndex];
  if (
    !current ||
    current.kind === 'welcome' ||
    current.kind === 'card_style' ||
    current.kind === 'complete'
  ) {
    return -1;
  }
  return progress;
}

/**
 * Calculates a dynamic 0–100% profile completion score from the current OnboardingDraft.
 *
 * Weights:
 * - Core required fields (firstName, lastName, title, email): 40% (10% each)
 * - Professional & contact extras (organization, accreditations, phone, businessAddress): 20% (5% each)
 * - Messaging (tagline, shortBio): 15% (7.5% each)
 * - Images (photoUrl, companyLogoUrl, coverPhotoUrl): 15% (5% each)
 * - Links (website or at least 1 social link): 10%
 */
export function calculateProfileCompletion(draft: Partial<OnboardingDraft>): number {
  let score = 0;
  const has = (val?: string) => Boolean(val && val.trim().length > 0);

  // Core required fields (40%)
  if (has(draft.firstName)) score += 10;
  if (has(draft.lastName)) score += 10;
  if (has(draft.title)) score += 10;
  if (has(draft.email)) score += 10;

  // Professional & contact extras (20%)
  if (has(draft.organization)) score += 5;
  if (has(draft.accreditations)) score += 5;
  if (has(draft.phone)) score += 5;
  if (has(draft.businessAddress)) score += 5;

  // Messaging (15%)
  if (has(draft.tagline)) score += 7.5;
  if (has(draft.shortBio)) score += 7.5;

  // Images (15%)
  if (has(draft.photoUrl)) score += 5;
  if (has(draft.companyLogoUrl)) score += 5;
  if (has(draft.coverPhotoUrl)) score += 5;

  // Links (10%)
  const hasAnyLink =
    has(draft.website) ||
    has(draft.linkedin) ||
    has(draft.github) ||
    has(draft.x) ||
    has(draft.facebook) ||
    has(draft.instagram) ||
    has(draft.whatsapp) ||
    has(draft.youtube) ||
    has(draft.tiktok) ||
    has(draft.portfolio);

  if (hasAnyLink) score += 10;

  return Math.min(100, Math.max(0, Math.round(score)));
}
