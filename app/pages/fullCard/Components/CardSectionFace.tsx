import { View } from 'react-native';
import type { Profile } from '@/pages/profile/types/profile.types';
import type { BusinessCard, CardSectionId } from '@/pages/cards/types/card.types';
import { savedSectionTheme } from '@/pages/addCard/Config/cardTagDesignPresets';
import { createCardDetailTemplate } from '@/pages/cards/Templates/cardDetailTemplate';
import { SectionTemplateRenderer } from '@/pages/cards/Templates/SectionTemplateRenderer';

export function CardSectionFace({
  card,
  height,
  homepagePreview = false,
  profile,
  sectionId,
  seamless = false,
  width,
}: {
  card: BusinessCard;
  height: number;
  homepagePreview?: boolean;
  profile: Profile;
  sectionId: CardSectionId;
  seamless?: boolean;
  width: number;
}) {
  const section = createCardDetailTemplate(card, profile).find((item) => item.id === sectionId);
  const theme = card.sectionThemes?.[sectionId] ? savedSectionTheme(card, sectionId) : undefined;
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
          fullCardView={seamless}
          gradient={theme.gradient}
          homepagePreview={homepagePreview}
          section={section}
          seamless={seamless}
        />
      </View>
    </View>
  );
}
