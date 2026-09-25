import { Pressable, View, type LayoutChangeEvent } from 'react-native';
import type { BusinessCard, CardSectionId } from '../types/card.types';
import type { Profile } from '@/components/profileComponents/types/profile.types';
import { Text } from '@/components/uiComponents/Text';
import { CardDetailSection } from './CardDetailSection';
import { createCardDetailTemplate } from '../Templates/cardDetailTemplate';
import { getCardFontFamily, getCardLetterSpacing } from '../Templates/cardTheme';
import { ActiveSectionHighlight } from '@/components/editViewComponents/Components/ActiveSectionHighlight';

export function CardDetailView({ activeSection, card, onEditSection, onSectionLayout, profile }: { activeSection?: CardSectionId; card: BusinessCard; onEditSection?: (section: CardSectionId) => void; onSectionLayout?: (section: CardSectionId, y: number) => void; profile: Profile }) {
  const sections = createCardDetailTemplate(card, profile);

  const firstTheme = card.sectionThemes[sections[0]?.id];

  return (
    <View
      className="mb-5 overflow-hidden rounded-[28px] border shadow-sm"
      style={{ borderColor: firstTheme?.accentColor, backgroundColor: firstTheme?.surfaceColor }}
    >
      {sections.map((section) => {
        const theme = card.sectionThemes[section.id];
        const fontFamily = getCardFontFamily(theme.fontStyle);
        const letterSpacing = getCardLetterSpacing(theme.fontStyle);
        const handleLayout = (event: LayoutChangeEvent) => onSectionLayout?.(section.id, event.nativeEvent.layout.y);
        return <View key={section.id} onLayout={handleLayout} style={{ position: 'relative' }}>
          <CardDetailSection cardTheme={theme} gradient={theme.gradient} section={section} />
          {activeSection === section.id ? <ActiveSectionHighlight /> : null}
          {onEditSection ? <Pressable accessibilityLabel={`Customize ${section.title}`} onPress={() => onEditSection(section.id)} className="mb-2 items-center py-3" style={{ backgroundColor: theme.surfaceColor }}><Text className="font-bold" style={{ color: theme.accentColor, fontFamily, letterSpacing }}>Customize</Text></Pressable> : null}
        </View>;
      })}
    </View>
  );
}
