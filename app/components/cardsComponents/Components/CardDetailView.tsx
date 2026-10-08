import { Pressable, View, useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import type { BusinessCard, CardSectionId } from '../types/card.types';
import type { Profile } from '@/components/profileComponents/types/profile.types';
import { Text } from '@/components/uiComponents/Text';
import { cardSectionHeight } from '../cardSectionLayout';
import { createCardDetailTemplate } from '../Templates/cardDetailTemplate';
import { SectionTemplateRenderer } from '../Templates/SectionTemplateRenderer';
import { getCardFontFamily, getCardLetterSpacing } from '../Templates/cardTheme';
import { ActiveSectionHighlight } from '@/components/editViewComponents/Components/ActiveSectionHighlight';

export function CardDetailView({
  activeSection,
  card,
  fitToViewport = false,
  fullBleed = false,
  onEditSection,
  onSectionLayout,
  profile,
  viewportHeight,
}: {
  activeSection?: CardSectionId;
  card: BusinessCard;
  fitToViewport?: boolean;
  fullBleed?: boolean;
  onEditSection?: (section: CardSectionId) => void;
  onSectionLayout?: (section: CardSectionId, y: number) => void;
  profile: Profile;
  viewportHeight?: number;
}) {
  const { height: windowHeight } = useWindowDimensions();
  const fittedHeight = viewportHeight ?? windowHeight;
  const sections = createCardDetailTemplate(card, profile);
  // An explicit viewport wins so the editor can ignore window resizes from the
  // sheet or keyboard. fitToViewport still squeezes every section into that box.
  const layoutViewportHeight = viewportHeight ?? (fitToViewport ? fittedHeight : windowHeight);

  const firstTheme = card.sectionThemes[sections[0]?.id];

  return (
    <View
      className={fullBleed ? 'overflow-hidden' : 'mb-5 overflow-hidden rounded-[28px] border shadow-sm'}
      style={{
        backgroundColor: firstTheme?.surfaceColor,
        height: fitToViewport ? fittedHeight : undefined,
        ...(fullBleed ? {} : { borderColor: firstTheme?.accentColor }),
      }}
    >
      {sections.map((section) => {
        const theme = card.sectionThemes[section.id];
        const fontFamily = getCardFontFamily(theme.fontStyle);
        const letterSpacing = getCardLetterSpacing(theme.fontStyle);
        const handleLayout = (event: LayoutChangeEvent) => onSectionLayout?.(section.id, event.nativeEvent.layout.y);
        const sectionHeight = cardSectionHeight(section.id, layoutViewportHeight);
        const contentDriven = section.id === 'professional' && !fitToViewport;
        return (
          <View key={section.id} onLayout={handleLayout} style={{ position: 'relative' }}>
            <View
              style={{
                height: contentDriven ? undefined : sectionHeight,
                width: '100%',
                overflow: 'hidden',
              }}
            >
              <SectionTemplateRenderer
                key={`${section.id}-${theme.backgroundColor}-${theme.surfaceColor}-${theme.textColorOverride ?? theme.textColor}-${theme.accentColor}-${theme.customThemeId ?? ''}`}
                compact
                cardTheme={theme}
                contentDriven={contentDriven}
                fullCardView
                gradient={[...theme.gradient]}
                preserveTypeScale
                section={section}
                seamless
              />
            </View>
            {activeSection === section.id ? <ActiveSectionHighlight /> : null}
            {onEditSection ? (
              <Pressable
                accessibilityLabel={`Customize ${section.title}`}
                accessibilityRole="button"
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
