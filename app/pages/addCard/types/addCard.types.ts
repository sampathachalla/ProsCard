// pages/addCard/types/addCard.types.ts
import type { KeyboardTypeOptions } from 'react-native';
import type { DynamicCardFieldType } from '@/pages/cards/types/card.types';

/** Plain text inputs on the Add Card form, in addition to the contact rows. */
export type AddCardTextFieldId = 'name' | 'title' | 'company' | 'accreditations' | 'tagline';

export type AddCardTextFieldConfig = {
  id: AddCardTextFieldId;
  label: string;
  placeholder: string;
  maxLength: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

export type AddCardImageField = 'coverPhoto' | 'profilePhoto' | 'logo';

/** Contact rows that are always on the form (Location, Email, Phone). */
export type PrimaryContactConfig = {
  id: 'address' | 'email' | 'phone';
  label: string;
  type: DynamicCardFieldType;
  placeholder: string;
  keyboardType: KeyboardTypeOptions;
};

/** Extra contact methods the user can add with "Add contact". */
export type ContactOption = {
  title: string;
  type: DynamicCardFieldType;
  placeholder: string;
};

/** Sheets that open on top of the form. */
export type AddCardPanel = 'layout' | 'theme' | 'contacts' | null;
