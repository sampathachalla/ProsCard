import { Pressable, View, useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import type { BusinessCard, CardSectionId } from '../types/card.types';
import type { Profile } from '@/components/profileComponents/types/profile.types';
import { Text } from '@/components/uiComponents/Text';
import { CardDetailSection } from './CardDetailSection';
import { identitySectionHeight, professionalSectionHeight } from '../cardSectionLayout';
import { createCardDetailTemplate } from '../Templates/cardDetailTemplate';
import { SectionTemplateRenderer } from '../Templates/SectionTemplateRenderer';
import { getCardFontFamily, getCardLetterSpacing } from '../Templates/cardTheme';
import { ActiveSectionHighlight } from '@/components/editViewComponents/Components/ActiveSectionHighlight';

export function CardDetailView({
  activeSection,
  card,
  fullBleed = false,
  onEditSection,
  onSectionLayout,
  profile,
}: {
  activeSection?: CardSectionId;
  card: BusinessCard;
  fullBleed?: boolean;
  onEditSection?: (section: CardSectionId) => void;
  onSectionLayout?: (section: CardSectionId, y: number) => void;
  profile: Profile;
}) {
  const { height: windowHeight } = useWindowDimensions();
  const sections = createCardDetailTemplate(card, profile);
  const identityHeight = identitySectionHeight(windowHeight);
  const professionalHeight = professionalSectionHeight(windowHeight);

  const firstTheme = card.sectionThemes[sections[0]?.id];

  return (
    <View
      className={fullBleed ? 'overflow-hidden' : 'mb-5 overflow-hidden rounded-[28px] border shadow-sm'}
      style={{
        backgroundColor: firstTheme?.surfaceColor,
        ...(fullBleed ? {} : { borderColor: firstTheme?.accentColor }),
      }}
    >
      {sections.map((section) => {
        const theme = card.sectionThemes[section.id];
        const fontFamily = getCardFontFamily(theme.fontStyle);
        const letterSpacing = getCardLetterSpacing(theme.fontStyle);
        const handleLayout = (event: LayoutChangeEvent) => onSectionLayout?.(section.id, event.nativeEvent.layout.y);
        return (
          <View key={section.id} onLayout={handleLayout} style={{ position: 'relative' }}>
            {section.id === 'identity' || section.id === 'professional' ? (
              <View
                style={{
                  height: section.id === 'identity' ? identityHeight : professionalHeight,
                  width: '100%',
                  overflow: 'hidden',
                }}
              >
                <SectionTemplateRenderer
                  key={`${section.id}-${theme.backgroundColor}-${theme.surfaceColor}-${theme.textColorOverride ?? theme.textColor}-${theme.accentColor}-${theme.customThemeId ?? ''}`}
                  compact
                  cardTheme={theme}
                  fullCardView
                  gradient={[...theme.gradient]}
                  section={section}
                  seamless
                />
              </View>
            ) : (
              <CardDetailSection cardTheme={theme} gradient={theme.gradient} section={section} />
            )}
            {activeSection === section.id ? <ActiveSectionHighlight /> : null}
            {onEditSection ? (
              <Pressable
                accessibilityLabel={`Customize ${section.title}`}
                onPress={() => onEditSection(section.id)}
                className="mb-2 items-center py-3"
                style={{ backgroundColor: theme.surfaceColor }}
              >
                <Text className="font-bold" style={{ color: theme.accentColor, fontFamily, letterSpacing }}>
                  Customize
                </Text>
              </Pressable>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
