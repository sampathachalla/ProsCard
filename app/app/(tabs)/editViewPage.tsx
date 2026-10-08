import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, BackHandler, Dimensions, Modal, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  BriefcaseBusiness,
  ChevronDown,
  Eye,
  LayoutTemplate,
  Link2,
  ListPlus,
  Palette,
  Pencil,
  RotateCcw,
  Save as SaveIcon,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';
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
import { buildDefaultCard } from '@/components/cardsComponents/Services/cardsService';
import { useEditView } from '@/components/editViewComponents/Hooks/useEditView';
import { useThemeContext } from '@/context/ThemeContext';

const SECTION_TITLES: Record<CardSectionId, string> = {
  identity: 'Identity',
  professional: 'Professional identity',
  bio: 'About',
  connections: 'Contact & links',
};
const SECTION_CHOICES: {
  id: CardSectionId;
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    id: 'identity',
    title: 'Identity',
    description: 'Name, cover, profile photo and logo',
    icon: UserRound,
  },
  {
    id: 'professional',
    title: 'Professional',
    description: 'Name details, title and company',
    icon: BriefcaseBusiness,
  },
  {
    id: 'connections',
    title: 'Contact & links',
    description: 'Email, phone and social links',
    icon: Link2,
  },
];
const CREATION_STEPS: CardSectionId[] = ['identity', 'professional', 'connections'];
const EDIT_MODES: { id: EditHomeTab; label: string; icon: LucideIcon }[] = [
  { id: 'layout', label: 'Layout', icon: LayoutTemplate },
  { id: 'content', label: 'Content', icon: ListPlus },
  { id: 'styling', label: 'Styling', icon: Palette },
];
// Stacking order for editor chrome. FloatingEditBarButton sits at 100, between the sheet and the bars.
const Z_INDEX = { sheet: 50, bottomBar: 200, header: 220 } as const;

export default function EditViewPage() {
  const params = useLocalSearchParams<{
    cardId?: string | string[];
    create?: string | string[];
    origin?: string | string[];
  }>();
  const cardId = Array.isArray(params.cardId) ? params.cardId[0] : params.cardId;
  const createParam = Array.isArray(params.create) ? params.create[0] : params.create;
  const isCreateMode = createParam === '1';
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  // Screen height does not shrink when the editor sheet or keyboard opens.
  const cardLayoutHeight = Dimensions.get('screen').height;
  const { profile } = useProfileSnapshot();
  const [creationDraft] = useState(() => buildDefaultCard(profile));
  const { theme } = useThemeContext();
  const { glassmorphicEditorEnabled, hydrated: editorPreferencesHydrated, sectionHighlightEnabled } = useEditorPreferences();
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
  const {
    card,
    draft,
    hasChanges,
    hasSectionChanges,
    isEditing,
    isSaving,
    startEditing,
    stopEditing,
    cancelEditing,
    updateSectionLayout,
    updateSectionField,
    replaceConnectionFields,
    resetSection,
    updateSectionTheme,
    saveCustomSectionTheme,
    submit,
    submitSection,
  } = useEditView(cardId, isCreateMode, isCreateMode ? creationDraft : undefined);
  const editorChromeBackground = glassmorphicEditorEnabled
    ? theme === 'dark'
      ? 'rgba(2, 6, 23, 0.74)'
      : 'rgba(255, 255, 255, 0.76)'
    : theme === 'dark'
      ? '#020617'
      : '#ffffff';

  useEffect(() => {
    if (!isCreateMode) return;
    const frame = requestAnimationFrame(() => {
      sheetRef.current?.snapToIndex(0);
    });
    return () => cancelAnimationFrame(frame);
  }, [isCreateMode]);

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
          cardScrollRef.current?.scrollTo({
            y: Math.max(0, sectionY - 8),
            animated: true,
          });
        }
      });
    });
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

  const closeEditor = useCallback(() => {
    // Do not depend exclusively on BottomSheet's asynchronous onChange event.
    // During a modal/sheet transition that event may arrive late (or not at all),
    // leaving the screen in editing state after the sheet is already hidden.
    setSectionPickerOpen(false);
    setHomeBarCollapsed(false);
    setStylingOpen(false);
    setSheetIndex(-1);
    sheetRef.current?.close();
    stopEditing();
  }, [setHomeBarCollapsed, setSectionPickerOpen, setSheetIndex, setStylingOpen, stopEditing]);
  const compactBarHidden = homeBarCollapsed && sheetIndex === 0;
  const changeEditTab = (tab: EditHomeTab) => {
    setActiveEditTab(tab);
    setStylingOpen(tab === 'styling');
  };
  const openEditorMode = (tab: EditHomeTab) => {
    startEditing();
    setHomeBarCollapsed(false);
    setActiveEditTab(tab);
    setStylingOpen(tab === 'styling');
    setSectionPickerOpen(false);
    requestAnimationFrame(() => sheetRef.current?.snapToIndex(0));
  };
  const handleHeaderBack = useCallback(() => {
    if (previewVisible) {
      setPreviewVisible(false);
      return;
    }
    if (sectionPickerOpen) {
      setSectionPickerOpen(false);
      return;
    }
    if (isCreateMode) {
      Alert.alert('Discard new card?', 'Your card has not been created yet. All changes in this setup will be discarded.', [
        { text: 'Keep editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]);
      return;
    }
    if (isEditing) {
      closeEditor();
      return;
    }
    // Prefer popping the existing stack entry (e.g. the card detail screen
    // this was pushed from) over replace(), which would stack a duplicate
    // entry on top of it and require an extra back-press to clear.
    if (router.canGoBack()) {
      router.back();
      return;
    }
    if (cardId) {
      router.replace({ pathname: '/cards/[cardId]', params: { cardId } });
      return;
    }
    router.replace('/(tabs)/cardsPage');
  }, [
    cardId,
    closeEditor,
    isCreateMode,
    isEditing,
    previewVisible,
    router,
    sectionPickerOpen,
    setPreviewVisible,
    setSectionPickerOpen,
  ]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      // Let the navigator handle a normal page pop, but consume Back while an
      // editor layer is active so it closes exactly one layer at a time.
      if (!previewVisible && !sectionPickerOpen && !isEditing && !isCreateMode) return false;
      handleHeaderBack();
      return true;
    });
    return () => subscription.remove();
  }, [handleHeaderBack, isCreateMode, isEditing, previewVisible, sectionPickerOpen]);
  const saveSection = async () => {
    if (isCreateMode) {
      if (activeEditTab === 'layout') {
        setActiveEditTab('content');
        setStylingOpen(false);
        sheetRef.current?.snapToIndex(0);
        return;
      }

      const stepIndex = CREATION_STEPS.indexOf(activeSection);
      const nextSection = CREATION_STEPS[stepIndex + 1];
      if (nextSection) {
        setActiveSection(nextSection);
        setActiveEditTab('layout');
        setStylingOpen(false);
        requestAnimationFrame(() => {
          sheetRef.current?.snapToIndex(0);
          const sectionY = sectionOffsets.current[nextSection];
          if (sectionY !== undefined)
            cardScrollRef.current?.scrollTo({
              y: Math.max(0, sectionY - 8),
              animated: true,
            });
        });
        return;
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      const saved = await submit();
      if (saved) router.back();
      return;
    }
    await submitSection(activeSection);
  };
  const saveAllChanges = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const saved = await submit({ keepEditing: !isCreateMode });
    if (saved && isCreateMode) router.back();
  };
  const undoAllChanges = () => {
    if (!hasChanges || isSaving) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    Alert.alert('Discard all changes?', 'Unsaved changes to every section of this card will be lost.', [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: cancelEditing },
    ]);
  };
  const undoActiveSectionChanges = () => {
    if (!hasSectionChanges(activeSection) || isSaving) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    Alert.alert(`Discard ${SECTION_TITLES[activeSection]} changes?`, 'Unsaved changes to this section will be lost.', [
      { text: 'Keep editing', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => resetSection(activeSection),
      },
    ]);
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

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
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
          zIndex: Z_INDEX.header,
        }}
      >
        <PageHeader
          title={isCreateMode ? 'Add Card' : isEditing ? 'Edit Card' : 'Edit Card'}
          subtitle={
            isEditing
              ? `${activeEditTab === 'layout' ? 'Layouts' : activeEditTab === 'content' ? 'Content' : 'Styling'} · All card sections`
              : card.name || 'Choose how you want to customize the card'
          }
          onBackPress={handleHeaderBack}
          right={
            isEditing ? (
              hasChanges || isCreateMode ? (
                <View className="flex-row items-center gap-2">
                  {hasChanges ? (
                    <Pressable
                      accessibilityLabel="Undo all unsaved card changes"
                      accessibilityRole="button"
                      accessibilityState={{ disabled: isSaving }}
                      className="size-10 items-center justify-center rounded-full border border-amber-500 bg-amber-500/15 active:opacity-70"
                      disabled={isSaving}
                      onPress={undoAllChanges}
                    >
                      <RotateCcw color="#f59e0b" size={18} />
                    </Pressable>
                  ) : null}
                  <Pressable
                    accessibilityLabel={isCreateMode ? 'Create card' : 'Save all card changes'}
                    accessibilityRole="button"
                    accessibilityState={{
                      busy: isSaving,
                      disabled: isSaving || (!isCreateMode && !hasChanges),
                    }}
                    className="flex-row items-center rounded-full bg-emerald-600 px-3 py-2 active:opacity-70 disabled:opacity-40"
                    disabled={isSaving || (!isCreateMode && !hasChanges)}
                    onPress={saveAllChanges}
                  >
                    <SaveIcon color="#ffffff" size={17} />
                    <Text className="ml-1.5 text-sm font-bold text-white">{isSaving ? 'Saving' : isCreateMode ? 'Create' : 'Save'}</Text>
                  </Pressable>
                </View>
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
                      className="size-11 items-center justify-center rounded-full border border-amber-500 bg-amber-500"
                      disabled={isSaving}
                      onPress={undoAllChanges}
                    >
                      <RotateCcw color="#ffffff" size={20} />
                    </Pressable>
                    <Pressable
                      accessibilityLabel="Save all card changes"
                      accessibilityRole="button"
                      accessibilityState={{
                        disabled: isSaving,
                        busy: isSaving,
                      }}
                      className="size-11 items-center justify-center rounded-full border border-emerald-500 bg-emerald-600"
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
            )
          }
        />
      </View>
      <ScrollView
        ref={cardScrollRef}
        contentContainerStyle={{
          paddingTop: headerHeight > 0 ? headerHeight + 12 : safeAreaInsets.top + 68,
          paddingBottom: isEditing ? Math.max(120, windowHeight * 0.62) : 78 + Math.max(safeAreaInsets.bottom, 10),
        }}
        showsVerticalScrollIndicator={false}
      >
        <CardDetailView
          activeSection={
            isEditing && editorPreferencesHydrated && sectionHighlightEnabled ? activeSection : undefined
          }
          card={isEditing ? draft : card}
          profile={profile}
          viewportHeight={cardLayoutHeight}
          onSectionLayout={(section, y) => {
            sectionOffsets.current[section] = y;
          }}
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
            zIndex: Z_INDEX.bottomBar,
          }}
        >
          <View className="flex-row" style={{ alignSelf: 'center', maxWidth: 760, width: '100%' }}>
            {EDIT_MODES.map(({ icon: Icon, id, label }) => (
              <Pressable
                key={id}
                accessibilityLabel={`Open ${label} editor`}
                accessibilityRole="button"
                onPress={() => openEditorMode(id)}
                className="min-w-0 flex-1 items-center justify-center px-1 active:opacity-70"
                style={{ minHeight: 52, paddingVertical: 3 }}
              >
                <Icon color="#3b82f6" size={19} strokeWidth={2.2} />
                <Text className="mt-1 text-center text-[10px] font-semibold text-textPrimary dark:text-dark-textPrimary" numberOfLines={1}>
                  {label}
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
            onTouchMove={(event) => {
              sectionPickerDragCurrentY.current = event.nativeEvent.touches[0]?.pageY ?? sectionPickerDragCurrentY.current;
            }}
            onTouchStart={(event) => startSectionPickerDrag(event.nativeEvent.touches[0]?.pageY ?? 0)}
            style={{ paddingBottom: Math.max(safeAreaInsets.bottom, 18) }}
          >
            <View className="mb-4 items-center">
              <View className="h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-600" />
            </View>
            <Text className="text-xl font-black text-textPrimary dark:text-dark-textPrimary">Choose a section</Text>
            <Text variant="muted" className="mb-4 mt-1">
              Select the part of this card you want to customize.
            </Text>
            <ScrollView
              onScroll={(event) => {
                sectionPickerScrollY.current = event.nativeEvent.contentOffset.y;
              }}
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
                    style={{
                      width: windowWidth < 380 ? '100%' : (windowWidth - 52) / 2,
                    }}
                  >
                    <View className="mb-3 size-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/50">
                      <Icon color="#3b82f6" size={19} />
                    </View>
                    <Text className="font-bold text-textPrimary dark:text-dark-textPrimary">{title}</Text>
                    <Text variant="muted" className="mt-1 text-xs" numberOfLines={2}>
                      {description}
                    </Text>
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
        containerStyle={{ zIndex: Z_INDEX.sheet }}
        backdropEnabled={false}
        enablePanDownToClose={!isCreateMode}
        glassmorphic={glassmorphicEditorEnabled}
        showHandle={sheetIndex === 1}
        footer={
          isEditing && !compactBarHidden ? (
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
                  onSave={saveAllChanges}
                  saveDisabled={!isCreateMode && !hasChanges}
                  showSave={isCreateMode || hasChanges || isSaving}
                />
              </View>
            </View>
          ) : null
        }
        onChange={(index) => {
          setSheetIndex(index);
          if (index === -1 && !isSaving && !isCreateMode) {
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
                paddingBottom: compactBarHidden ? Math.max(safeAreaInsets.bottom, 24) : 104 + Math.max(safeAreaInsets.bottom, 14),
              }}
              keyboardShouldPersistTaps="handled"
            >
              <View>
                {sheetIndex === 0 && activeEditTab !== 'styling' ? (
                  <Pressable
                    accessibilityLabel={`Select card section. Current section: ${SECTION_TITLES[activeSection]}`}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: sectionPickerOpen }}
                    className="mb-4 flex-row items-center rounded-2xl border border-slate-200 bg-card px-4 py-3 active:opacity-70 dark:border-slate-700 dark:bg-dark-card"
                    onPress={() => setSectionPickerOpen(true)}
                  >
                    {(() => {
                      const selected = SECTION_CHOICES.find(({ id }) => id === activeSection) ?? SECTION_CHOICES[0];
                      const SelectedIcon = selected.icon;
                      return (
                        <>
                          <View className="size-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/50">
                            <SelectedIcon color="#3b82f6" size={20} />
                          </View>
                          <View className="ml-3 min-w-0 flex-1">
                            <Text className="text-xs font-semibold text-textMuted dark:text-dark-textMuted">Card section</Text>
                            <Text className="mt-0.5 text-base font-bold text-textPrimary dark:text-dark-textPrimary">
                              {selected.title}
                            </Text>
                          </View>
                          <ChevronDown color="#64748b" size={20} />
                        </>
                      );
                    })()}
                  </Pressable>
                ) : null}
                {(sheetIndex === 0 || activeEditTab === 'styling' ? [activeSection] : CREATION_STEPS).map((sectionId) => (
                  <View key={`${activeEditTab}-${sectionId}`} className={sheetIndex === 1 ? 'mb-2' : 'mb-6'}>
                    {sheetIndex === 1 && activeEditTab !== 'styling' ? (
                      <View className="mb-3 flex-row items-center">
                        <Text className="text-lg font-black text-textPrimary dark:text-dark-textPrimary">{SECTION_TITLES[sectionId]}</Text>
                        <View className="ml-3 h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                      </View>
                    ) : null}
                    <CardSectionEditor
                      activeEditTab={activeEditTab}
                      activeSection={sectionId}
                      card={draft}
                      editBarCollapsed={homeBarCollapsed}
                      fullOpen={sheetIndex === 1}
                      profile={profile}
                      showSectionNavigation={false}
                      onActiveSectionChange={setActiveSection}
                      onConnectionsChange={replaceConnectionFields}
                      onFieldChange={updateSectionField}
                      onLayoutChange={updateSectionLayout}
                      onCloseStyling={() => changeEditTab('layout')}
                      onOpenStyling={() => changeEditTab('styling')}
                      onProfessionalFieldFocus={() => {
                        if (sheetIndex !== 1) sheetRef.current?.snapToIndex(1);
                      }}
                      onThemeChange={updateSectionTheme}
                      onSaveCustomTheme={saveCustomSectionTheme}
                      stylingOpen={activeEditTab === 'styling'}
                    />
                  </View>
                ))}
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
          style={{
            paddingTop: Math.max(safeAreaInsets.top, 12),
            paddingBottom: Math.max(safeAreaInsets.bottom, 8),
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 88 }}>
            <CardDetailView card={previewCardData} fullBleed profile={profile} viewportHeight={cardLayoutHeight} />
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
            <View className="ml-2 size-2 rounded-full bg-emerald-400" />
            <Text className="ml-1.5 text-sm font-bold text-white">Preview</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Back to edit"
            accessibilityRole="button"
            onPress={closePreview}
            className="absolute right-5 flex-row items-center rounded-full border border-white/30 bg-primary px-4 py-3 shadow-xl shadow-black/30 active:scale-95 dark:bg-dark-primary"
            style={{
              bottom: Math.max(safeAreaInsets.bottom + 18, 24),
              elevation: 30,
            }}
          >
            <Pencil color="#ffffff" size={18} strokeWidth={2.4} />
            <Text className="ml-2 text-sm font-bold text-white">Back to edit</Text>
          </Pressable>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
