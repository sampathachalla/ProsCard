import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown } from 'lucide-react-native';

import { QRCodeModal } from '@/common/ui/QRCodeModal';
import { Text } from '@/common/ui/Text';
import { useThemeContext } from '@/context/ThemeContext';
import { CustomizeQrModal } from './Components/CustomizeQrModal';
import { ShareActionsList } from './Components/ShareActionsList';
import { ShareFeatureGuideModal } from './Components/ShareFeatureGuideModal';
import { SharePageLayout } from './Components/SharePageLayout';
import { ShareQrHeroCard } from './Components/ShareQrHeroCard';
import { useSharePageController } from './Hooks/useSharePageController';

export default function ShareTabPage() {
  const insets = useSafeAreaInsets();
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  const {
    cards,
    card,
    cardLabel,
    centerLogoUrl,
    boundedIndex,
    setCardIndex,
    pickerOpen,
    setPickerOpen,
    fetched,
    offline,
    shareUrl,
    shareLoading,
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
    handlePrepareHomeScreenWidget,
    handleSaveQrToPhotos,
  } = useSharePageController();

  const headerSection = (
    <View>
      <View className="flex-row items-center justify-between">
        <View>
          <Text
            variant="none"
            className="text-[28px] font-bold tracking-tight text-textPrimary dark:text-dark-textPrimary"
          >
            Share
          </Text>
          <Text
            variant="none"
            className="mt-0.5 text-[14px] font-normal text-slate-500 dark:text-slate-400"
          >
            Scan your QR code or share your card anywhere
          </Text>
        </View>

        {cards.length > 1 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Active card ${cardLabel}. Tap to switch card.`}
            onPress={() => setPickerOpen((open) => !open)}
            className="h-10 flex-row items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-100 px-3.5 active:opacity-85 dark:border-slate-800 dark:bg-dark-card"
          >
            <Text
              variant="none"
              numberOfLines={1}
              className="max-w-[120px] text-[14px] font-semibold text-textPrimary dark:text-dark-textPrimary"
            >
              {cardLabel}
            </Text>
            <ChevronDown
              size={16}
              color={isDark ? '#94a3b8' : '#64748b'}
              strokeWidth={2.2}
            />
          </Pressable>
        ) : null}
      </View>

      {cards.length > 1 && pickerOpen ? (
        <View className="mt-2.5 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100 p-1 dark:border-slate-800 dark:bg-dark-card">
          {cards.map((item, index) => {
            const isSelected = index === boundedIndex;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                onPress={() => {
                  setCardIndex(index);
                  setPickerOpen(false);
                }}
                className={`rounded-lg px-3.5 py-2.5 ${
                  isSelected ? 'bg-primary/10 dark:bg-sky-500/15' : ''
                }`}
              >
                <Text
                  variant="none"
                  className={`text-[15px] ${
                    isSelected
                      ? 'font-semibold text-primary dark:text-sky-400'
                      : 'font-normal text-textPrimary dark:text-dark-textPrimary'
                  }`}
                >
                  {item.category?.trim() || item.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );

  const qrHeroSection = (
    <ShareQrHeroCard
      cardName={card?.name ?? 'VC Pros Card'}
      cardCategory={card?.category}
      shareUrl={shareUrl}
      loading={shareLoading || !fetched}
      error={shareError}
      preset={activeQrPreset}
      centerLogoUrl={centerLogoUrl}
      onQrRef={setQrRef}
      onPressExpand={() => setQrModalOpen(true)}
    />
  );

  const actionsListSection = (
    <ShareActionsList
      copiedLink={copiedLink}
      activeQrPresetLabel={activeQrPreset.label}
      onActionPress={handleActionPress}
    />
  );

  const footerSection = offline ? (
    <Text
      variant="none"
      className="text-center text-[13px] text-slate-500 dark:text-slate-400"
    >
      You are offline. Some share actions may require an internet connection.
    </Text>
  ) : null;

  return (
    <>
      <SharePageLayout
        topInset={Math.max(insets.top, 12)}
        bottomInset={Math.max(insets.bottom, 12)}
        header={headerSection}
        qrHero={qrHeroSection}
        actionsList={actionsListSection}
        footer={footerSection}
      />

      <QRCodeModal
        visible={qrModalOpen}
        cardName={card?.name ?? 'VC Pros'}
        url={shareUrl}
        error={shareError}
        centerLogoUrl={centerLogoUrl}
        onClose={() => setQrModalOpen(false)}
      />

      <CustomizeQrModal
        visible={customizeOpen}
        shareUrl={shareUrl}
        activePreset={activeQrPreset}
        centerLogoUrl={centerLogoUrl}
        onSelectPreset={selectQrPreset}
        onClose={() => setCustomizeOpen(false)}
      />

      <ShareFeatureGuideModal
        kind={guideModal}
        cardName={card?.name ?? 'VC Pros'}
        shareUrl={shareUrl}
        onClose={() => setGuideModal(null)}
        onExportWalletPass={handleExportWalletPass}
        onPrepareHomeScreenWidget={handlePrepareHomeScreenWidget}
        onSaveQrImage={handleSaveQrToPhotos}
      />
    </>
  );
}
