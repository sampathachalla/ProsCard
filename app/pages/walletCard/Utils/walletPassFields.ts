import type { CardDetailSection } from '@/pages/cards/Templates/cardDetailTemplate';
import { CARD_TEXT_LIMITS, fitCardText } from '@/utils/cardTextLayout';

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
    name: fitCardText(walletFieldValue(section, 'preferredName', 'Preferred Name'), CARD_TEXT_LIMITS.professionalName),
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
  const title = fitCardText(getVal('title') || 'Professional Title', CARD_TEXT_LIMITS.title);
  return {
    accreditations: fitCardText(getVal('accreditations'), CARD_TEXT_LIMITS.accreditations),
    company: fitCardText(getVal('company') || 'Company', CARD_TEXT_LIMITS.company),
    professionalName: fitCardText(fullNameParts.length > 0 ? fullNameParts.join(' ') : title, CARD_TEXT_LIMITS.professionalName),
    title,
    bio: fitCardText(getVal('headline') || getVal('bio'), CARD_TEXT_LIMITS.bio),
  };
}
