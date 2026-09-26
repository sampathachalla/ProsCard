import type { OnboardingDraft } from './onboardingStepper.types';

export type OnboardingFlowGroupId =
  | 'name_legal'
  | 'name_formal'
  | 'role_company'
  | 'credentials'
  | 'contact_email'
  | 'contact_phone'
  | 'work_extra'
  | 'presence'
  | 'card_style';

export type FieldWidget =
  | 'text'
  | 'image_avatar'
  | 'image_banner'
  | 'image_logo'
  | 'presence_block';

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
}

/** One card: conversational prompt + inputs together (no separate question screen). */
export type OnboardingFlowItem =
  | { kind: 'welcome' }
  | {
      kind: 'group';
      groupId: OnboardingFlowGroupId;
      title: string;
      subtitle?: string;
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
    groupId: 'name_legal',
    title: 'What name should appear on your card?',
    subtitle: 'Use the name people know you by professionally.',
    fields: [
      {
        key: 'firstName',
        label: 'First name',
        placeholder: 'Alex',
        required: true,
        autoCapitalize: 'words',
        maxLength: 50,
      },
      {
        key: 'lastName',
        label: 'Last name',
        placeholder: 'Morgan',
        required: true,
        autoCapitalize: 'words',
        maxLength: 50,
      },
    ],
  },
  {
    kind: 'group',
    groupId: 'name_formal',
    title: 'Any prefix, middle name, or suffix?',
    subtitle: 'Optional formal name details.',
    skippable: true,
    fields: [
      {
        key: 'prefix',
        label: 'Prefix',
        placeholder: 'Dr.',
        autoCapitalize: 'words',
        maxLength: 15,
      },
      {
        key: 'middleName',
        label: 'Middle name',
        placeholder: 'Optional',
        autoCapitalize: 'words',
        maxLength: 50,
      },
      {
        key: 'suffix',
        label: 'Suffix',
        placeholder: 'Jr.',
        autoCapitalize: 'words',
        maxLength: 15,
      },
    ],
  },
  {
    kind: 'group',
    groupId: 'role_company',
    title: "What's your job title and company?",
    subtitle: 'Your title is required; company helps people recognize where you work.',
    fields: [
      {
        key: 'title',
        label: 'Job title',
        placeholder: 'e.g. Senior Product Manager',
        required: true,
        autoCapitalize: 'words',
        maxLength: 80,
        hint: 'Shown on the front of your card.',
      },
      {
        key: 'organization',
        label: 'Company / organization',
        placeholder: 'e.g. Acme Innovations',
        autoCapitalize: 'words',
        maxLength: 100,
      },
    ],
  },
  {
    kind: 'group',
    groupId: 'credentials',
    title: 'Education, degrees, or accreditations?',
    subtitle: 'Optional credentials that add credibility on your card.',
    skippable: true,
    fields: [
      {
        key: 'accreditations',
        label: 'Accreditations / degrees',
        placeholder: 'e.g. MS, PhD, CPA',
        autoCapitalize: 'characters',
        maxLength: 80,
      },
      {
        key: 'tagline',
        label: 'Tagline',
        placeholder: 'A short one-line introduction',
        maxLength: 120,
      },
    ],
  },
  {
    kind: 'group',
    groupId: 'contact_email',
    title: "What's the best email to reach you?",
    subtitle: 'Required so contacts can reach you from your card.',
    fields: [
      {
        key: 'email',
        label: 'Work email',
        placeholder: 'alex@company.com',
        required: true,
        keyboardType: 'email-address',
        autoCapitalize: 'none',
      },
    ],
  },
  {
    kind: 'group',
    groupId: 'contact_phone',
    title: 'Phone number for your card?',
    subtitle: 'Optional — enables one-tap calling from your card.',
    skippable: true,
    fields: [
      {
        key: 'phone',
        label: 'Phone',
        placeholder: '+1 (555) 234-5678',
        keyboardType: 'phone-pad',
        autoCapitalize: 'none',
      },
    ],
  },
  {
    kind: 'group',
    groupId: 'work_extra',
    title: 'More work details?',
    subtitle: 'Department, website, address, bio, or company logo.',
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
        key: 'website',
        label: 'Website',
        placeholder: 'https://yourcompany.com',
        keyboardType: 'url',
        autoCapitalize: 'none',
      },
      {
        key: 'businessAddress',
        label: 'Business address',
        placeholder: 'City, State or full address',
        autoCapitalize: 'words',
        maxLength: 100,
      },
      {
        key: 'shortBio',
        label: 'Short bio',
        placeholder: 'A brief professional summary',
        maxLength: 240,
      },
      {
        key: 'companyLogoUrl',
        widget: 'image_logo',
        label: 'Company logo',
        placeholder: '',
      },
    ],
  },
  {
    kind: 'group',
    groupId: 'presence',
    title: 'Photo and social links?',
    subtitle: 'Optional — add now or anytime from Profile.',
    skippable: true,
    fields: [{ key: 'photoUrl', widget: 'presence_block', label: 'Presence' }],
  },
  {
    kind: 'card_style',
    groupId: 'card_style',
    title: 'How should your card look?',
    subtitle: 'Pick a theme and category, then create your card.',
  },
];

/** Map draft field errors to first flow index that collects that field. */
export function flowIndexForField(fieldKey: string): number {
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
  return 1;
}

/** After skip: jump to next group or card_style. */
export function indexAfterSkip(currentIndex: number): number {
  for (let i = currentIndex + 1; i < ONBOARDING_FLOW.length; i++) {
    const item = ONBOARDING_FLOW[i];
    if (item.kind === 'group' || item.kind === 'card_style') return i;
  }
  return ONBOARDING_FLOW.length - 1;
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
