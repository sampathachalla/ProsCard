import {
  BriefcaseBusiness,
  LayoutTemplate,
  Link2,
  ListPlus,
  Palette,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';
import type { EditHomeTab } from '@/common/ui/EditHomeBar';
import type { CardSectionId } from '@/pages/cards/types/card.types';

export const SECTION_TITLES: Record<CardSectionId, string> = {
  identity: 'Identity',
  professional: 'Professional identity',
  bio: 'About',
  connections: 'Contact & links',
};

export type SectionChoice = {
  id: CardSectionId;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const SECTION_CHOICES: SectionChoice[] = [
  {
    id: 'identity',
    title: 'Identity',
    description: 'Name, cover, profile photo and logo',
    icon: UserRound,
  },
  {
    id: 'professional',
    title: 'Professional',
    description: 'Name details, title and company',
    icon: BriefcaseBusiness,
  },
  {
    id: 'connections',
    title: 'Contact & links',
    description: 'Email, phone and social links',
    icon: Link2,
  },
];

export const CREATION_STEPS: CardSectionId[] = ['identity', 'professional', 'connections'];

export const CREATION_FLOW: { section: CardSectionId; tab: EditHomeTab }[] = [
  { section: 'identity', tab: 'layout' },
  { section: 'identity', tab: 'content' },
  { section: 'professional', tab: 'layout' },
  { section: 'professional', tab: 'content' },
  { section: 'connections', tab: 'layout' },
  { section: 'connections', tab: 'content' },
  { section: 'connections', tab: 'styling' },
];

export const EDIT_MODES: { id: EditHomeTab; label: string; icon: LucideIcon }[] = [
  { id: 'layout', label: 'Layout', icon: LayoutTemplate },
  { id: 'content', label: 'Content', icon: ListPlus },
  { id: 'styling', label: 'Styling', icon: Palette },
];

// Stacking order for editor chrome. FloatingEditBarButton sits at 100, between the sheet and the bars.
export const Z_INDEX = { sheet: 50, bottomBar: 200, header: 220 } as const;
