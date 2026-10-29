import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, AppState, Linking, Platform, Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useCards } from '@/pages/cards/Hooks/useCards';
import { useProfileSnapshot } from '@/pages/profile/Hooks/useProfileSnapshot';
import { useAddToWallet } from '@/pages/walletCard/Hooks/useAddToWallet';
import {
  DEFAULT_QR_CUSTOMIZATION,
  QR_CUSTOMIZATION_PRESETS,
  QR_CUSTOMIZATION_STORAGE_KEY,
} from '../Config/shareActionsConfig';
import { saveOrShareQrCodePng, type QrSvgRef } from '../Services/qrExportService';
import { prepareHomeScreenWidget } from '../Services/homeScreenWidgetService';
import {
  isCardLiveActivityRunning,
  startCardLiveActivity,
  stopCardLiveActivity,
} from '../Services/liveActivityService';
import type {
  QrCustomizationPreset,
  QrCustomization,
  ShareActionId,
  ShareGuideModalKind,
} from '../types/share.types';
import {
  buildCardShareMessage,
  buildEmailShareUrl,
  buildInstagramShareUrl,
  buildLinkedInShareUrl,
  buildWhatsAppShareUrl,
  buildXShareUrl,
  copyTextToClipboard,
} from '../Utils/shareFormatters';
import { useShareUrl } from './useShareUrl';

export function useSharePageController() {
  const { cards, fetched, offline } = useCards();
  const { profile } = useProfileSnapshot();
  const [cardIndex, setCardIndex] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [guideModal, setGuideModal] = useState<ShareGuideModalKind>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrCustomization, setQrCustomization] = useState<QrCustomization>(DEFAULT_QR_CUSTOMIZATION);
  const [liveActivityActive, setLiveActivityActive] = useState(false);
  const qrSvgRef = useRef<QrSvgRef | null>(null);
  const router = useRouter();
  const params = useLocalSearchParams<{ cardId?: string; guide?: string }>();

  // Other screens can open this page on a card with a guide showing,
  // e.g. /(tabs)/sharePage?cardId=…&guide=lockscreen from the card menu.
  useEffect(() => {
    if (!params.cardId && !params.guide) return;
    const index = cards.findIndex((item) => item.id === params.cardId);
    if (params.cardId && index < 0) return; // Wait until the cards have loaded.
    const guide = params.guide;
    const frame = requestAnimationFrame(() => {
      if (index >= 0) setCardIndex(index);
      if (guide === 'lockscreen' || guide === 'homescreen' || guide === 'wallet' || guide === 'liveactivity') {
        setGuideModal(guide);
      }
      router.setParams({ cardId: undefined, guide: undefined });
    });
    return () => cancelAnimationFrame(frame);
  }, [cards, params.cardId, params.guide, router]);

  useEffect(() => {
    const refresh = () => {
      isCardLiveActivityRunning().then(setLiveActivityActive).catch(() => {});
    };
    refresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => subscription.remove();
  }, []);

  const boundedIndex = cards.length > 0 ? Math.min(cardIndex, cards.length - 1) : 0;
  const card = cards[boundedIndex];

  useEffect(() => {
    if (!card?.id) {
      setQrCustomization(DEFAULT_QR_CUSTOMIZATION);
      return;
    }
    let cancelled = false;
    setQrCustomization(DEFAULT_QR_CUSTOMIZATION);
    AsyncStorage.getItem(QR_CUSTOMIZATION_STORAGE_KEY)
      .then((raw) => {
        const saved = raw ? JSON.parse(raw) as Record<string, Partial<QrCustomization>> : {};
        if (!cancelled) setQrCustomization({ ...DEFAULT_QR_CUSTOMIZATION, ...(saved[card.id] ?? {}) });
      })
      .catch(() => { if (!cancelled) setQrCustomization(DEFAULT_QR_CUSTOMIZATION); });
    return () => { cancelled = true; };
  }, [card?.id]);

  const updateQrCustomization = useCallback((patch: Partial<QrCustomization>) => {
    Haptics.selectionAsync().catch(() => {});
    setQrCustomization((current) => {
      const next = { ...current, ...patch };
      if (card?.id) {
        AsyncStorage.getItem(QR_CUSTOMIZATION_STORAGE_KEY)
          .then((raw) => {
            const saved = raw ? JSON.parse(raw) as Record<string, QrCustomization> : {};
            saved[card.id] = next;
            return AsyncStorage.setItem(QR_CUSTOMIZATION_STORAGE_KEY, JSON.stringify(saved));
          })
          .catch(() => {});
      }
      return next;
    });
  }, [card?.id]);

  const activeQrPreset: QrCustomizationPreset = useMemo(
    () => card?.appliedTheme ? {
      id: 'card-theme',
      label: 'Card theme',
      foregroundColor: card.appliedTheme.textColor,
      // Logo-generated themes guarantee readable text on their surface color.
      // Reuse that tested pair for the QR instead of guessing from the gradient.
      backgroundColor: card.appliedTheme.surfaceColor,
      accentColor: card.appliedTheme.accentColor,
    } : QR_CUSTOMIZATION_PRESETS.find((p) => p.id === qrCustomization.presetId) ?? QR_CUSTOMIZATION_PRESETS[0],
    [card?.appliedTheme, qrCustomization.presetId],
  );

  const centerLogoUrl = card?.sectionOverrides.logo?.trim() || profile.companyLogoUrl?.trim() || '';
  const centerLogoBackground = card?.sectionOverrides.logoBackdrop?.trim()
    || card?.appliedTheme?.surfaceColor?.trim()
    || undefined;
  const centerLogoBorderColor = card?.appliedTheme?.accentColor?.trim()
    || activeQrPreset.accentColor;
  const share = useShareUrl(card?.id ?? null);
  const wallet = useAddToWallet();

  const shareUrl = share.url;
  const shareError = share.error instanceof Error ? share.error.message : undefined;

  const cardLabel = useMemo(() => {
    if (!card) return 'No card';
    return card.sectionOverrides?.cardTag?.trim() || card.category?.trim() || card.name || 'My card';
  }, [card]);

  const setQrRef = useCallback((ref: QrSvgRef | null) => {
    qrSvgRef.current = ref;
  }, []);

  const requireCardAndUrl = useCallback(
    (action: (url: string, cardName: string) => void) => {
      if (!card) {
        Alert.alert('No card yet', 'Create a card on the Cards tab first.');
        return;
      }
      if (!shareUrl) {
        Alert.alert('Share link unavailable', shareError ?? 'Try again in a moment.');
        return;
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      action(shareUrl, card.name || profile.fullName || 'VC Pros');
    },
    [card, profile.fullName, shareError, shareUrl],
  );

  const handleCopyLink = useCallback(
    async (url: string) => {
      const copied = await copyTextToClipboard(url);
      setCopiedLink(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setTimeout(() => setCopiedLink(false), 2200);
      if (!copied && Platform.OS !== 'web') {
        await Share.share({
          message: url,
          url: Platform.OS === 'ios' ? url : undefined,
          title: 'Copy Card Link',
        });
      }
    },
    [],
  );

  const handleExportWalletPass = useCallback(() => {
    if (!card) return;
    void wallet.addToWallet(card.id, card.name || profile.fullName);
  }, [card, profile.fullName, wallet]);

  const handleSaveQrToPhotos = useCallback(
    (dialogTitle?: string) => {
      requireCardAndUrl((url, cardName) => {
        void saveOrShareQrCodePng({
          qrSvg: qrSvgRef.current,
          cardName,
          shareUrl: url,
          dialogTitle,
          format: qrCustomization.exportFormat,
        });
      });
    },
    [qrCustomization.exportFormat, requireCardAndUrl],
  );

  const handlePrepareHomeScreenWidget = useCallback(async (target: 'homescreen' | 'lockscreen' = 'homescreen') => {
    if (!card || !shareUrl) {
      Alert.alert('Widget unavailable', shareError ?? 'Wait for your card link, then try again.');
      return;
    }
    try {
      const result = await prepareHomeScreenWidget({
        cardName: card.name || profile.fullName || 'My VC Card',
        qrSvg: qrSvgRef.current,
        shareUrl,
      });
      if (result === 'requires-native-build') {
        Alert.alert(
          'Native build required',
          'Home-screen widgets are not available in Expo Go. Install the next VC Pros TestFlight build to use this feature.',
        );
        return;
      }
      if (result === 'unsupported') {
        Alert.alert('Not supported', 'Home-screen widgets are available on iPhone and Android.');
        return;
      }
      if (target === 'lockscreen') {
        Alert.alert(
          'Lock Screen widget is ready',
          'Touch and hold your Lock Screen, tap Customize, choose Lock Screen, tap the widget area below the clock, then choose VC Pros QR Card.',
        );
        return;
      }
      Alert.alert(
        'Widget is ready',
        Platform.OS === 'ios'
          ? 'Touch and hold your Home Screen, tap Edit, tap Add Widget, then choose VC Pros QR Card.'
          : 'Touch and hold your Home Screen, tap Widgets, then choose VC Pros QR Card.',
      );
    } catch (error) {
      Alert.alert(
        'Could not prepare widget',
        error instanceof Error ? error.message : 'Try again in a moment.',
      );
    }
  }, [card, profile.fullName, shareError, shareUrl]);

  const handleStartLiveActivity = useCallback(async () => {
    if (!card || !shareUrl) {
      Alert.alert('Live Activity unavailable', shareError ?? 'Wait for your card link, then try again.');
      return;
    }
    try {
      const result = await startCardLiveActivity({
        cardName: card.name || profile.fullName || 'My VC Card',
        qrSvg: qrSvgRef.current,
        shareUrl,
      });
      if (result === 'requires-native-build') {
        Alert.alert('Native build required', 'Install the VC Pros TestFlight build to use Live Activities.');
        return;
      }
      if (result === 'unsupported') {
        Alert.alert('Not supported', 'Live Activities are available on iPhone only.');
        return;
      }
      setLiveActivityActive(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      Alert.alert(
        result === 'updated' ? 'Live Activity updated' : 'Live Activity started',
        'Your QR is now on the Lock Screen and in the Dynamic Island.',
      );
    } catch (error) {
      Alert.alert(
        'Could not start Live Activity',
        error instanceof Error ? `${error.message}\n\nCheck Settings → VC Pros → Live Activities is turned on.` : 'Try again in a moment.',
      );
    }
  }, [card, profile.fullName, shareError, shareUrl]);

  const handleStopLiveActivity = useCallback(async () => {
    try {
      await stopCardLiveActivity();
      setLiveActivityActive(false);
    } catch (error) {
      Alert.alert('Could not stop Live Activity', error instanceof Error ? error.message : 'Try again in a moment.');
    }
  }, []);

  const handleActionPress = useCallback(
    (actionId: ShareActionId) => {
      switch (actionId) {
        case 'share_card':
          requireCardAndUrl((url, cardName) => {
            void Share.share({
              message: buildCardShareMessage(cardName, url),
              title: `${cardName} | VC Pros`,
              url: Platform.OS === 'ios' ? url : undefined,
            });
          });
          break;

        case 'copy_link':
          requireCardAndUrl((url) => {
            void handleCopyLink(url);
          });
          break;

        case 'add_to_wallet':
          if (!card) {
            Alert.alert('No card yet', 'Create a card on the Cards tab first.');
            return;
          }
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          setGuideModal('wallet');
          break;

        case 'add_qr_lockscreen':
          if (!card) {
            Alert.alert('No card yet', 'Create a card on the Cards tab first.');
            return;
          }
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          setGuideModal('lockscreen');
          break;

        case 'add_qr_homescreen':
          if (!card) {
            Alert.alert('No card yet', 'Create a card on the Cards tab first.');
            return;
          }
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          setGuideModal('homescreen');
          break;

        case 'show_live_activity':
          if (!card) {
            Alert.alert('No card yet', 'Create a card on the Cards tab first.');
            return;
          }
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          setGuideModal('liveactivity');
          break;

        case 'share_email':
          requireCardAndUrl((url, cardName) => {
            void Linking.openURL(buildEmailShareUrl(cardName, url));
          });
          break;

        case 'share_namedrop':
          if (!card) {
            Alert.alert('No card yet', 'Create a card on the Cards tab first.');
            return;
          }
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          setGuideModal('namedrop');
          break;

        case 'share_linkedin':
          requireCardAndUrl((url) => {
            void Linking.openURL(buildLinkedInShareUrl(url));
          });
          break;

        case 'share_whatsapp':
          requireCardAndUrl((url, cardName) => {
            const { appUrl, webUrl } = buildWhatsAppShareUrl(cardName, url);
            void Linking.openURL(appUrl).catch(() => {
              void Linking.openURL(webUrl);
            });
          });
          break;

        case 'share_instagram':
          requireCardAndUrl((url) => {
            void copyTextToClipboard(url);
            const { appUrl, webUrl } = buildInstagramShareUrl();
            void Linking.openURL(appUrl).catch(() => {
              void Linking.openURL(webUrl);
            });
          });
          break;

        case 'share_x':
          requireCardAndUrl((url, cardName) => {
            const { appUrl, webUrl } = buildXShareUrl(cardName, url);
            void Linking.openURL(appUrl).catch(() => {
              void Linking.openURL(webUrl);
            });
          });
          break;

        case 'save_qr_photos':
          handleSaveQrToPhotos('Save QR Code to Photos');
          break;

        case 'customize_qr':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          setCustomizeOpen(true);
          break;
      }
    },
    [card, handleCopyLink, handleSaveQrToPhotos, requireCardAndUrl],
  );

  return {
    cards,
    card,
    cardLabel,
    centerLogoUrl,
    centerLogoBackground,
    centerLogoBorderColor,
    boundedIndex,
    setCardIndex,
    pickerOpen,
    setPickerOpen,
    fetched,
    offline,
    shareUrl,
    shareLoading: share.loading,
    shareError,
    copiedLink,
    qrModalOpen,
    setQrModalOpen,
    customizeOpen,
    setCustomizeOpen,
    guideModal,
    setGuideModal,
    activeQrPreset,
    qrCustomization,
    updateQrCustomization,
    setQrRef,
    handleActionPress,
    handleExportWalletPass,
    handlePrepareHomeScreenWidget,
    handleSaveQrToPhotos,
    liveActivityActive,
    handleStartLiveActivity,
    handleStopLiveActivity,
  };
}
