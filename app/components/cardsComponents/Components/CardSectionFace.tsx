import { View } from 'react-native';
import type { Profile } from '@/components/profileComponents/types/profile.types';
import type { BusinessCard, CardSectionId } from '../types/card.types';
import { createCardDetailTemplate } from '../Templates/cardDetailTemplate';
import { SectionTemplateRenderer } from '../Templates/SectionTemplateRenderer';

export function CardSectionFace({
  card,
  height,
  homepagePreview = false,
  profile,
  sectionId,
  seamless = false,
  walletPass = false,
  width,
}: {
  card: BusinessCard;
  height: number;
  homepagePreview?: boolean;
  profile: Profile;
  sectionId: CardSectionId;
  seamless?: boolean;
  walletPass?: boolean;
  width: number;
}) {
  const section = createCardDetailTemplate(card, profile).find((item) => item.id === sectionId);
  const theme = card.sectionThemes?.[sectionId];
  // An unknown section id (e.g. from an older build) renders nothing rather than crashing the card.
  if (!section || !theme) return null;
  return (
    <View
      className={`overflow-hidden ${seamless ? '' : 'rounded-[24px]'}`}
      style={{ width, height, backgroundColor: theme.backgroundColor }}
    >
      <View style={{ flex: 1, width: '100%', height: '100%' }}>
        <SectionTemplateRenderer
          compact
          cardTheme={theme}
          fullCardView={seamless && !walletPass}
          gradient={theme.gradient}
          homepagePreview={homepagePreview}
          section={section}
          seamless={seamless}
          walletPass={walletPass}
        />
      </View>
    </View>
  );
}
