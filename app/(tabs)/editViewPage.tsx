import { useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlignLeft, BriefcaseBusiness, Eye, Link2, RotateCcw, Save as SaveIcon, UserRound, Wrench, type LucideIcon } from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PageHeader } from '@/components/uiComponents/PageHeader';
import { ThemedBottomSheet } from '@/components/uiComponents/ThemedBottomSheet';
import { Text } from '@/components/uiComponents/Text';
import { EditHomeBar, type EditHomeTab } from '@/components/uiComponents/EditHomeBar';
import { CardDetailView } from '@/components/cardsComponents/Components/CardDetailView';
import { CardSectionEditor } from '@/components/editViewComponents/Components/CardSectionEditor';
import { useProfileSnapshot } from '@/components/profileComponents/Hooks/useProfileSnapshot';
import type { CardSectionId } from '@/components/cardsComponents/types/card.types';
import { useEditView } from '@/components/editViewComponents/Hooks/useEditView';
import { CardTapGesture } from '@/components/gestures';

const SECTION_TITLES: Record<CardSectionId, string> = {
  identity: 'Identity', professional: 'Professional identity', bio: 'About', connections: 'Contact & links',
};
const SECTION_CHOICES: { id: CardSectionId; title: string; description: string; icon: LucideIcon }[] = [
  { id: 'identity', title: 'Identity', description: 'Name, cover, profile photo and logo', icon: UserRound },
  { id: 'professional', title: 'Professional', description: 'Name details, title and company', icon: BriefcaseBusiness },
  { id: 'bio', title: 'About', description: 'Short professional biography', icon: AlignLeft },
  { id: 'connections', title: 'Contact & links', description: 'Email, phone and social links', icon: Link2 },
];

export default function EditViewPage() {
  const params = useLocalSearchParams<{ cardId?: string | string[] }>();
  const cardId = Array.isArray(params.cardId) ? params.cardId[0] : params.cardId;
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const { profile } = useProfileSnapshot();
  const sheetRef = useRef<BottomSheet>(null);
  const cardScrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Partial<Record<CardSectionId, number>>>({});
  const previewScrollY = useRef(0);
  const previewDragStartY = useRef<number | null>(null);
  const previewDragCurrentY = useRef<number | null>(null);
  const sectionPickerScrollY = useRef(0);
  const sectionPickerDragStartY = useRef<number | null>(null);
  const sectionPickerDragCurrentY = useRef<number | null>(null);
  const snapPoints = useMemo(() => ['55%', '100%'], []);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [activeSection, setActiveSection] = useState<CardSectionId>('identity');
  const [activeEditTab, setActiveEditTab] = useState<EditHomeTab>('layout');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [sectionPickerOpen, setSectionPickerOpen] = useState(false);
  const { card, draft, hasChanges, hasSectionChanges, isEditing, isSaving, startEditing, stopEditing, cancelEditing, updateSectionLayout, updateSectionField, replaceConnectionFields, updateSectionTheme, submit, submitSection } = useEditView(cardId, false);

  const openSection = (section: CardSectionId) => {
    startEditing();
    setSectionPickerOpen(false);
    setActiveSection(section);
    requestAnimationFrame(() => {
      sheetRef.current?.snapToIndex(0);
      requestAnimationFrame(() => {
        const sectionY = sectionOffsets.current[section];
        if (sectionY !== undefined) {
          cardScrollRef.current?.scrollTo({ y: Math.max(0, sectionY - 8), animated: true });
        }
      });
    });
  };

  const openSectionPicker = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSectionPickerOpen(true);
  };
  const chooseSection = (section: CardSectionId) => {
    Haptics.selectionAsync().catch(() => {});
    setSectionPickerOpen(false);
    requestAnimationFrame(() => openSection(section));
  };
  const startSectionPickerDrag = (pageY: number) => {
    sectionPickerDragStartY.current = sectionPickerScrollY.current <= 2 ? pageY : null;
    sectionPickerDragCurrentY.current = pageY;
  };
  const finishSectionPickerDrag = () => {
    const startY = sectionPickerDragStartY.current;
    const currentY = sectionPickerDragCurrentY.current;
    sectionPickerDragStartY.current = null;
    sectionPickerDragCurrentY.current = null;
    if (startY !== null && currentY !== null && currentY - startY >= 64) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      setSectionPickerOpen(false);
    }
  };

  const closeEditor = () => sheetRef.current?.close();
  const handleHeaderBack = () => {
    if (isEditing) {
      closeEditor();
      return;
    }
    if (sectionPickerOpen) {
      setSectionPickerOpen(false);
      return;
    }
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/homepage');
  };
  const saveSection = async () => {
    await submitSection(activeSection);
  };
  const saveAllChanges = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    await submit();
  };
  const undoAllChanges = () => {
    if (!hasChanges || isSaving) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    cancelEditing();
  };
  const previewCard = () => {
    Haptics.selectionAsync().catch(() => {});
    setPreviewVisible(true);
  };
  const closePreview = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setPreviewVisible(false);
  };
  const startPreviewDrag = (pageY: number) => {
    previewDragStartY.current = previewScrollY.current <= 2 ? pageY : null;
    previewDragCurrentY.current = pageY;
  };
  const finishPreviewDrag = () => {
    const startY = previewDragStartY.current;
    const currentY = previewDragCurrentY.current;
    previewDragStartY.current = null;
    previewDragCurrentY.current = null;
    if (startY !== null && currentY !== null && currentY - startY >= 72) closePreview();
  };
  const previewCardData = isEditing ? draft : card;

  return <View className="flex-1 bg-background dark:bg-dark-background">
    <View onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}>
      <PageHeader
        title={isEditing ? `Edit ${SECTION_TITLES[activeSection]}` : 'Edit Card'}
        subtitle={isEditing ? 'Swipe down or double tap to close without saving' : (card.name || 'Choose a section to customize')}
        onBackPress={handleHeaderBack}
        right={isEditing ? (
          <Pressable
            accessibilityLabel={`Preview ${card.name || 'card'}`}
            accessibilityRole="button"
            onPress={previewCard}
            className="flex-row items-center rounded-full border border-primary px-3 py-2 active:opacity-70 dark:border-dark-primary"
          >
            <Eye color="#3b82f6" size={17} />
            <Text className="ml-1.5 text-sm font-bold text-primary dark:text-dark-primary">Preview</Text>
          </Pressable>
        ) : (
          <View className="flex-row items-center gap-2">
            {hasChanges ? (
              <Pressable
                accessibilityLabel="Undo all unsaved card changes"
                accessibilityRole="button"
                accessibilityState={{ disabled: isSaving }}
                className="h-11 w-11 items-center justify-center rounded-full border border-amber-500 bg-amber-500"
                disabled={isSaving}
                onPress={undoAllChanges}
              >
                <RotateCcw color="#ffffff" size={20} />
              </Pressable>
            ) : null}
            <Pressable
              accessibilityLabel={hasChanges ? 'Save all card changes' : 'No card changes to save'}
              accessibilityRole="button"
              accessibilityState={{ disabled: !hasChanges || isSaving, busy: isSaving }}
              className={`h-11 w-11 items-center justify-center rounded-full border ${hasChanges ? 'border-emerald-500 bg-emerald-600' : 'border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800'}`}
              disabled={!hasChanges || isSaving}
              onPress={saveAllChanges}
            >
              <SaveIcon color={hasChanges ? '#ffffff' : '#94a3b8'} size={20} />
            </Pressable>
          </View>
        )}
      />
    </View>
    <ScrollView
      ref={cardScrollRef}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: isEditing ? Math.max(120, windowHeight * 0.62) : 40 }}
      showsVerticalScrollIndicator={false}
    >
      <CardDetailView
        card={isEditing ? draft : card}
        profile={profile}
        onSectionLayout={(section, y) => { sectionOffsets.current[section] = y; }}
      />
    </ScrollView>

    {!isEditing && !sectionPickerOpen ? (
      <Pressable
        accessibilityLabel="Choose a card section to customize"
        accessibilityRole="button"
        className="absolute right-5 h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-primary shadow-lg shadow-black/30 active:scale-95 dark:bg-dark-primary"
        onPress={openSectionPicker}
        style={{
          bottom: Math.max(safeAreaInsets.bottom + 18, 24),
          elevation: 24,
          zIndex: 200,
        }}
      >
        <Wrench color="#ffffff" size={23} strokeWidth={2.4} />
      </Pressable>
    ) : null}

    <Modal animationType="fade" onRequestClose={() => setSectionPickerOpen(false)} presentationStyle="overFullScreen" transparent visible={sectionPickerOpen}>
      <Pressable className="flex-1 justify-end bg-slate-950/65" onPress={() => setSectionPickerOpen(false)}>
        <Pressable
          className="max-h-[72%] rounded-t-[30px] border-t border-slate-200 bg-background px-5 pt-3 dark:border-slate-700 dark:bg-dark-background"
          onPress={(event) => event.stopPropagation()}
          onTouchCancel={finishSectionPickerDrag}
          onTouchEnd={finishSectionPickerDrag}
          onTouchMove={(event) => { sectionPickerDragCurrentY.current = event.nativeEvent.touches[0]?.pageY ?? sectionPickerDragCurrentY.current; }}
          onTouchStart={(event) => startSectionPickerDrag(event.nativeEvent.touches[0]?.pageY ?? 0)}
          style={{ paddingBottom: Math.max(safeAreaInsets.bottom, 18) }}
        >
          <View className="mb-4 items-center"><View className="h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-600" /></View>
          <Text className="text-xl font-black text-textPrimary dark:text-dark-textPrimary">Choose a section</Text>
          <Text variant="muted" className="mb-4 mt-1">Select the part of this card you want to customize.</Text>
          <ScrollView
            onScroll={(event) => { sectionPickerScrollY.current = event.nativeEvent.contentOffset.y; }}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-row flex-wrap gap-3 pb-3">
              {SECTION_CHOICES.map(({ description, icon: Icon, id, title }) => (
                <Pressable
                  accessibilityLabel={`Customize ${title}`}
                  accessibilityRole="button"
                  className="min-h-28 rounded-2xl border border-slate-200 bg-card p-4 active:opacity-70 dark:border-slate-700 dark:bg-dark-card"
                  key={id}
                  onPress={() => chooseSection(id)}
                  style={{ width: windowWidth < 380 ? '100%' : (windowWidth - 52) / 2 }}
                >
                  <View className="mb-3 h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/50"><Icon color="#3b82f6" size={19} /></View>
                  <Text className="font-bold text-textPrimary dark:text-dark-textPrimary">{title}</Text>
                  <Text variant="muted" className="mt-1 text-xs" numberOfLines={2}>{description}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>

    <ThemedBottomSheet
      ref={sheetRef}
      snapPoints={snapPoints}
      topInset={headerHeight}
      containerStyle={{ zIndex: 50 }}
      backdropEnabled={false}
      enablePanDownToClose
      footer={isEditing ? (
        <View
          className="border-t border-slate-200 bg-card dark:border-slate-700 dark:bg-dark-card"
          style={{
            paddingBottom: Math.max(safeAreaInsets.bottom, 14),
            paddingHorizontal: windowWidth < 380 ? 8 : 16,
            paddingTop: 12,
          }}
        >
          <View style={{ alignSelf: 'center', maxWidth: 760, width: '100%' }}>
            <EditHomeBar activeTab={activeEditTab} isSaving={isSaving} onChange={setActiveEditTab} onSave={saveSection} saveDisabled={!hasSectionChanges(activeSection)} />
          </View>
        </View>
      ) : null}
      onChange={(index) => { if (index === -1 && !isSaving) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); if (isEditing) stopEditing(); } }}
    >
      <View className="flex-1">
        <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 104 + Math.max(safeAreaInsets.bottom, 14) }} keyboardShouldPersistTaps="handled">
          <CardTapGesture onDoubleTap={closeEditor}>
            <View>
              <CardSectionEditor activeEditTab={activeEditTab} activeSection={activeSection} card={draft} profile={profile} showSectionNavigation={false} onActiveSectionChange={setActiveSection} onConnectionsChange={replaceConnectionFields} onFieldChange={updateSectionField} onLayoutChange={updateSectionLayout} onThemeChange={updateSectionTheme} />
            </View>
          </CardTapGesture>
        </BottomSheetScrollView>
      </View>
    </ThemedBottomSheet>

    <Modal animationType="slide" onRequestClose={closePreview} presentationStyle="fullScreen" visible={previewVisible}>
      <SafeAreaView
        className="flex-1 bg-background dark:bg-dark-background"
        edges={['left', 'right']}
        style={{ paddingTop: Math.max(safeAreaInsets.top, 12), paddingBottom: Math.max(safeAreaInsets.bottom, 8) }}
      >
        <PageHeader title="Preview Card" subtitle="Preview mode · Unsaved changes are included" onBackPress={closePreview} />
        <View className="mx-5 mb-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 dark:border-amber-700 dark:bg-amber-950/40">
          <Text className="text-center text-xs font-semibold text-amber-800 dark:text-amber-200">This is a private preview. Changes are not saved or published until you select Save.</Text>
        </View>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          onScroll={(event) => { previewScrollY.current = event.nativeEvent.contentOffset.y; }}
          onTouchCancel={finishPreviewDrag}
          onTouchEnd={finishPreviewDrag}
          onTouchMove={(event) => { previewDragCurrentY.current = event.nativeEvent.touches[0]?.pageY ?? previewDragCurrentY.current; }}
          onTouchStart={(event) => startPreviewDrag(event.nativeEvent.touches[0]?.pageY ?? 0)}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <CardDetailView card={previewCardData} profile={profile} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  </View>;
}
