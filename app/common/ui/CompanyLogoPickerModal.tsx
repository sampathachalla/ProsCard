import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  Building2,
  Check,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '@/context/ThemeContext';
import {
  filterCompanyLogoPresets,
  fetchCommunityUploadedLogos,
  type CommunityCompanyLogoItem,
} from '@/pages/cards/Services/companyLogoPresets';
import { MediaImage } from './MediaImage';
import { Text } from './Text';

export type CompanyLogoPickerModalProps = {
  visible: boolean;
  value?: string;
  isUploading?: boolean;
  onClose: () => void;
  onSelectLogo: (logoValue: string, companyName?: string) => void;
  onUploadFromDevice: () => void;
  onRemoveLogo?: () => void;
};

export function CompanyLogoPickerModal({
  visible,
  value = '',
  isUploading = false,
  onClose,
  onSelectLogo,
  onUploadFromDevice,
  onRemoveLogo,
}: CompanyLogoPickerModalProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [communityLogos, setCommunityLogos] = useState<CommunityCompanyLogoItem[]>([]);
  const [isSearchingCommunity, setIsSearchingCommunity] = useState(false);
  const isExpanded = isSearchFocused || searchQuery.trim().length > 0;
  const sheetTranslateY = useSharedValue(0);
  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.get() }],
  }));
  const handleClose = () => {
    setSearchQuery('');
    setIsSearchFocused(false);
    setCommunityLogos([]);
    setIsSearchingCommunity(false);
    onClose();
  };
  const closeFromSwipe = () => {
    sheetTranslateY.set(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    handleClose();
  };
  const dragHandleGesture = Gesture.Pan()
    .activeOffsetY(4)
    .failOffsetY(-10)
    .failOffsetX([-64, 64])
    .shouldCancelWhenOutside(false)
    .onUpdate((event) => {
      sheetTranslateY.set(Math.max(0, event.translationY));
    })
    .onEnd((event) => {
      const projectedDistance = event.translationY + Math.max(0, event.velocityY) * 0.08;
      if (event.translationY >= 24 && projectedDistance >= 42) {
        runOnJS(closeFromSwipe)();
      } else {
        sheetTranslateY.set(withSpring(0));
      }
    });

  const filteredPresets = useMemo(
    () => filterCompanyLogoPresets(searchQuery),
    [searchQuery],
  );
  const displayedLogos = useMemo(() => {
    if (!searchQuery.trim()) {
      return filteredPresets.map((preset) => ({
        id: `preset-${preset.id}`,
        label: preset.label,
        value: preset.value,
        isCommunity: false,
      }));
    }
    const seen = new Set<string>();
    return [
      ...communityLogos.map((logo) => ({
        id: `community-${logo.id}`,
        label: logo.name,
        value: logo.value,
        isCommunity: true,
      })),
      ...filteredPresets.map((preset) => ({
        id: `preset-${preset.id}`,
        label: preset.label,
        value: preset.value,
        isCommunity: false,
      })),
    ].filter((logo) => {
      if (seen.has(logo.value)) return false;
      seen.add(logo.value);
      return true;
    }).slice(0, 4);
  }, [communityLogos, filteredPresets, searchQuery]);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      const query = searchQuery.trim();
      if (!visible || !query) {
        setCommunityLogos([]);
        setIsSearchingCommunity(false);
        return;
      }
      setIsSearchingCommunity(true);
      void fetchCommunityUploadedLogos(query)
        .then((items) => {
          if (!cancelled) setCommunityLogos(items);
        })
        .finally(() => {
          if (!cancelled) setIsSearchingCommunity(false);
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, visible]);

  const handlePick = (logoValue: string, label?: string) => {
    Haptics.selectionAsync().catch(() => {});
    onSelectLogo(logoValue, label);
    handleClose();
  };

  const hasCurrentLogo = Boolean(value.trim());

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end bg-black/75">
        <Animated.View
          className="w-full overflow-hidden rounded-t-3xl border-t border-slate-200 bg-background dark:border-slate-800 dark:bg-[#020617]"
          style={[{
            paddingBottom: Math.max(insets.bottom, 16),
            height: isExpanded ? '92%' : '56%',
            maxHeight: '90%',
          }, sheetAnimatedStyle]}
        >
          {/* Top Drag Handle */}
          <GestureDetector gesture={dragHandleGesture}>
            <View
              accessibilityLabel="Drag down to close company logo library"
              accessibilityRole="adjustable"
              className="min-h-9 items-center justify-center"
            >
              <View className="h-1.5 w-11 rounded-full bg-slate-300 dark:bg-slate-700" />
            </View>
          </GestureDetector>

          {/* Modal Header */}
          <View className="flex-row items-center justify-between border-b border-slate-200 px-6 pb-5 pt-1 dark:border-slate-800">
            <View className="flex-1 pr-3">
              <Text className="text-xl font-bold text-textPrimary dark:text-white">
                Company Logo Library
              </Text>
              <Text className="mt-1 text-sm text-textMuted dark:text-slate-400">
                Select a company logo or upload your own
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close logo picker"
              onPress={handleClose}
              className="size-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 active:opacity-80 dark:border-slate-700 dark:bg-[#0f172a]"
            >
              <X color={isDark ? '#cbd5e1' : '#334155'} size={22} strokeWidth={2.4} />
            </Pressable>
          </View>

          <View className="px-6 pt-5">
            {/* Upload Custom Photo Action Row + Current Logo Preview */}
            <View className="mb-4 flex-row items-center gap-3">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Upload custom logo from photo library"
                disabled={isUploading}
                onPress={onUploadFromDevice}
                className="min-h-14 flex-1 flex-row items-center justify-center gap-2.5 rounded-2xl bg-[#0284c7] px-4 active:opacity-85"
              >
                {isUploading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <Upload color="#ffffff" size={18} strokeWidth={2.4} />
                    <Text className="text-base font-semibold text-white">
                      Upload from Device Photos
                    </Text>
                  </>
                )}
              </Pressable>

              {hasCurrentLogo && onRemoveLogo ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Remove current logo"
                  disabled={isUploading}
                  onPress={() => {
                    Alert.alert(
                      'Remove company logo?',
                      'The logo will be removed from this card.',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Remove',
                          style: 'destructive',
                          onPress: () => {
                            onRemoveLogo();
                            handleClose();
                          },
                        },
                      ],
                    );
                  }}
                  className="min-h-14 flex-row items-center justify-center gap-2 rounded-2xl border border-rose-300 bg-rose-50 px-4 active:opacity-80 dark:border-rose-900 dark:bg-rose-950/40"
                >
                  <Trash2 color="#f87171" size={17} strokeWidth={2.2} />
                  <Text className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                    Remove
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {/* Search Input (Flat solid-filled rounded-lg matching VCPros input system) */}
            <View className="mb-4 min-h-14 flex-row items-center rounded-2xl border border-slate-300 bg-slate-100 px-4 dark:border-slate-700 dark:bg-[#1e293b]">
              <Search color={isDark ? '#94a3b8' : '#64748b'} size={20} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => {
                  if (!searchQuery.trim()) setIsSearchFocused(false);
                }}
                placeholder="Type a company name..."
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                autoCapitalize="none"
                autoCorrect={false}
                className="ml-3 flex-1 py-3 text-base text-slate-900 dark:text-white"
              />
              {searchQuery.length > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  onPress={() => setSearchQuery('')}
                  className="size-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700"
                >
                  <X color={isDark ? '#e2e8f0' : '#334155'} size={14} />
                </Pressable>
              ) : null}
            </View>

          </View>

          {/* Main Scrollable Logo Grid */}
          <ScrollView
            className="flex-1 px-6"
            contentContainerStyle={{ paddingBottom: 28, paddingTop: 8 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-base font-semibold text-slate-900 dark:text-white">Company logos</Text>
              <Text className="text-sm text-slate-500 dark:text-slate-400">
                {isSearchingCommunity ? 'Searching uploads…' : searchQuery.trim() ? 'Best matches' : 'Popular suggestions'}
              </Text>
            </View>

            {/* Local Simple Icons brand catalog */}
                {displayedLogos.length > 0 ? (
                  <View className="flex-row flex-wrap justify-between gap-y-3">
                    {displayedLogos.map((logo) => {
                      const selected = value === logo.value;
                      return (
                        <Pressable
                          key={logo.id}
                          accessibilityRole="button"
                          accessibilityLabel={`Select ${logo.label} logo${logo.isCommunity ? ' from community uploads' : ''}`}
                          accessibilityState={{ selected }}
                          onPress={() => handlePick(logo.value, logo.label)}
                          style={{ width: '48.2%' }}
                          className={`min-h-20 flex-row items-center rounded-2xl border p-3 active:opacity-85 ${
                            selected
                              ? 'border-sky-400 bg-sky-500/10 dark:border-sky-400 dark:bg-[#132038]'
                              : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-[#0f172a]'
                          }`}
                        >
                          <View className="size-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-1">
                            <MediaImage
                              sourceUrl={logo.value}
                              contentFit="contain"
                              style={{ width: 42, height: 34 }}
                            />
                          </View>
                          <Text
                            numberOfLines={2}
                            className="ml-3 flex-1 text-base font-semibold text-slate-900 dark:text-white"
                          >
                            {logo.label}
                          </Text>
                          {selected ? (
                            <View className="size-5 items-center justify-center rounded-full bg-sky-500">
                              <Check color="#ffffff" size={12} strokeWidth={3} />
                            </View>
                          ) : null}
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}

                {searchQuery.trim().length > 0 && displayedLogos.length === 0 && !isSearchingCommunity ? (
                  <View className="items-center rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-[#0f172a]">
                    <Building2 color="#64748b" size={28} />
                    <Text className="mt-2 text-center text-sm font-bold text-slate-800 dark:text-slate-200">
                      No matching brand icon found
                    </Text>
                    <Text className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">
                      Upload your company’s official logo from your device instead.
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Upload company logo from device"
                      onPress={onUploadFromDevice}
                      className="mt-4 flex-row items-center gap-2 rounded-lg bg-[#0284c7] px-4 py-2.5 active:opacity-85"
                    >
                      <Upload color="#ffffff" size={16} />
                      <Text className="text-xs font-bold text-white">Upload Logo</Text>
                    </Pressable>
                  </View>
                ) : null}

          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
