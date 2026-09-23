import { Pressable, View, type LayoutChangeEvent } from 'react-native';
import type { BusinessCard, CardSectionId } from '../types/card.types';
import type { Profile } from '@/components/profileComponents/types/profile.types';
import { Text } from '@/components/uiComponents/Text';
import { CardDetailSection } from './CardDetailSection';
import { createCardDetailTemplate } from '../Templates/cardDetailTemplate';
import { getCardFontFamily, getCardLetterSpacing } from '../Templates/cardTheme';

export function CardDetailView({ card, onEditSection, onSectionLayout, profile }: { card: BusinessCard; onEditSection?: (section: CardSectionId) => void; onSectionLayout?: (section: CardSectionId, y: number) => void; profile: Profile }) {
  const sections = createCardDetailTemplate(card, profile);

  return (
    <View>
      {sections.map((section) => {
        const theme = card.sectionThemes[section.id];
        const fontFamily = getCardFontFamily(theme.fontStyle);
        const letterSpacing = getCardLetterSpacing(theme.fontStyle);
        const handleLayout = (event: LayoutChangeEvent) => onSectionLayout?.(section.id, event.nativeEvent.layout.y);
        return <View key={section.id} onLayout={handleLayout}>
          <CardDetailSection cardTheme={theme} gradient={theme.gradient} section={section} />
          {onEditSection ? <Pressable accessibilityLabel={`Customize ${section.title}`} onPress={() => onEditSection(section.id)} className="mb-6 -mt-2 items-center rounded-2xl border py-3" style={{ borderColor: theme.accentColor, backgroundColor: theme.surfaceColor }}><Text className="font-bold" style={{ color: theme.accentColor, fontFamily, letterSpacing }}>Customize</Text></Pressable> : null}
        </View>;
      })}
    </View>
  );
}
