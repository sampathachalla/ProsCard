import { View } from 'react-native';
import type { Profile } from '@/components/profileComponents/types/profile.types';
import type { BusinessCard, CardSectionId } from '../types/card.types';
import { createCardDetailTemplate } from '../Templates/cardDetailTemplate';
import { SectionTemplateRenderer } from '../Templates/SectionTemplateRenderer';

export function CardSectionFace({ card, height, profile, sectionId, seamless = false, width }: { card: BusinessCard; height: number; profile: Profile; sectionId: CardSectionId; seamless?: boolean; width: number }) {
  const section = createCardDetailTemplate(card, profile).find((item) => item.id === sectionId)!;
  const theme = card.sectionThemes[sectionId];
  return <View className={`overflow-hidden ${seamless ? '' : 'rounded-[24px]'}`} style={{ width, height, backgroundColor: theme.backgroundColor }}><SectionTemplateRenderer compact cardTheme={theme} gradient={theme.gradient} section={section} seamless={seamless} /></View>;
}
