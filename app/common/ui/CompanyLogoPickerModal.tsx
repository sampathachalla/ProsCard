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
  Users,
  X,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '@/context/ThemeContext';
import {
  type CommunityCompanyLogoItem,
  fetchCommunityUploadedLogos,
  filterCompanyLogoPresets,
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
  const sheetTranslateY = useSharedValue(0);
  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.get() }],
  }));
  const closeFromSwipe = () => {
    sheetTranslateY.set(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onClose();
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

  const [searchQuery, setSearchQuery] = useState('');

  const [communityLogos, setCommunityLogos] = useState<CommunityCompanyLogoItem[]>([]);
  const [loadingCommunity, setLoadingCommunity] = useState(false);

  const filteredPresets = useMemo(
    () => filterCompanyLogoPresets(searchQuery),
    [searchQuery],
  );

  // Fetch community/user-uploaded logos when modal opens or search changes
  useEffect(() => {
    if (!visible) return;
    let active = true;
    const timer = setTimeout(() => {
      setLoadingCommunity(true);
      fetchCommunityUploadedLogos(searchQuery)
        .then((items) => {
          if (active) {
            setCommunityLogos(items);
            setLoadingCommunity(false);
          }
        })
        .catch(() => {
          if (active) setLoadingCommunity(false);
        });
    }, 150);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery, visible]);

  const handlePick = (logoValue: string, label?: string) => {
    Haptics.selectionAsync().catch(() => {});
    onSelectLogo(logoValue, label);
    onClose();
  };

  const hasCurrentLogo = Boolean(value.trim());

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/75">
        <Animated.View
          className="h-[66%] w-full overflow-hidden rounded-t-[28px] border-t border-slate-200 bg-background dark:border-slate-800 dark:bg-[#020617]"
          style={[{
            paddingBottom: Math.max(insets.bottom, 16),
            maxHeight: '90%',
          }, sheetAnimatedStyle]}
        >
          {/* Top Drag Handle */}
          <GestureDetector gesture={dragHandleGesture}>
            <View
              accessibilityLabel="Drag down to close company logo library"
              accessibilityRole="adjustable"
              className="min-h-10 items-center justify-center"
            >
              <View className="h-1.5 w-11 rounded-full bg-slate-300 dark:bg-slate-700" />
            </View>
          </GestureDetector>

          {/* Modal Header */}
          <View className="flex-row items-center justify-between border-b border-slate-200/80 px-5 pb-3.5 pt-2 dark:border-slate-800/80">
            <View className="flex-1 pr-3">
              <Text className="text-lg font-extrabold text-textPrimary dark:text-white">
                Company Logo Library
              </Text>
              <Text className="mt-0.5 text-xs text-textMuted dark:text-slate-400">
                Select a company logo or upload your own
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close logo picker"
              onPress={onClose}
              className="h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 active:opacity-80 dark:border-slate-700 dark:bg-[#0f172a]"
            >
              <X color={isDark ? '#cbd5e1' : '#334155'} size={18} strokeWidth={2.4} />
            </Pressable>
          </View>

          <View className="px-5 pt-3.5">
            {/* Upload Custom Photo Action Row + Current Logo Preview */}
            <View className="mb-3 flex-row items-center gap-2.5">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Upload custom logo from photo library"
                disabled={isUploading}
                onPress={onUploadFromDevice}
                className="min-h-[50px] flex-1 flex-row items-center justify-center gap-2.5 rounded-lg border border-sky-500/40 bg-[#0284c7] px-4 active:opacity-85"
              >
                {isUploading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <Upload color="#ffffff" size={18} strokeWidth={2.4} />
                    <Text className="text-sm font-bold text-white">
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
                            onClose();
                          },
                        },
                      ],
                    );
                  }}
                  className="min-h-[50px] flex-row items-center justify-center gap-1.5 rounded-lg border border-rose-500/35 bg-rose-500/10 px-3.5 active:opacity-80"
                >
                  <Trash2 color="#f87171" size={17} strokeWidth={2.2} />
                  <Text className="text-xs font-bold text-rose-500 dark:text-rose-400">
                    Remove
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {/* Search Input (Flat solid-filled rounded-lg matching VCPros input system) */}
            <View className="mb-3 min-h-[52px] flex-row items-center rounded-lg border border-slate-300 bg-slate-100 px-3.5 dark:border-slate-700 dark:bg-[#1e293b]">
              <Search color={isDark ? '#94a3b8' : '#64748b'} size={18} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search 3,000+ brand icons..."
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                autoCapitalize="none"
                autoCorrect={false}
                className="ml-2.5 flex-1 py-2.5 text-[15px] text-slate-900 dark:text-white"
              />
              {searchQuery.length > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  onPress={() => setSearchQuery('')}
                  className="h-7 w-7 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700"
                >
                  <X color={isDark ? '#e2e8f0' : '#334155'} size={14} />
                </Pressable>
              ) : null}
            </View>

          </View>

          {/* Main Scrollable Logo Grid */}
          <ScrollView
            className="flex-1 px-5"
            contentContainerStyle={{ paddingBottom: 28, paddingTop: 4 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="mb-3 mt-1 flex-row items-center justify-between">
              <Text className="text-sm font-bold text-slate-900 dark:text-white">Company logos</Text>
              <Text className="text-xs text-slate-500 dark:text-slate-400">
                {searchQuery.trim() ? `${filteredPresets.length} matches` : 'Popular'}
              </Text>
            </View>

            {/* Local Simple Icons brand catalog */}
                {filteredPresets.length > 0 ? (
                  <View className="flex-row flex-wrap justify-between gap-y-3">
                    {filteredPresets.map((preset) => {
                      const selected = value === preset.value;
                      return (
                        <Pressable
                          key={preset.id}
                          accessibilityRole="button"
                          accessibilityLabel={`Select ${preset.label} logo`}
                          accessibilityState={{ selected }}
                          onPress={() => handlePick(preset.value, preset.label)}
                          style={{ width: '48.2%' }}
                          className={`min-h-[72px] flex-row items-center rounded-xl border p-3 active:opacity-85 ${
                            selected
                              ? 'border-sky-400 bg-sky-500/10 dark:border-sky-400 dark:bg-[#132038]'
                              : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-[#0f172a]'
                          }`}
                        >
                          <View className="size-12 items-center justify-center rounded-lg border border-slate-200 bg-white px-1">
                            <MediaImage
                              sourceUrl={preset.value}
                              contentFit="contain"
                              style={{ width: 42, height: 34 }}
                            />
                          </View>
                          <Text
                            numberOfLines={2}
                            className="ml-3 flex-1 text-sm font-semibold text-slate-900 dark:text-white"
                          >
                            {preset.label}
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

                {searchQuery.trim().length > 0 && filteredPresets.length === 0 ? (
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

            <View className="mb-3 mt-6 flex-row items-center gap-2">
              <Users color={isDark ? '#94a3b8' : '#64748b'} size={17} />
              <Text className="text-sm font-bold text-slate-900 dark:text-white">
                Community logos
              </Text>
            </View>

            <View>
                {loadingCommunity ? (
                  <View className="items-center justify-center rounded-xl border border-slate-200 py-8 dark:border-slate-800">
                    <ActivityIndicator size="small" color="#38bdf8" />
                    <Text className="mt-2.5 text-xs text-slate-500 dark:text-slate-400">
                      Loading community logos…
                    </Text>
                  </View>
                ) : communityLogos.length > 0 ? (
                  <View className="flex-row flex-wrap justify-between gap-y-3">
                    {communityLogos.map((item) => {
                      const selected = value === item.value;
                      return (
                        <Pressable
                          key={item.id}
                          accessibilityRole="button"
                          accessibilityLabel={`Select ${item.name} uploaded logo`}
                          accessibilityState={{ selected }}
                          onPress={() => handlePick(item.value, item.name)}
                          style={{ width: '48.2%' }}
                          className={`min-h-[72px] flex-row items-center rounded-xl border p-3 active:opacity-85 ${
                            selected
                              ? 'border-sky-400 bg-sky-500/10 dark:border-sky-400 dark:bg-[#132038]'
                              : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-[#0f172a]'
                          }`}
                        >
                          <View className="size-12 items-center justify-center rounded-lg border border-slate-200 bg-white p-2">
                            <MediaImage
                              sourceUrl={item.value}
                              contentFit="contain"
                              style={{ width: 32, height: 32 }}
                            />
                          </View>
                          <Text
                            numberOfLines={2}
                            className="ml-3 flex-1 text-sm font-semibold text-slate-900 dark:text-white"
                          >
                            {item.name}
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
                ) : (
                  <View className="items-center rounded-xl border border-slate-200 bg-slate-50 px-5 py-8 dark:border-slate-800 dark:bg-[#0f172a]">
                    <Users color="#38bdf8" size={30} />
                    <Text className="mt-3 text-center text-sm font-bold text-slate-900 dark:text-white">
                      No Community Logos Yet
                    </Text>
                    <Text className="mt-1 text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      Other members’ uploaded company logos will appear here when available.
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      onPress={onUploadFromDevice}
                      className="mt-4 flex-row items-center gap-2 rounded-lg bg-[#0284c7] px-4 py-2.5 active:opacity-85"
                    >
                      <Upload color="#ffffff" size={16} />
                      <Text className="text-xs font-bold text-white">Upload Your Logo</Text>
                    </Pressable>
                  </View>
                )}
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
