import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Linking, Platform, Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useCards } from '@/pages/cards/Hooks/useCards';
import { useProfileSnapshot } from '@/pages/profile/Hooks/useProfileSnapshot';
import { useAddToWallet } from '@/pages/walletCard/Hooks/useAddToWallet';
import {
  QR_CUSTOMIZATION_PRESETS,
  QR_PRESET_STORAGE_KEY,
} from '../Config/shareActionsConfig';
import { saveOrShareQrCodePng, type QrSvgRef } from '../Services/qrExportService';
import type {
  QrCustomizationPreset,
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
  const [qrPresetId, setQrPresetId] = useState<string>(QR_CUSTOMIZATION_PRESETS[0].id);

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
      if (guide === 'lockscreen' || guide === 'homescreen' || guide === 'wallet') setGuideModal(guide);
      router.setParams({ cardId: undefined, guide: undefined });
    });
    return () => cancelAnimationFrame(frame);
  }, [cards, params.cardId, params.guide, router]);

  useEffect(() => {
    AsyncStorage.getItem(QR_PRESET_STORAGE_KEY)
      .then((savedId) => {
        if (savedId && QR_CUSTOMIZATION_PRESETS.some((p) => p.id === savedId)) {
          setQrPresetId(savedId);
        }
      })
      .catch(() => {});
  }, []);

  const selectQrPreset = useCallback((presetId: string) => {
    Haptics.selectionAsync().catch(() => {});
    setQrPresetId(presetId);
    AsyncStorage.setItem(QR_PRESET_STORAGE_KEY, presetId).catch(() => {});
  }, []);

  const activeQrPreset: QrCustomizationPreset = useMemo(
    () =>
      QR_CUSTOMIZATION_PRESETS.find((p) => p.id === qrPresetId) ??
      QR_CUSTOMIZATION_PRESETS[0],
    [qrPresetId],
  );

  const boundedIndex = cards.length > 0 ? Math.min(cardIndex, cards.length - 1) : 0;
  const card = cards[boundedIndex];
  const share = useShareUrl(card?.id ?? null);
  const wallet = useAddToWallet();

  const shareUrl = share.url;
  const shareError = share.error instanceof Error ? share.error.message : undefined;

  const cardLabel = useMemo(() => {
    if (!card) return 'No card';
    return card.category?.trim() || card.name || 'My card';
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

  const handleOpenHomeScreenPage = useCallback(() => {
    requireCardAndUrl((url) => {
      void Linking.openURL(url).catch(() => {
        Alert.alert('Could not open browser', 'Copy the card link and open it in Safari or Chrome.');
      });
    });
  }, [requireCardAndUrl]);

  const handleSaveQrToPhotos = useCallback(
    (dialogTitle?: string) => {
      requireCardAndUrl((url, cardName) => {
        void saveOrShareQrCodePng({
          qrSvg: qrSvgRef.current,
          cardName,
          shareUrl: url,
          dialogTitle,
        });
      });
    },
    [requireCardAndUrl],
  );

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
    selectQrPreset,
    setQrRef,
    handleActionPress,
    handleExportWalletPass,
    handleOpenHomeScreenPage,
    handleSaveQrToPhotos,
  };
}
