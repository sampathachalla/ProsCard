import { useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutAnimation,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  UIManager,
  View,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  AlignLeft,
  Award,
  Briefcase,
  Check,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Minus,
  Pencil,
  Plus,
  Quote,
  Search,
  Trash2,
  Upload,
  UserRound,
} from 'lucide-react-native';
import type { Profile } from '@/components/profileComponents/types/profile.types';
import type {
  CardSectionFieldId,
  CardSectionId,
  CardTemplateId,
  CardVisualTheme,
  DynamicCardField,
  DynamicCardFieldType,
  SavedSectionTheme,
} from '@/components/cardsComponents/types/card.types';
import { createCardDetailTemplate } from '@/components/cardsComponents/Templates/cardDetailTemplate';
import { ImageUploadField } from '@/components/uiComponents/ImageUploadField';
import { Text } from '@/components/uiComponents/Text';
import type { EditHomeTab } from '@/components/uiComponents/EditHomeBar';
import type { EditableCard } from '../types/editView.types';
import { CardStylingCustomizer } from './CardThemeCustomizer';
import { LayoutTemplatePicker } from './LayoutTemplatePicker';
import { EditorStylingLauncher } from '@/components/uiComponents/editor/EditorStylingLauncher';
import { EditorPresentationCrossfade } from '@/components/uiComponents/editor/EditorPresentationCrossfade';
import { EditorSectionLabel } from '@/components/uiComponents/editor/EditorSectionLabel';
import { getFieldIcon } from '@/components/cardsComponents/Templates/sections/SectionSharedComponents';
import {
  fitAccreditationsToViewport,
  fitTaglineToViewport,
  getResponsiveAccreditationLimit,
  getResponsiveTaglineLimit,
} from '@/utils/cardTextLayout';

const SECTIONS: { id: CardSectionId; label: string }[] = [
  { id: 'identity', label: 'Identity' },
  { id: 'professional', label: 'Professional' },
  { id: 'bio', label: 'About' },
  { id: 'connections', label: 'Contact & links' },
];

type IdentityImageField = 'coverPhoto' | 'profilePhoto' | 'logo';

const AVAILABLE_CONNECTION_FIELDS: { title: string; type: DynamicCardFieldType }[] = [
  { title: 'Email', type: 'email' },
  { title: 'Phone', type: 'phone' },
  { title: 'Website', type: 'url' },
  { title: 'Address', type: 'text' },
  { title: 'LinkedIn', type: 'url' },
  { title: 'X (Twitter)', type: 'url' },
  { title: 'GitHub', type: 'url' },
  { title: 'Instagram', type: 'url' },
  { title: 'Facebook', type: 'url' },
  { title: 'WhatsApp', type: 'url' },
  { title: 'YouTube', type: 'url' },
  { title: 'TikTok', type: 'url' },
  { title: 'Portfolio', type: 'url' },
];

const IDENTITY_IMAGE_OPTIONS: {
  id: IdentityImageField;
  label: string;
  description: string;
  variant: 'banner' | 'avatar' | 'logo';
}[] = [
  {
    id: 'coverPhoto',
    label: 'Cover Photo',
    description: 'Hero image shown at the top of your identity section.',
    variant: 'banner',
  },
  {
    id: 'profilePhoto',
    label: 'Profile Photo',
    description: 'Your headshot or avatar on the card.',
    variant: 'avatar',
  },
  {
    id: 'logo',
    label: 'Company Logo',
    description: 'Company or personal mark displayed on the card.',
    variant: 'logo',
  },
];

function CardEditorFieldGroup({
  children,
  collapsible = false,
  dense = false,
  description,
  expanded = true,
  headerAccessory,
  icon: Icon,
  onToggle,
  title,
}: {
  children: React.ReactNode;
  collapsible?: boolean;
  dense?: boolean;
  description?: string;
  expanded?: boolean;
  headerAccessory?: React.ReactNode;
  icon?: React.ComponentType<{ color: string; size: number }>;
  onToggle?: () => void;
  title: string;
}) {
  return (
    <View
      className={`${
        dense
          ? 'mb-2 border-b border-slate-200 pb-3 dark:border-slate-800'
          : 'mb-4 rounded-[24px] border border-slate-200 bg-card p-4 dark:border-slate-800 dark:bg-[#0b1120]'
      }`}
    >
      <Pressable
        accessibilityLabel={`${expanded ? 'Collapse' : 'Expand'} ${title}`}
        accessibilityRole={collapsible ? 'button' : undefined}
        accessibilityState={collapsible ? { expanded } : undefined}
        disabled={!collapsible}
        onPress={onToggle}
        className={`flex-row items-center ${expanded ? (dense ? 'mb-2' : 'mb-3') : ''}`}
      >
        {Icon ? (
          <View className="mr-2 h-7 w-7 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/60">
            <Icon color="#3b82f6" size={15} />
          </View>
        ) : null}
        <View className="flex-1">
          <Text className="text-xs font-bold uppercase tracking-wider text-textMuted dark:text-slate-400">
            {title}
          </Text>
          {description ? (
            <Text className="mt-0.5 text-xs text-textMuted dark:text-slate-400">{description}</Text>
          ) : null}
        </View>
        {headerAccessory}
        {collapsible ? (
          <View className="ml-2 h-7 w-7 items-center justify-center rounded-md border border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
            {expanded ? (
              <Minus color="#64748b" size={16} strokeWidth={2.4} />
            ) : (
              <Plus color="#64748b" size={16} strokeWidth={2.4} />
            )}
          </View>
        ) : null}
      </Pressable>
      {expanded ? children : null}
    </View>
  );
}

function EditorInput({
  hideLabel = false,
  label,
  maxLength,
  multiline,
  onChangeText,
  onFocus,
  placeholder,
  roomy = false,
  value,
}: {
  label: string;
  hideLabel?: boolean;
  maxLength?: number;
  multiline?: boolean;
  onChangeText: (value: string) => void;
  onFocus?: () => void;
  placeholder?: string;
  roomy?: boolean;
  value: string;
}) {
  return (
    <View className={roomy ? 'mb-2' : 'mb-3'}>
      {!hideLabel ? (
        <View className="mb-1.5 flex-row items-center justify-between px-1">
          <Text className="text-xs font-bold uppercase tracking-wide text-textMuted dark:text-slate-400">
            {label}
          </Text>
          {maxLength ? (
            <Text className="text-[10px] font-semibold text-textMuted dark:text-slate-400">
              {Math.min(value.length, maxLength)}/{maxLength}
            </Text>
          ) : null}
        </View>
      ) : null}
      <BottomSheetTextInput
        value={value}
        onChangeText={onChangeText}
        maxLength={maxLength}
        placeholder={placeholder ?? label}
        placeholderTextColor="#64748b"
        multiline={multiline}
        onFocus={onFocus}
        className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-sm font-semibold text-textPrimary dark:border-slate-700/80 dark:bg-[#060a14] dark:text-white"
        style={
          multiline
            ? { minHeight: 96, textAlignVertical: 'top' }
            : roomy
              ? { borderRadius: 8, minHeight: 58 }
              : undefined
        }
      />
    </View>
  );
}

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CONNECTION_ACTION_ANIMATION = {
  duration: 420,
  create: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
  update: {
    type: LayoutAnimation.Types.easeInEaseOut,
  },
  delete: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
} as const;

const CONNECTION_ROW_DRAG_STEP = 72;

function DraggableConnectionRow({
  activeDragIndex,
  children,
  dragOffsetY,
  index,
  itemCount,
  onMove,
}: {
  activeDragIndex: SharedValue<number>;
  children: React.ReactNode;
  dragOffsetY: SharedValue<number>;
  index: number;
  itemCount: number;
  onMove: (from: number, to: number) => void;
}) {
  const translationY = useSharedValue(0);
  const dragging = useSharedValue(false);
  const dragStartIndex = useSharedValue(index);
  const lastDestination = useSharedValue(index);

  const triggerDragStartHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  };

  const triggerPositionHaptic = () => {
    Haptics.selectionAsync().catch(() => {});
  };

  const gesture = Gesture.Pan()
    .activateAfterLongPress(350)
    .onStart(() => {
      dragging.value = true;
      dragStartIndex.value = index;
      lastDestination.value = index;
      activeDragIndex.value = index;
      dragOffsetY.value = 0;
      runOnJS(triggerDragStartHaptic)();
    })
    .onUpdate((event) => {
      dragOffsetY.value = event.translationY;
      // Use a deliberate 75% boundary: responsive to the finger without
      // repeatedly swapping around the midpoint.
      const rowProgress = event.translationY / CONNECTION_ROW_DRAG_STEP;
      const offset =
        rowProgress >= 0
          ? Math.floor(rowProgress + 0.25)
          : Math.ceil(rowProgress - 0.25);
      const destination = Math.max(
        0,
        Math.min(itemCount - 1, dragStartIndex.value + offset),
      );
      if (destination !== lastDestination.value) {
        lastDestination.value = destination;
        runOnJS(triggerPositionHaptic)();
      }
      translationY.value = event.translationY;
    })
    .onFinalize(() => {
      const rowProgress = dragOffsetY.value / CONNECTION_ROW_DRAG_STEP;
      const offset = Math.round(rowProgress);
      const destination = Math.max(
        0,
        Math.min(itemCount - 1, dragStartIndex.value + offset),
      );
      if (destination !== dragStartIndex.value) {
        runOnJS(onMove)(dragStartIndex.value, destination);
      }
      translationY.value = 0;
      dragOffsetY.value = 0;
      activeDragIndex.value = -1;
      dragging.value = false;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    elevation: dragging.value ? 8 : 0,
    opacity: dragging.value ? 0.94 : 1,
    shadowOpacity: dragging.value ? 0.18 : 0,
    transform: [{ scale: dragging.value ? 1.02 : 1 }, { translateY: translationY.value }],
    zIndex: dragging.value ? 20 : 0,
  }));

  const placeholderStyle = useAnimatedStyle(() => ({
    borderWidth: activeDragIndex.value === index ? 2 : 0,
    opacity: activeDragIndex.value === index ? 1 : 0,
  }));

  const siblingShiftStyle = useAnimatedStyle(() => {
    const activeIndex = activeDragIndex.value;
    if (activeIndex < 0 || index === activeIndex) return { transform: [{ translateY: 0 }] };

    const dragY = dragOffsetY.value;
    if (dragY > 0 && index > activeIndex) {
      const distanceFromActive = index - activeIndex - 1;
      const progress = Math.max(
        0,
        Math.min(
          CONNECTION_ROW_DRAG_STEP,
          dragY - distanceFromActive * CONNECTION_ROW_DRAG_STEP,
        ),
      );
      return { transform: [{ translateY: -progress }] };
    }

    if (dragY < 0 && index < activeIndex) {
      const distanceFromActive = activeIndex - index - 1;
      const progress = Math.max(
        0,
        Math.min(
          CONNECTION_ROW_DRAG_STEP,
          -dragY - distanceFromActive * CONNECTION_ROW_DRAG_STEP,
        ),
      );
      return { transform: [{ translateY: progress }] };
    }

    return { transform: [{ translateY: 0 }] };
  });

  return (
    <Animated.View
      style={[{ position: 'relative' }, siblingShiftStyle]}
    >
      <GestureDetector gesture={gesture}>
        <Animated.View style={[{ position: 'relative' }, animatedStyle]}>
          {children}
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 8,
                left: 0,
                borderColor: '#3b82f6',
                borderRadius: 12,
                borderStyle: 'dashed',
                backgroundColor: 'rgba(59, 130, 246, 0.06)',
                pointerEvents: 'none',
              },
              placeholderStyle,
            ]}
          />
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

export function CardSectionEditor({
  activeEditTab,
  activeSection,
  card,
  editBarCollapsed = false,
  fullOpen = false,
  onActiveSectionChange,
  onConnectionsChange,
  onFieldChange,
  onLayoutChange,
  onThemeChange,
  onSaveCustomTheme,
  onCloseStyling,
  onOpenStyling,
  onProfessionalFieldFocus,
  profile,
  showSectionNavigation = true,
  stylingOpen,
}: {
  activeEditTab: EditHomeTab;
  activeSection: CardSectionId;
  card: EditableCard;
  editBarCollapsed?: boolean;
  fullOpen?: boolean;
  profile: Profile;
  onActiveSectionChange: (section: CardSectionId) => void;
  onConnectionsChange: (fields: DynamicCardField[]) => void;
  onFieldChange: (field: CardSectionFieldId, value: string) => void;
  onLayoutChange: (section: CardSectionId, template: CardTemplateId) => void;
  onThemeChange: (section: CardSectionId, theme: CardVisualTheme) => void;
  onSaveCustomTheme: (section: CardSectionId, entry: SavedSectionTheme) => void;
  onCloseStyling: () => void;
  onOpenStyling: () => void;
  onProfessionalFieldFocus?: () => void;
  showSectionNavigation?: boolean;
  stylingOpen: boolean;
}) {
  const { width } = useWindowDimensions();
  const sections = useMemo(() => createCardDetailTemplate(card, profile), [card, profile]);
  const section = sections.find((item) => item.id === activeSection)!;
  const editorPaneWidth = Math.min(720, Math.max(260, width - 40));
  const taglineCharacterLimit = getResponsiveTaglineLimit(width);
  const accreditationCharacterLimit = getResponsiveAccreditationLimit(width);
  const [selectedIdentityImage, setSelectedIdentityImage] = useState<IdentityImageField | null>(null);
  const [expandedProfessionalGroups, setExpandedProfessionalGroups] = useState<Record<string, boolean>>({});
  const [editingConnectionId, setEditingConnectionId] = useState<string | null>(null);
  const [customFieldPickerOpen, setCustomFieldPickerOpen] = useState(false);
  const [customFieldSearch, setCustomFieldSearch] = useState('');
  const [pendingConnectionField, setPendingConnectionField] = useState<{
    title: string;
    type: DynamicCardFieldType;
  } | null>(null);
  const [pendingConnectionValue, setPendingConnectionValue] = useState('');
  const activeConnectionDragIndex = useSharedValue(-1);
  const connectionDragOffsetY = useSharedValue(0);

  useEffect(() => {
    if (activeSection === 'professional' && activeEditTab === 'content') {
      setExpandedProfessionalGroups(
        fullOpen
          ? { career: true, tagline: true, accreditations: true, name: true }
          : {},
      );
    }
  }, [activeEditTab, activeSection, fullOpen]);

  const toggleProfessionalGroup = (group: string) => {
    setExpandedProfessionalGroups((current) => ({
      ...current,
      [group]: !current[group],
    }));
  };
  const resolvedValues = Object.fromEntries(section.fields.map((field) => [field.id, field.value]));

  const getFieldValue = (fieldId: CardSectionFieldId) =>
    card.sectionOverrides[fieldId] ?? resolvedValues[fieldId] ?? '';
  const taglineValue = fitTaglineToViewport(getFieldValue('tagline'), width);
  const accreditationValue = fitAccreditationsToViewport(
    getFieldValue('accreditations'),
    width,
  );

  const connectionFields = card.connectionFieldsCustomized
    ? card.connectionFields
    : section.fields.map(
        (field) =>
          ({
            id: field.id,
            title: field.title,
            type: field.type === 'image' || field.type === 'multiline' ? 'text' : field.type,
            value: field.value,
          } as DynamicCardField)
      );
  const connectionFieldsRef = useRef(connectionFields);
  connectionFieldsRef.current = connectionFields;

  const changeConnection = (index: number, patch: Partial<DynamicCardField>) =>
    onConnectionsChange(
      connectionFields.map((field, i) => (i === index ? { ...field, ...patch } : field))
    );

  const setEditingConnection = (fieldId: string | null) => {
    LayoutAnimation.configureNext(CONNECTION_ACTION_ANIMATION);
    setEditingConnectionId(fieldId);
  };
  const moveConnection = (from: number, to: number) => {
    if (from === to) return;
    const reordered = [...connectionFieldsRef.current];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    connectionFieldsRef.current = reordered;
    onConnectionsChange(reordered);
  };
  const normalizeConnectionTitle = (title: string) => title.toLowerCase().replace(/[^a-z0-9]/g, '');
  const availableConnectionFields = AVAILABLE_CONNECTION_FIELDS.filter(
    (option) =>
      option.title.toLowerCase().includes(customFieldSearch.trim().toLowerCase()) &&
      !connectionFields.some(
        (field) => normalizeConnectionTitle(field.title) === normalizeConnectionTitle(option.title),
      ),
  );
  const addConnectionField = (
    option: { title: string; type: DynamicCardFieldType },
    value: string,
  ) => {
    const idBase = normalizeConnectionTitle(option.title) || 'custom';
    onConnectionsChange([
      ...connectionFields,
      {
        id: `${idBase}-${Date.now()}`,
        title: option.title,
        type: option.type,
        value: value.trim(),
      },
    ]);
    setCustomFieldSearch('');
    setPendingConnectionField(null);
    setPendingConnectionValue('');
    setCustomFieldPickerOpen(false);
  };
  const toggleCustomFieldPicker = () => {
    LayoutAnimation.configureNext(CONNECTION_ACTION_ANIMATION);
    setEditingConnectionId(null);
    setCustomFieldPickerOpen((current) => !current);
  };
  const showExistingConnectionFields =
    !customFieldPickerOpen && pendingConnectionField === null;

  // 1. IDENTITY CONTENT ZONE
  const renderIdentityImageField = (fieldId: IdentityImageField) => {
    const option = IDENTITY_IMAGE_OPTIONS.find((item) => item.id === fieldId)!;
    return (
      <ImageUploadField
        label={option.label}
        description={option.description}
        variant={option.variant}
        value={getFieldValue(option.id)}
        onChange={(uri) => onFieldChange(option.id, uri)}
        onRemove={() => onFieldChange(option.id, '')}
      />
    );
  };

  const compactIdentityContent = (
    <View>
      {selectedIdentityImage ? (
        <>
          <Pressable
            accessibilityLabel="Back to image selection"
            accessibilityRole="button"
            onPress={() => setSelectedIdentityImage(null)}
            className="mb-3 self-start flex-row items-center rounded-full border border-slate-200 bg-card px-3 py-2 active:opacity-70 dark:border-slate-700 dark:bg-dark-card"
          >
            <ChevronLeft color="#3b82f6" size={18} />
            <Text className="ml-1.5 text-sm font-bold text-primary dark:text-dark-primary">
              Back to images
            </Text>
          </Pressable>
          {renderIdentityImageField(selectedIdentityImage)}
        </>
      ) : (
        <View>
          <View className="mb-4">
            <Text className="mb-2 ml-1 text-xs font-bold uppercase tracking-wider text-textMuted dark:text-slate-400">
              Preferred Name
            </Text>
            <TextInput
              value={getFieldValue('preferredName')}
              onChangeText={(value) => onFieldChange('preferredName', value)}
              placeholder="e.g. Dr. Sampath Kambhampati"
              placeholderTextColor="#64748b"
              className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 text-base font-bold text-textPrimary dark:border-slate-700/80 dark:bg-[#060a14] dark:text-white"
              style={{ height: editBarCollapsed ? 72 : 52 }}
            />
          </View>
          <Pressable
            accessibilityLabel="Edit Cover Photo"
            accessibilityRole="button"
            onPress={() => setSelectedIdentityImage('coverPhoto')}
            className={`mb-2.5 overflow-hidden rounded-2xl border border-slate-200 bg-card active:border-primary dark:border-slate-700 dark:bg-dark-card ${
              editBarCollapsed ? 'h-28' : 'h-20'
            }`}
          >
            {getFieldValue('coverPhoto') ? (
              <Image
                source={{ uri: getFieldValue('coverPhoto') }}
                contentFit="cover"
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <View className="h-full items-center justify-center">
                <ImageIcon color="#3b82f6" size={22} />
              </View>
            )}
            <View className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-black/60">
              <Upload color="#ffffff" size={16} strokeWidth={2.4} />
            </View>
            <View className="absolute inset-x-0 bottom-0 bg-black/55 px-3 py-2">
              <Text className="text-xs font-bold text-white">Cover Photo</Text>
            </View>
          </Pressable>
          <View className="flex-row gap-2.5">
            {IDENTITY_IMAGE_OPTIONS.filter((option) => option.id !== 'coverPhoto').map((option) => {
              const imageUri = getFieldValue(option.id);
              return (
                <Pressable
                  key={option.id}
                  accessibilityLabel={`Edit ${option.label}`}
                  accessibilityRole="button"
                  onPress={() => setSelectedIdentityImage(option.id)}
                  className={`min-w-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-card active:border-primary dark:border-slate-700 dark:bg-dark-card ${
                    editBarCollapsed ? 'h-32' : 'h-24'
                  }`}
                >
                  {imageUri ? (
                    <Image
                      source={{ uri: imageUri }}
                      contentFit={option.variant === 'logo' ? 'contain' : 'cover'}
                      style={{ width: '100%', height: '100%' }}
                    />
                  ) : (
                    <View className="h-full items-center justify-center">
                      <ImageIcon color="#3b82f6" size={21} />
                    </View>
                  )}
                  <View className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-black/60">
                    <Upload color="#ffffff" size={16} strokeWidth={2.4} />
                  </View>
                  <View className="absolute inset-x-0 bottom-0 bg-black/55 px-2.5 py-2">
                    <Text className="text-center text-xs font-bold text-white" numberOfLines={1}>
                      {option.label}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );

  const identityContent = (
    <View>
      <View className="mb-4 rounded-[24px] border border-slate-200 bg-card p-4 dark:border-slate-800 dark:bg-[#0b1120]">
        <Text className="mb-1.5 ml-1 text-xs font-bold uppercase tracking-wider text-textMuted dark:text-slate-400">
          Preferred Name
        </Text>
        <TextInput
          value={getFieldValue('preferredName')}
          onChangeText={(val) => onFieldChange('preferredName', val)}
          placeholder="e.g. Dr. Sampath Kambhampati"
          placeholderTextColor="#64748b"
          className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-base font-bold text-textPrimary dark:border-slate-700/80 dark:bg-[#060a14] dark:text-white"
        />
      </View>

      <ImageUploadField
        label="Cover Photo"
        description="Hero image shown at the top of your identity section."
        variant="banner"
        value={getFieldValue('coverPhoto')}
        onChange={(uri) => onFieldChange('coverPhoto', uri)}
        onRemove={() => onFieldChange('coverPhoto', '')}
      />

      <ImageUploadField
        label="Profile Photo"
        description="Your headshot or avatar on the card."
        variant="avatar"
        value={getFieldValue('profilePhoto')}
        onChange={(uri) => onFieldChange('profilePhoto', uri)}
        onRemove={() => onFieldChange('profilePhoto', '')}
      />

      <ImageUploadField
        label="Company Logo"
        description="Company or personal mark displayed on the card."
        variant="logo"
        value={getFieldValue('logo')}
        onChange={(uri) => onFieldChange('logo', uri)}
        onRemove={() => onFieldChange('logo', '')}
      />
    </View>
  );

  // 2. PROFESSIONAL CONTENT ZONE
  const professionalContent = (
    <View>
      <CardEditorFieldGroup
        collapsible
        dense
        expanded={Boolean(expandedProfessionalGroups.name)}
        title="Professional Name"
        icon={UserRound}
        onToggle={() => toggleProfessionalGroup('name')}
      >
        <View className="flex-row gap-2">
          <View className="flex-[0.6]">
            <EditorInput
              roomy
              label="Prefix"
              value={getFieldValue('prefix')}
              onChangeText={(val) => onFieldChange('prefix', val)}
              onFocus={onProfessionalFieldFocus}
              placeholder="Dr., Prof."
            />
          </View>
          <View className="flex-[1.4]">
            <EditorInput
              roomy
              label="First Name"
              value={getFieldValue('firstName')}
              onChangeText={(val) => onFieldChange('firstName', val)}
              onFocus={onProfessionalFieldFocus}
              placeholder="First name"
            />
          </View>
        </View>
        <View className="flex-row gap-2">
          <View className="flex-[0.85]">
            <EditorInput
              roomy
              label="Middle Name"
              value={getFieldValue('middleName')}
              onChangeText={(val) => onFieldChange('middleName', val)}
              onFocus={onProfessionalFieldFocus}
              placeholder="Middle name"
            />
          </View>
          <View className="flex-[1.15]">
            <EditorInput
              roomy
              label="Last Name"
              value={getFieldValue('lastName')}
              onChangeText={(val) => onFieldChange('lastName', val)}
              onFocus={onProfessionalFieldFocus}
              placeholder="Last name"
            />
          </View>
        </View>
        <EditorInput
          roomy
          label="Suffix"
          value={getFieldValue('suffix')}
          onChangeText={(val) => onFieldChange('suffix', val)}
          onFocus={onProfessionalFieldFocus}
          placeholder="Jr., Sr., III"
        />
      </CardEditorFieldGroup>

      <CardEditorFieldGroup
        collapsible
        dense
        expanded={Boolean(expandedProfessionalGroups.career)}
        title="Job Title & Company"
        icon={Briefcase}
        onToggle={() => toggleProfessionalGroup('career')}
      >
        <EditorInput
          roomy
          label="Job Title"
          value={getFieldValue('title')}
          onChangeText={(val) => onFieldChange('title', val)}
          onFocus={onProfessionalFieldFocus}
          placeholder="e.g. Founder & Chief Executive Officer"
        />
        <EditorInput
          roomy
          label="Company Name"
          value={getFieldValue('company')}
          onChangeText={(val) => onFieldChange('company', val)}
          onFocus={onProfessionalFieldFocus}
          placeholder="e.g. MindPros Technologies"
        />
      </CardEditorFieldGroup>

      <CardEditorFieldGroup
        collapsible
        dense
        expanded={Boolean(expandedProfessionalGroups.accreditations)}
        title="Accreditations & Certifications"
        icon={Award}
        onToggle={() => toggleProfessionalGroup('accreditations')}
      >
        <EditorInput
          roomy
          label="Accreditations"
          maxLength={accreditationCharacterLimit}
          value={accreditationValue}
          onChangeText={(val) => onFieldChange('accreditations', val)}
          onFocus={onProfessionalFieldFocus}
          placeholder="e.g. MS, BE, PhD, MBA"
        />
      </CardEditorFieldGroup>

      <CardEditorFieldGroup
        collapsible
        dense
        expanded={Boolean(expandedProfessionalGroups.tagline)}
        title="Tagline & Headline"
        headerAccessory={
          <Text className="ml-2 text-xs font-semibold text-textMuted dark:text-slate-400">
            {Math.min(taglineValue.length, taglineCharacterLimit)}/{taglineCharacterLimit}
          </Text>
        }
        icon={Quote}
        onToggle={() => toggleProfessionalGroup('tagline')}
      >
        <EditorInput
          roomy
          hideLabel
          label="Tagline"
          maxLength={taglineCharacterLimit}
          value={taglineValue}
          onChangeText={(val) => onFieldChange('tagline', val)}
          onFocus={onProfessionalFieldFocus}
          placeholder="e.g. Building thoughtful digital products"
        />
      </CardEditorFieldGroup>
    </View>
  );

  // 3. BIO CONTENT ZONE
  const bioVal = getFieldValue('bio');

  const bioContent = (
    <View>
      <CardEditorFieldGroup
        title="Professional Biography"
        icon={AlignLeft}
      >
        <EditorInput
          hideLabel
          label="Biography Narrative"
          multiline
          value={bioVal}
          onChangeText={(val) => onFieldChange('bio', val)}
          placeholder="Write your professional bio, mission, background, and achievements..."
        />
      </CardEditorFieldGroup>
    </View>
  );

  // 4. CONNECTIONS CONTENT ZONE
  const connectionsContent = (
    <View>
      <View className="mb-4">
        <Pressable
          accessibilityLabel={`${customFieldPickerOpen ? 'Close' : 'Open'} add custom field list`}
          accessibilityRole="button"
          accessibilityState={{ expanded: customFieldPickerOpen }}
          onPress={toggleCustomFieldPicker}
          className={`min-h-[60px] flex-row items-center justify-center border-2 border-dashed border-primary/40 bg-blue-50/50 active:opacity-75 dark:border-primary/40 dark:bg-blue-950/20 ${
            customFieldPickerOpen ? 'rounded-t-2xl' : 'rounded-2xl'
          }`}
        >
          <Plus color="#3b82f6" size={19} strokeWidth={2.5} />
          <Text className="ml-2 font-bold text-primary dark:text-dark-primary">Add Custom Field</Text>
          <View className="absolute right-4">
            {customFieldPickerOpen ? (
              <ChevronUp color="#64748b" size={20} />
            ) : (
              <ChevronDown color="#64748b" size={20} />
            )}
          </View>
        </Pressable>

        {customFieldPickerOpen ? (
          <View className="pt-3">
            <Text className="mb-3 px-1 text-xs leading-5 text-textMuted dark:text-slate-400">
              Choose a platform, enter its value, and add it to your contact list.
            </Text>
            <View className="mb-3 flex-row items-center rounded-xl border border-slate-200 bg-white px-3 shadow-sm dark:border-slate-700 dark:bg-[#060a14]">
              <Search color="#64748b" size={17} />
              <TextInput
                accessibilityLabel="Search available fields"
                value={customFieldSearch}
                onChangeText={setCustomFieldSearch}
                placeholder="Search platforms"
                placeholderTextColor="#64748b"
                className="ml-2 min-h-[46px] flex-1 text-sm font-semibold text-textPrimary dark:text-white"
              />
            </View>
            <View>
              {availableConnectionFields.map((option) => {
                const Icon = getFieldIcon(option.title, option.type);
                return (
                  <Pressable
                    key={option.title}
                    accessibilityLabel={`Add ${option.title}`}
                    accessibilityRole="button"
                    onPress={() => {
                      setPendingConnectionField(option);
                      setPendingConnectionValue('');
                    }}
                    className="mb-2 flex-row items-center rounded-xl border border-slate-200 bg-white px-3 py-2.5 active:border-blue-400 active:bg-blue-50 dark:border-slate-800 dark:bg-slate-900/70"
                  >
                    <View className="h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                      <Icon color="#3b82f6" size={18} />
                    </View>
                    <Text className="ml-3 flex-1 text-sm font-bold text-textPrimary dark:text-white">
                      {option.title}
                    </Text>
                    <View className="h-8 w-8 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/60">
                      <Plus color="#3b82f6" size={17} strokeWidth={2.5} />
                    </View>
                  </Pressable>
                );
              })}
              {!availableConnectionFields.length ? (
                <Text className="py-6 text-center text-sm text-textMuted dark:text-slate-400">
                  No available fields found
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}
      </View>

      {/* Connection Fields List */}
      {showExistingConnectionFields ? connectionFields.map((field, index) => {
        const Icon = getFieldIcon(field.id, field.type);
        const editing = editingConnectionId === field.id;
        const placeholder =
          field.type === 'email'
            ? 'name@example.com'
            : field.type === 'phone'
              ? '+1 (555) 000-0000'
              : field.type === 'url'
                ? 'https://example.com'
                : `Enter ${field.title.toLowerCase()}`;
        return (
          <DraggableConnectionRow
            key={field.id}
            activeDragIndex={activeConnectionDragIndex}
            dragOffsetY={connectionDragOffsetY}
            index={index}
            itemCount={connectionFields.length}
            onMove={moveConnection}
          >
            <View
              className={`mb-2 flex-row items-center border px-3 py-2.5 dark:bg-[#0b1120] ${
                editing
                  ? 'rounded-xl border-blue-400 bg-blue-50 dark:border-blue-500/70'
                  : 'rounded-xl border-slate-200 bg-card dark:border-slate-800'
              }`}
            >
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                <Icon color="#3b82f6" size={18} />
              </View>
              <View className="ml-3 min-w-0 flex-1">
                {editing ? (
                  <BottomSheetTextInput
                    autoFocus
                    value={field.value}
                    onChangeText={(value) => changeConnection(index, { value })}
                    onSubmitEditing={() => setEditingConnection(null)}
                    placeholder={placeholder}
                    placeholderTextColor="#64748b"
                    className="min-h-[42px] rounded-lg bg-white px-3 text-sm font-semibold text-textPrimary dark:bg-[#060a14] dark:text-white"
                    returnKeyType="done"
                  />
                ) : (
                  <Text className="text-sm font-bold text-textPrimary dark:text-white" numberOfLines={1}>
                    {field.title}
                  </Text>
                )}
              </View>
              <Pressable
                accessibilityLabel={`${editing ? 'Finish editing' : 'Edit'} ${field.title}`}
                accessibilityRole="button"
                onPress={() => setEditingConnection(editing ? null : field.id)}
                className={`ml-2 h-9 w-9 items-center justify-center rounded-lg ${
                  editing ? 'bg-blue-500' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                {editing ? (
                  <Check color="#ffffff" size={17} strokeWidth={2.7} />
                ) : (
                  <Pencil color="#3b82f6" size={16} />
                )}
              </Pressable>
              {!editing ? (
                <Pressable
                  accessibilityLabel={`Delete ${field.title}`}
                  accessibilityRole="button"
                  onPress={() =>
                    onConnectionsChange(connectionFields.filter((_, itemIndex) => itemIndex !== index))
                  }
                  className="ml-1.5 h-9 w-9 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/40"
                >
                  <Trash2 color="#ef4444" size={16} />
                </Pressable>
              ) : null}
            </View>
          </DraggableConnectionRow>
        );
      }) : null}

      <Modal
        animationType="fade"
        transparent
        visible={Boolean(pendingConnectionField)}
        onRequestClose={() => {
          setPendingConnectionField(null);
          setPendingConnectionValue('');
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 justify-center bg-black/60 px-5"
        >
          {pendingConnectionField ? (
            <View className="w-full max-w-xl self-center rounded-[24px] border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-[#0b1120]">
              <View className="mb-4 flex-row items-center">
                {(() => {
                  const Icon = getFieldIcon(
                    pendingConnectionField.title,
                    pendingConnectionField.type,
                  );
                  return (
                    <View className="h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60">
                      <Icon color="#3b82f6" size={20} />
                    </View>
                  );
                })()}
                <View className="ml-3 min-w-0 flex-1">
                  <Text className="text-base font-bold text-textPrimary dark:text-white">
                    Add {pendingConnectionField.title}
                  </Text>
                  <Text className="mt-0.5 text-xs text-textMuted dark:text-slate-400">
                    Enter the value you want displayed on your card
                  </Text>
                </View>
              </View>

              <TextInput
                autoFocus
                accessibilityLabel={`${pendingConnectionField.title} value`}
                value={pendingConnectionValue}
                onChangeText={setPendingConnectionValue}
                onSubmitEditing={() => {
                  if (pendingConnectionValue.trim()) {
                    addConnectionField(pendingConnectionField, pendingConnectionValue);
                  }
                }}
                placeholder={
                  pendingConnectionField.type === 'email'
                    ? 'name@example.com'
                    : pendingConnectionField.type === 'phone'
                      ? '+1 (555) 000-0000'
                      : pendingConnectionField.type === 'url'
                        ? 'https://example.com'
                        : `Enter ${pendingConnectionField.title.toLowerCase()}`
                }
                placeholderTextColor="#64748b"
                className="min-h-[54px] rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-textPrimary dark:border-slate-700 dark:bg-[#060a14] dark:text-white"
                keyboardType={
                  pendingConnectionField.type === 'email'
                    ? 'email-address'
                    : pendingConnectionField.type === 'phone'
                      ? 'phone-pad'
                      : pendingConnectionField.type === 'url'
                        ? 'url'
                        : 'default'
                }
                returnKeyType="done"
              />

              <View className="mt-5 flex-row justify-end gap-2">
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setPendingConnectionField(null);
                    setPendingConnectionValue('');
                  }}
                  className="min-h-[44px] items-center justify-center rounded-xl border border-slate-200 px-5 active:opacity-70 dark:border-slate-700"
                >
                  <Text className="font-bold text-textPrimary dark:text-white">Cancel</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={!pendingConnectionValue.trim()}
                  onPress={() => addConnectionField(pendingConnectionField, pendingConnectionValue)}
                  className="min-h-[44px] items-center justify-center rounded-xl bg-blue-500 px-6 active:opacity-70 disabled:opacity-40"
                >
                  <Text className="font-bold text-white">Add</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );

  const activeContent =
    activeSection === 'identity'
      ? (
          <EditorPresentationCrossfade
            compact={compactIdentityContent}
            expanded={identityContent}
            compactHeight={selectedIdentityImage ? 470 : editBarCollapsed ? 410 : 330}
            expandedHeight={1120}
          />
        )
      : activeSection === 'professional'
      ? professionalContent
      : activeSection === 'bio'
      ? bioContent
      : connectionsContent;

  const editZone = (
    <View style={{ width: editorPaneWidth, maxWidth: '100%', alignSelf: 'center' }}>
      {stylingOpen ? (
        <View>
          <CardStylingCustomizer
            backLabel={`Back to ${activeEditTab === 'layout' ? 'Layout' : 'Content'}`}
            customThemes={card.customThemes ?? []}
            onBack={onCloseStyling}
            theme={card.sectionThemes[activeSection]}
            onChange={(theme) => onThemeChange(activeSection, theme)}
            onSaveCustomTheme={(entry) => onSaveCustomTheme(activeSection, entry)}
          />
        </View>
      ) : (
        <View>
          {activeEditTab === 'layout' ? (
            <>
              <EditorPresentationCrossfade
                compactHeight={48}
                expandedHeight={112}
                compact={
                  <View className="flex-row items-center justify-between gap-3">
                    <Text className="min-w-0 flex-1 text-xs font-bold uppercase tracking-wider text-textMuted dark:text-dark-textMuted">
                      Choose a design layout
                    </Text>
                    <EditorStylingLauncher compact onPress={onOpenStyling} />
                  </View>
                }
                expanded={
                  <View>
                    <EditorStylingLauncher onPress={onOpenStyling} />
                    <EditorSectionLabel title="Choose a design layout" />
                  </View>
                }
              />
              <LayoutTemplatePicker
                showHeader={false}
                section={activeSection}
                selectedTemplateId={section.templateId}
                theme={card.sectionThemes[activeSection]}
                onSelect={(templateId) => onLayoutChange(activeSection, templateId)}
              />
            </>
          ) : (
            <View>
              {activeContent}
            </View>
          )}
        </View>
      )}
    </View>
  );

  return (
    <View>
      {showSectionNavigation ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {SECTIONS.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => onActiveSectionChange(item.id)}
              className={`mr-2 rounded-full px-4 py-2 ${
                activeSection === item.id ? 'bg-primary dark:bg-dark-primary' : 'bg-card dark:bg-dark-card'
              }`}
            >
              <Text
                className={
                  activeSection === item.id
                    ? 'font-bold text-white'
                    : 'font-semibold text-textPrimary dark:text-dark-textPrimary'
                }
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
      {editZone}
    </View>
  );
}
