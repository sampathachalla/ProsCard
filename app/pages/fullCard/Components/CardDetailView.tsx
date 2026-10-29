import { useEffect, useState } from 'react';
import { Pressable, Share, View, useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import type { BusinessCard, CardSectionId, CardVisualTheme } from '@/pages/cards/types/card.types';
import type { Profile } from '@/pages/profile/types/profile.types';
import { Text } from '@/common/ui/Text';
import { cardSectionHeight } from '@/pages/cards/cardSectionLayout';
import { createCardDetailTemplate } from '@/pages/cards/Templates/cardDetailTemplate';
import { SectionTemplateRenderer } from '@/pages/cards/Templates/SectionTemplateRenderer';
import { getCardFontFamily, getCardLetterSpacing } from '@/pages/cards/Templates/cardTheme';
import { ActiveSectionHighlight } from '@/pages/editView/Components/ActiveSectionHighlight';
import { extractLogoPalette, getCachedLogoPalette } from '@/pages/profile/Services/mediaService';
import { useCardTagDesignPreference } from '@/pages/profile/Hooks/useCardTagDesignPreference';
import { useLogoThemePreference } from '@/pages/profile/Hooks/useLogoThemePreference';
import { saveDirectlyToNativeContacts } from '@/utils/nativeContacts';
import { getShareUrl } from '@/pages/share/Services/sharingService';
import {
  buildThemeFromLogoPalette,
  resolveCardChromeBorder,
  resolveFullCardOuterChromeStyle,
  resolveLayoutColorSlots,
} from '@/utils/cardThemeColor';
import { resolveCardSectionTheme, resolveCardTag, savedSectionTheme } from '@/pages/addCard/Config/cardTagDesignPresets';
import { resolveCardDisplayMedia } from '@/pages/cards/Utils/resolveCardDisplayMedia';

export function CardDetailView({
  activeSection,
  card,
  fitToViewport = false,
  fullBleed = false,
  interactiveActions = true,
  onEditSection,
  onSectionLayout,
  profile,
  vcardDownloadUrl,
  viewportHeight,
  /** Public share links: always render the owner’s saved themes (no viewer logo/tag overrides). */
  publicShareView = false,
}: {
  activeSection?: CardSectionId;
  card: BusinessCard;
  fitToViewport?: boolean;
  fullBleed?: boolean;
  interactiveActions?: boolean;
  onEditSection?: (section: CardSectionId) => void;
  onSectionLayout?: (section: CardSectionId, y: number) => void;
  profile: Profile;
  vcardDownloadUrl?: string;
  viewportHeight?: number;
  publicShareView?: boolean;
}) {
  const { height: windowHeight } = useWindowDimensions();
  const fittedHeight = viewportHeight ?? windowHeight;
  // Resolve card/account media once for the entire preview. Logo-adapted themes
  // may read the logo, but must never change the inherited profile or cover image.
  const displayCard = resolveCardDisplayMedia(card, profile);
  const sections = createCardDetailTemplate(displayCard, profile);
  // An explicit viewport wins so the editor can ignore window resizes from the
  // sheet or keyboard. fitToViewport still squeezes every section into that box.
  const layoutViewportHeight = viewportHeight ?? (fitToViewport ? fittedHeight : windowHeight);
  const { enabled: logoThemesEnabled } = useLogoThemePreference();
  const { enabled: tagDesignEnabled } = useCardTagDesignPreference();
  const isEditing = Boolean(activeSection || onEditSection);
  // Only the editor previews toggle-driven themes; they are baked into the card on save, so every
  // saved view (phone and public share link) renders the same stored theme.
  const applyLiveThemeOverrides = !publicShareView && isEditing;

  const logoUrl = displayCard.sectionOverrides.logo;
  const cardTag = resolveCardTag(card);
  const [logoTheme, setLogoTheme] = useState<CardVisualTheme | null>(() => {
    if (!applyLiveThemeOverrides || !logoThemesEnabled || !logoUrl) return null;
    const cached = getCachedLogoPalette(logoUrl);
    return cached ? buildThemeFromLogoPalette(cached, card.cardTheme?.fontStyle, cardTag) : null;
  });

  useEffect(() => {
    if (!applyLiveThemeOverrides || !logoThemesEnabled) return;
    if (!logoUrl || card.cardTheme?.customThemeId) return;
    const cached = getCachedLogoPalette(logoUrl);
    if (cached) {
      setLogoTheme(buildThemeFromLogoPalette(cached, card.cardTheme?.fontStyle, cardTag));
      return;
    }
    let active = true;
    extractLogoPalette({ imageUrl: logoUrl })
      .then((palette) => {
        if (active && palette) {
          setLogoTheme(buildThemeFromLogoPalette(palette, card.cardTheme?.fontStyle, cardTag));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [
    applyLiveThemeOverrides,
    logoThemesEnabled,
    logoUrl,
    cardTag,
    card.cardTheme?.customThemeId,
    card.cardTheme?.fontStyle,
  ]);

  const effectiveThemeForSection = (sectionId: CardSectionId) => {
    if (!applyLiveThemeOverrides) {
      return savedSectionTheme(card, sectionId);
    }
    return resolveCardSectionTheme(sectionId, card, {
      tagDesignEnabled,
      logoThemesEnabled,
      logoTheme,
    });
  };

  const firstTheme = effectiveThemeForSection(sections[0]?.id);

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
      vcardDownloadUrl,
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
        : `Check out ${card.name}'s digital business card on VC Pros!`;
      await Share.share({
        message,
        title: `${card.name} | VC Pros`,
        url: shareUrl || undefined,
      });
    } catch {
      // Ignored
    }
  };

  const chromeBorder = resolveCardChromeBorder(
    firstTheme?.surfaceColor ?? '#ffffff',
    firstTheme?.accentColor,
  );

  const outerChrome = resolveFullCardOuterChromeStyle({
    chromeBorder: fullBleed ? chromeBorder : (firstTheme?.accentColor ?? chromeBorder),
    fitToViewport,
    fittedHeight: fitToViewport ? fittedHeight : undefined,
    surfaceColor: firstTheme?.surfaceColor ?? '#ffffff',
  });

  return (
    <View
      style={[
        outerChrome,
        // The public share page shows the card edge to edge, so its outer corners stay square.
        publicShareView
          ? { borderRadius: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
          : null,
        fullBleed
          ? null
          : {
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 2,
              elevation: 1,
            },
      ]}
    >
      {sections.map((section) => {
        const theme = effectiveThemeForSection(section.id);
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
                key={`${card.id}-${section.id}-${section.fields.map((field) => field.type === 'image' ? field.value : '').join('|')}-${theme.backgroundColor}-${theme.surfaceColor}-${theme.textColorOverride ?? theme.textColor}-${theme.accentColor}-${theme.customThemeId ?? ''}`}
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
                interactiveActions={interactiveActions && !isEditing}
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
