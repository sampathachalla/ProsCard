import type { CardDetailSection } from '../Templates/cardDetailTemplate';
import { DEFAULT_CARD_DISPLAY_NAME } from '../types/card.types';

export function walletField(section: CardDetailSection, id: string) {
  return section.fields.find((item) => item.id === id);
}

export function walletFieldValue(section: CardDetailSection, id: string, fallback = '') {
  return walletField(section, id)?.value?.trim() || fallback;
}

export function walletIdentityFields(section: CardDetailSection) {
  return {
    cover: walletField(section, 'coverPhoto'),
    profile: walletField(section, 'profilePhoto'),
    logo: walletField(section, 'logo'),
    name: (() => {
      const value = walletFieldValue(section, 'preferredName', '');
      if (value && value !== DEFAULT_CARD_DISPLAY_NAME) return value;
      return 'Preferred Name';
    })(),
  };
}

export function walletProfessionalFields(section: CardDetailSection) {
  const getVal = (id: string) => walletFieldValue(section, id);
  const fullNameParts = [
    getVal('prefix'),
    getVal('firstName'),
    getVal('middleName'),
    getVal('lastName'),
    getVal('suffix'),
  ].filter(Boolean);
  const title = getVal('title') || 'Professional Title';
  return {
    accreditations: getVal('accreditations'),
    company: getVal('company') || 'Company',
    professionalName: fullNameParts.length > 0 ? fullNameParts.join(' ') : title,
    title,
  };
}
