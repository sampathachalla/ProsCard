import { useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlignLeft, BriefcaseBusiness, Eye, Link2, Pencil, RotateCcw, Save as SaveIcon, UserRound, type LucideIcon } from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { EditorAnimatedPresentationProvider } from '@/components/uiComponents/editor/EditorAnimatedPresentationContext';
import { PageHeader } from '@/components/uiComponents/PageHeader';
import { ThemedBottomSheet } from '@/components/uiComponents/ThemedBottomSheet';
import { Text } from '@/components/uiComponents/Text';
import { EditHomeBar, type EditHomeTab } from '@/components/uiComponents/EditHomeBar';
import { FloatingEditBarButton } from '@/components/uiComponents/FloatingEditBarButton';
import { CardDetailView } from '@/components/cardsComponents/Components/CardDetailView';
import { CardSectionEditor } from '@/components/editViewComponents/Components/CardSectionEditor';
import { useProfileSnapshot } from '@/components/profileComponents/Hooks/useProfileSnapshot';
import { useEditorPreferences } from '@/components/profileComponents/Hooks/useEditorPreferences';
import type { CardSectionId } from '@/components/cardsComponents/types/card.types';
import { useEditView } from '@/components/editViewComponents/Hooks/useEditView';
import { useThemeContext } from '@/context/ThemeContext';

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
  const { theme } = useThemeContext();
  const {
    glassmorphicEditorEnabled,
    hydrated: editorPreferencesHydrated,
    sectionHighlightEnabled,
  } = useEditorPreferences();
  const sheetRef = useRef<BottomSheet>(null);
  const cardScrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Partial<Record<CardSectionId, number>>>({});
  const sectionPickerScrollY = useRef(0);
  const sectionPickerDragStartY = useRef<number | null>(null);
  const sectionPickerDragCurrentY = useRef<number | null>(null);
  const snapPoints = useMemo(() => ['55%', '100%'], []);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [sheetIndex, setSheetIndex] = useState(-1);
  const [homeBarCollapsed, setHomeBarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<CardSectionId>('identity');
  const [activeEditTab, setActiveEditTab] = useState<EditHomeTab>('layout');
  const [stylingOpen, setStylingOpen] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [sectionPickerOpen, setSectionPickerOpen] = useState(false);
  const { card, draft, hasChanges, hasSectionChanges, isEditing, isSaving, startEditing, stopEditing, cancelEditing, updateSectionLayout, updateSectionField, replaceConnectionFields, resetSection, updateSectionTheme, saveCustomSectionTheme, submit, submitSection } = useEditView(cardId, false);
  const editorChromeBackground = glassmorphicEditorEnabled
    ? theme === 'dark'
      ? 'rgba(2, 6, 23, 0.74)'
      : 'rgba(255, 255, 255, 0.76)'
    : theme === 'dark'
      ? '#020617'
      : '#ffffff';

  const openSection = (section: CardSectionId) => {
    startEditing();
    setHomeBarCollapsed(false);
    setStylingOpen(false);
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
  const compactBarHidden = homeBarCollapsed && sheetIndex === 0;
  const changeEditTab = (tab: EditHomeTab) => {
    setActiveEditTab(tab);
    setStylingOpen(false);
  };
  const handleHeaderBack = () => {
    if (isEditing) {
      closeEditor();
      return;
    }
    if (sectionPickerOpen) {
      setSectionPickerOpen(false);
      return;
    }
    if (cardId) {
      router.replace({ pathname: '/cards/[cardId]', params: { cardId } });
      return;
    }
    router.replace('/(tabs)/cardsPage');
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
  const undoActiveSectionChanges = () => {
    if (!hasSectionChanges(activeSection) || isSaving) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    resetSection(activeSection);
  };
  const previewCard = () => {
    Haptics.selectionAsync().catch(() => {});
    setPreviewVisible(true);
  };
  const closePreview = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setPreviewVisible(false);
  };
  const previewCardData = isEditing ? draft : card;

  return <View className="flex-1 bg-background dark:bg-dark-background">
    <View
      onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}
      style={{
        backgroundColor: editorChromeBackground,
        borderBottomColor: 'rgba(148, 163, 184, 0.18)',
        borderBottomWidth: 1,
        elevation: 24,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 220,
      }}
    >
      <PageHeader
        title={isEditing ? (stylingOpen ? `Style ${SECTION_TITLES[activeSection]}` : `Edit ${SECTION_TITLES[activeSection]}`) : 'Edit Card'}
        subtitle={isEditing ? (stylingOpen ? `Styling opened from ${activeEditTab === 'layout' ? 'Layout' : 'Content'}` : 'Customize this card section') : (card.name || 'Choose a section to customize')}
        onBackPress={handleHeaderBack}
        right={isEditing ? (
          hasSectionChanges(activeSection) ? (
            <Pressable
              accessibilityLabel={`Undo unsaved ${SECTION_TITLES[activeSection]} changes`}
              accessibilityRole="button"
              accessibilityState={{ disabled: isSaving }}
              className="flex-row items-center rounded-full border border-amber-500 bg-amber-500/15 px-3 py-2 active:opacity-70"
              disabled={isSaving}
              onPress={undoActiveSectionChanges}
            >
              <RotateCcw color="#f59e0b" size={17} />
              <Text className="ml-1.5 text-sm font-bold text-amber-600 dark:text-amber-400">Undo</Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityLabel={`Preview ${card.name || 'card'}`}
              accessibilityRole="button"
              onPress={previewCard}
              className="flex-row items-center rounded-full border border-primary px-3 py-2 active:opacity-70 dark:border-dark-primary"
            >
              <Eye color="#3b82f6" size={17} />
              <Text className="ml-1.5 text-sm font-bold text-primary dark:text-dark-primary">Preview</Text>
            </Pressable>
          )
        ) : (
          <View className="flex-row items-center gap-2">
            {hasChanges ? (
              <>
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
                <Pressable
                  accessibilityLabel="Save all card changes"
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isSaving, busy: isSaving }}
                  className="h-11 w-11 items-center justify-center rounded-full border border-emerald-500 bg-emerald-600"
                  disabled={isSaving}
                  onPress={saveAllChanges}
                >
                  <SaveIcon color="#ffffff" size={20} />
                </Pressable>
              </>
            ) : (
              <Pressable
                accessibilityLabel={`Preview ${card.name || 'card'}`}
                accessibilityRole="button"
                onPress={previewCard}
                className="flex-row items-center rounded-full border border-primary px-3 py-2 active:opacity-70 dark:border-dark-primary"
              >
                <Eye color="#3b82f6" size={17} />
                <Text className="ml-1.5 text-sm font-bold text-primary dark:text-dark-primary">Preview</Text>
              </Pressable>
            )}
          </View>
        )}
      />
    </View>
    <ScrollView
      ref={cardScrollRef}
      contentContainerStyle={{
        paddingTop: 12,
        paddingBottom: isEditing
          ? Math.max(120, windowHeight * 0.62)
          : 78 + Math.max(safeAreaInsets.bottom, 10),
      }}
      showsVerticalScrollIndicator={false}
    >
      <CardDetailView
        activeSection={isEditing && editorPreferencesHydrated && sectionHighlightEnabled ? activeSection : undefined}
        card={isEditing ? draft : card}
        profile={profile}
        onSectionLayout={(section, y) => { sectionOffsets.current[section] = y; }}
      />
    </ScrollView>

    {!isEditing && !previewVisible ? (
      <View
        className="absolute inset-x-0 bottom-0 border-t border-slate-200 bg-card dark:border-slate-700 dark:bg-dark-card"
        style={{
          backgroundColor: editorChromeBackground,
          elevation: 28,
          paddingBottom: Math.max(safeAreaInsets.bottom, 8),
          paddingHorizontal: windowWidth < 380 ? 4 : 10,
          paddingTop: 6,
          zIndex: 200,
        }}
      >
        <View
          accessibilityRole="tablist"
          className="flex-row"
          style={{ alignSelf: 'center', maxWidth: 760, width: '100%' }}
        >
          {SECTION_CHOICES.map(({ icon: Icon, id, title }) => (
            <Pressable
              key={id}
              accessibilityLabel={`Edit ${title}`}
              accessibilityRole="button"
              onPress={() => openSection(id)}
              className="min-w-0 flex-1 items-center justify-center px-1 active:opacity-70"
              style={{ minHeight: 52, paddingVertical: 3 }}
            >
              <Icon color="#3b82f6" size={19} strokeWidth={2.2} />
              <Text
                className="mt-1 text-center text-[10px] font-semibold text-textPrimary dark:text-dark-textPrimary"
                numberOfLines={1}
              >
                {id === 'connections' ? 'Contact' : title}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
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
      glassmorphic={glassmorphicEditorEnabled}
      footer={isEditing && !compactBarHidden ? (
        <View
          className="border-t border-slate-200 bg-card dark:border-slate-700 dark:bg-dark-card"
          style={{
            backgroundColor: editorChromeBackground,
            paddingBottom: Math.max(safeAreaInsets.bottom, 8),
            paddingHorizontal: windowWidth < 380 ? 8 : 16,
            paddingTop: 6,
          }}
        >
          <View style={{ alignSelf: 'center', maxWidth: 760, width: '100%' }}>
            <EditHomeBar
              activeTab={activeEditTab}
              isSaving={isSaving}
              onChange={changeEditTab}
              onSave={saveSection}
              saveDisabled={!hasSectionChanges(activeSection)}
            />
          </View>
        </View>
      ) : null}
      onChange={(index) => {
        setSheetIndex(index);
        if (index === -1 && !isSaving) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          if (isEditing) stopEditing();
        }
      }}
    >
      <View className="flex-1">
        <EditorAnimatedPresentationProvider>
        <BottomSheetScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom:
              compactBarHidden
                ? 24
                : 104 + Math.max(safeAreaInsets.bottom, 14),
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <CardSectionEditor
              activeEditTab={activeEditTab}
              activeSection={activeSection}
              card={draft}
              editBarCollapsed={homeBarCollapsed}
              fullOpen={sheetIndex === 1}
              profile={profile}
              showSectionNavigation={false}
              onActiveSectionChange={setActiveSection}
              onConnectionsChange={replaceConnectionFields}
              onFieldChange={updateSectionField}
              onLayoutChange={updateSectionLayout}
              onCloseStyling={() => setStylingOpen(false)}
              onOpenStyling={() => setStylingOpen(true)}
              onProfessionalFieldFocus={() => {
                if (sheetIndex !== 1) sheetRef.current?.snapToIndex(1);
              }}
              onThemeChange={updateSectionTheme}
              onSaveCustomTheme={saveCustomSectionTheme}
              stylingOpen={stylingOpen}
            />
          </View>
        </BottomSheetScrollView>
        </EditorAnimatedPresentationProvider>
      </View>
    </ThemedBottomSheet>

    {isEditing && sheetIndex >= 0 ? (
      <FloatingEditBarButton
        barOpen={!homeBarCollapsed}
        bottomInset={compactBarHidden ? Math.max(safeAreaInsets.bottom, 14) : 66 + Math.max(safeAreaInsets.bottom, 8)}
        minY={sheetIndex === 0 ? headerHeight + (windowHeight - headerHeight) * 0.45 + 12 : headerHeight + 12}
        onToggle={() => setHomeBarCollapsed((current) => !current)}
        visible={sheetIndex === 0}
      />
    ) : null}

    <Modal animationType="fade" onRequestClose={closePreview} presentationStyle="fullScreen" visible={previewVisible}>
      <SafeAreaView
        className="flex-1 bg-background dark:bg-dark-background"
        edges={['left', 'right']}
        style={{ paddingTop: Math.max(safeAreaInsets.top, 12), paddingBottom: Math.max(safeAreaInsets.bottom, 8) }}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <CardDetailView card={previewCardData} profile={profile} />
        </ScrollView>
        <Pressable
          accessibilityLabel="Exit preview"
          accessibilityRole="button"
          onPress={closePreview}
          className="absolute right-4 min-h-[44px] flex-row items-center justify-center rounded-full border border-white/30 px-3.5 active:scale-95"
          style={{
            backgroundColor: 'rgba(2, 6, 23, 0.42)',
            elevation: 30,
            top: Math.max(safeAreaInsets.top + 8, 16),
          }}
        >
          <Eye color="#ffffff" size={19} strokeWidth={2.2} />
          <View className="ml-2 h-2 w-2 rounded-full bg-emerald-400" />
          <Text className="ml-1.5 text-sm font-bold text-white">Preview</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Back to edit"
          accessibilityRole="button"
          onPress={closePreview}
          className="absolute right-5 flex-row items-center rounded-full border border-white/30 bg-primary px-4 py-3 shadow-xl shadow-black/30 active:scale-95 dark:bg-dark-primary"
          style={{ bottom: Math.max(safeAreaInsets.bottom + 18, 24), elevation: 30 }}
        >
          <Pencil color="#ffffff" size={18} strokeWidth={2.4} />
          <Text className="ml-2 text-sm font-bold text-white">Back to edit</Text>
        </Pressable>
      </SafeAreaView>
    </Modal>
  </View>;
}
