import type { CardDetailSection } from '@/pages/cards/Templates/cardDetailTemplate';
import { CARD_TEXT_LIMITS, fitCardText, fitProfessionalName } from '@/utils/cardTextLayout';

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
  const professionalNameText = fitProfessionalName({
    prefix: getVal('prefix'),
    firstName: getVal('firstName'),
    middleName: getVal('middleName'),
    lastName: getVal('lastName'),
    suffix: getVal('suffix'),
  });
  const title = fitCardText(getVal('title') || 'Professional Title', CARD_TEXT_LIMITS.title);
  return {
    accreditations: fitCardText(getVal('accreditations'), CARD_TEXT_LIMITS.accreditations),
    company: fitCardText(getVal('company') || 'Company', CARD_TEXT_LIMITS.company),
    professionalName: professionalNameText || title,
    title,
    bio: fitCardText(getVal('headline') || getVal('bio'), CARD_TEXT_LIMITS.bio),
  };
}
