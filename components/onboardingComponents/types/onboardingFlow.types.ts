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
    };

export const ONBOARDING_FLOW: OnboardingFlowItem[] = [
  { kind: 'welcome' },
  {
    kind: 'group',
    groupId: 'contact_email',
    title: 'How can people reach you?',
    funTag: 'Carrier pigeons retired — email still works.',
    fields: [
      {
        key: 'email',
        label: '',
        placeholder: 'Work email',
        required: true,
        keyboardType: 'email-address',
        autoCapitalize: 'none',
      },
      {
        key: 'phone',
        label: '',
        placeholder: 'Phone (optional)',
        keyboardType: 'phone-pad',
        autoCapitalize: 'none',
      },
    ],
  },
  {
    kind: 'group',
    groupId: 'name_legal',
    title: 'What name should appear on your card?',
    funTag: 'Use the name people know you by.',
    fields: [
      {
        key: 'firstName',
        label: '',
        placeholder: 'First name',
        required: true,
        autoCapitalize: 'words',
        maxLength: 50,
      },
      {
        key: 'lastName',
        label: '',
        placeholder: 'Last name',
        required: true,
        autoCapitalize: 'words',
        maxLength: 50,
      },
      {
        key: 'prefix',
        label: '',
        placeholder: 'Prefix',
        autoCapitalize: 'words',
        maxLength: 15,
      },
      {
        key: 'middleName',
        label: '',
        placeholder: 'Middle name',
        autoCapitalize: 'words',
        maxLength: 50,
      },
      {
        key: 'suffix',
        label: '',
        placeholder: 'Suffix',
        autoCapitalize: 'words',
        maxLength: 15,
      },
      {
        key: 'accreditations',
        label: '',
        placeholder: 'Degrees, certs, or licenses (optional)',
        autoCapitalize: 'characters',
        maxLength: 80,
        hideIcon: true,
      },
    ],
  },
  {
    kind: 'group',
    groupId: 'presence',
    title: 'Photo and tagline?',
    skippable: true,
    fields: [{ key: 'photoUrl', widget: 'presence_block', label: 'Presence' }],
  },
  {
    kind: 'group',
    groupId: 'role_company',
    title: 'What do you do?',
    funTag: 'Your title and company show on your card.',
    fields: [
      {
        key: 'title',
        label: '',
        placeholder: 'Job title',
        required: true,
        autoCapitalize: 'words',
        maxLength: 80,
        hideIcon: true,
      },
      {
        key: 'organization',
        label: '',
        placeholder: 'Company or organization',
        autoCapitalize: 'words',
        maxLength: 100,
        hideIcon: true,
      },
    ],
  },
  {
    kind: 'group',
    groupId: 'work_dept_address',
    title: 'Department and address?',
    skippable: true,
    fields: [
      {
        key: 'department',
        label: 'Department',
        placeholder: 'e.g. Product Engineering',
        autoCapitalize: 'words',
        maxLength: 100,
      },
      {
        key: 'businessAddress',
        label: 'Business address',
        placeholder: 'City, State or full address',
        autoCapitalize: 'words',
        maxLength: 100,
      },
    ],
  },
  {
    kind: 'group',
    groupId: 'work_logo_website',
    title: 'Website and logo?',
    skippable: true,
    fields: [
      {
        key: 'companyLogoUrl',
        widget: 'image_logo',
        label: 'Company logo',
        placeholder: '',
      },
      {
        key: 'website',
        label: 'Website',
        placeholder: 'https://yourcompany.com',
        keyboardType: 'url',
        autoCapitalize: 'none',
      },
    ],
  },
  {
    kind: 'group',
    groupId: 'social_links',
    title: 'Add social profiles?',
    funTag: 'LinkedIn, YouTube, and more — all optional.',
    skippable: true,
    fields: [{ key: 'linkedin', widget: 'social_block', label: 'Social profiles' }],
  },
  {
    kind: 'group',
    groupId: 'short_bio',
    title: 'Add a short bio?',
    skippable: true,
    fields: [
      {
        key: 'shortBio',
        label: '',
        placeholder: 'What you do and what you care about',
        autoCapitalize: 'sentences',
        maxLength: 240,
        hideIcon: true,
      },
    ],
  },
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
]);

export function flowIndexForField(fieldKey: string): number {
  if (SOCIAL_DRAFT_FIELD_KEYS.has(fieldKey)) {
    const socialIndex = ONBOARDING_FLOW.findIndex(
      (item) => item.kind === 'group' && item.groupId === 'social_links'
    );
    if (socialIndex >= 0) return socialIndex;
  }
  if (fieldKey === 'tagline') {
    const presenceIndex = ONBOARDING_FLOW.findIndex(
      (item) => item.kind === 'group' && item.groupId === 'presence'
    );
    if (presenceIndex >= 0) return presenceIndex;
  }
  for (let i = 0; i < ONBOARDING_FLOW.length; i++) {
    const item = ONBOARDING_FLOW[i];
    if (item.kind === 'group') {
      if (item.fields.some((f) => f.key === fieldKey || f.widget === 'presence_block')) {
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
    if (ONBOARDING_FLOW[i].kind === 'group') return i;
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
    (item) => item.kind !== 'welcome' && item.kind !== 'card_style'
  ).length;
}
