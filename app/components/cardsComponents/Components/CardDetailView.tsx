import { Pressable, Share, View, useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import type { BusinessCard, CardSectionId } from '../types/card.types';
import type { Profile } from '@/components/profileComponents/types/profile.types';
import { Text } from '@/components/uiComponents/Text';
import { cardSectionHeight } from '../cardSectionLayout';
import { createCardDetailTemplate } from '../Templates/cardDetailTemplate';
import { SectionTemplateRenderer } from '../Templates/SectionTemplateRenderer';
import { getCardFontFamily, getCardLetterSpacing } from '../Templates/cardTheme';
import { ActiveSectionHighlight } from '@/components/editViewComponents/Components/ActiveSectionHighlight';
import { saveDirectlyToNativeContacts } from '@/utils/nativeContacts';
import { getShareUrl } from '@/components/sharingComponents/Services/sharingService';
import { resolveLayoutColorSlots } from '@/utils/cardThemeColor';

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
  const isEditing = Boolean(activeSection || onEditSection);

  const handleSaveContact = () => {
    const socials: { label?: string; type?: string; url: string }[] = [];

    if (profile.social) {
      Object.entries(profile.social).forEach(([key, value]) => {
        if (value && typeof value === 'string' && value.trim()) {
          socials.push({ label: key, type: key, url: value.trim() });
        }
      });
    }

    if (card.connectionFields) {
      card.connectionFields.forEach((field) => {
        if (field.value && typeof field.value === 'string' && field.value.trim()) {
          if (!socials.some((s) => s.url === field.value.trim())) {
            socials.push({
              label: field.title || field.type,
              type: field.type,
              url: field.value.trim(),
            });
          }
        }
      });
    }

    const photoUrl =
      card.sectionOverrides?.profilePhoto ||
      profile.photoUrl ||
      undefined;

    const note = [profile.tagline, profile.shortBio].filter(Boolean).join('\n\n');

    void saveDirectlyToNativeContacts({
      name: card.name || profile.fullName,
      firstName: profile.firstName,
      lastName: profile.lastName,
      title: card.title || profile.title,
      company: card.company || profile.organization,
      department: profile.department,
      email: card.email || profile.email,
      phone: card.phone || profile.phone,
      website: profile.website,
      address: profile.businessAddress,
      note,
      photoUrl,
      socials,
    });
  };

  const handleShareCard = async () => {
    try {
      let shareUrl = '';
      try {
        shareUrl = await getShareUrl(card.id);
      } catch {
        // Fallback
      }
      const message = shareUrl
        ? `Check out ${card.name}'s digital business card: ${shareUrl}`
        : `Check out ${card.name}'s digital business card on ProsCard!`;
      await Share.share({
        message,
        title: `${card.name} | ProsCard`,
        url: shareUrl || undefined,
      });
    } catch {
      // Ignored
    }
  };

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
        const contentDriven = (section.id === 'professional' || section.id === 'connections') && !fitToViewport;
        const bioText = section.id === 'professional' ? section.fields.find((field) => field.id === 'bio')?.value.trim() : '';
        const showBio =
          section.id === 'professional' &&
          section.fields.find((field) => field.id === 'bioEnabled')?.value === 'true' &&
          Boolean(bioText);
        const sectionSlots = resolveLayoutColorSlots({ templateId: section.templateId, theme });
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
                cardMetadata={{
                  name: card.name,
                  title: card.title,
                  company: card.company,
                  id: card.id,
                }}
                compact
                cardTheme={theme}
                contentDriven={contentDriven}
                fullCardView
                gradient={[...theme.gradient]}
                interactiveActions={!isEditing}
                onSaveContact={handleSaveContact}
                onShareCard={handleShareCard}
                preserveTypeScale
                section={section}
                seamless
              />
            </View>
            {showBio ? (
              <View
                style={{
                  backgroundColor: sectionSlots.surface,
                  paddingBottom: 12,
                  paddingHorizontal: 20,
                  paddingTop: 8,
                }}
              >
                <Text
                  variant="none"
                  numberOfLines={3}
                  style={{
                    color: sectionSlots.surfaceTextSecondary,
                    fontFamily,
                    fontSize: 16,
                    letterSpacing,
                    lineHeight: 23,
                  }}
                >
                  {bioText}
                </Text>
              </View>
            ) : null}
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
