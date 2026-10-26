import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Building2,
  Check,
  Globe,
  Search,
  Sparkles,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '@/context/ThemeContext';
import {
  COMPANY_LOGO_CATEGORIES,
  type CommunityCompanyLogoItem,
  type CompanyLogoCategory,
  fetchCommunityUploadedLogos,
  filterCompanyLogoPresets,
  type GlobalCompanySearchResult,
  searchGlobalCompanyLogos,
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

type PickerTab = 'brands' | 'community';

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

  const [activeTab, setActiveTab] = useState<PickerTab>('brands');
  const [selectedCategory, setSelectedCategory] = useState<CompanyLogoCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [globalResults, setGlobalResults] = useState<GlobalCompanySearchResult[]>([]);
  const [loadingGlobal, setLoadingGlobal] = useState(false);

  const [communityLogos, setCommunityLogos] = useState<CommunityCompanyLogoItem[]>([]);
  const [loadingCommunity, setLoadingCommunity] = useState(false);

  const filteredPresets = useMemo(
    () => filterCompanyLogoPresets(searchQuery, selectedCategory),
    [searchQuery, selectedCategory],
  );

  // Live global company search when typing 2+ characters
  useEffect(() => {
    if (!visible) return;
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setGlobalResults([]);
      setLoadingGlobal(false);
      return;
    }

    const controller = new AbortController();
    setLoadingGlobal(true);
    const timer = setTimeout(() => {
      searchGlobalCompanyLogos(trimmed, controller.signal)
        .then((results) => {
          if (!controller.signal.aborted) {
            setGlobalResults(results);
            setLoadingGlobal(false);
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setLoadingGlobal(false);
          }
        });
    }, 240);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, visible]);

  // Fetch community/user-uploaded logos when modal opens or search changes
  useEffect(() => {
    if (!visible) return;
    let active = true;
    setLoadingCommunity(true);
    const timer = setTimeout(() => {
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
        <View
          style={{
            paddingBottom: Math.max(insets.bottom, 16),
            maxHeight: '90%',
          }}
          className="h-[88%] w-full overflow-hidden rounded-t-[28px] border-t border-slate-200 bg-background dark:border-slate-800 dark:bg-[#020617]"
        >
          {/* Top Drag Handle */}
          <View className="items-center pb-1 pt-3">
            <View className="h-1.5 w-11 rounded-full bg-slate-300 dark:bg-slate-700" />
          </View>

          {/* Modal Header */}
          <View className="flex-row items-center justify-between border-b border-slate-200/80 px-5 pb-3.5 pt-2 dark:border-slate-800/80">
            <View className="flex-1 pr-3">
              <Text className="text-lg font-extrabold tracking-tight text-textPrimary dark:text-white">
                Company Logo Library
              </Text>
              <Text className="mt-0.5 text-xs text-textMuted dark:text-slate-400">
                Select a famous brand, community upload, or upload your own
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
                    onRemoveLogo();
                    onClose();
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
                placeholder="Search Microsoft, Google, Stripe, or any company..."
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

            {/* Segmented Mode Tabs: Famous Brands vs Uploaded by Users */}
            <View className="mb-3 flex-row rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-[#0f172a]">
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: activeTab === 'brands' }}
                onPress={() => setActiveTab('brands')}
                className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-md py-2.5 ${
                  activeTab === 'brands'
                    ? 'bg-white shadow-sm dark:bg-[#1e293b]'
                    : ''
                }`}
              >
                <Sparkles
                  color={activeTab === 'brands' ? '#38bdf8' : '#64748b'}
                  size={15}
                />
                <Text
                  className={`text-xs font-bold ${
                    activeTab === 'brands'
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Famous Companies
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: activeTab === 'community' }}
                onPress={() => setActiveTab('community')}
                className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-md py-2.5 ${
                  activeTab === 'community'
                    ? 'bg-white shadow-sm dark:bg-[#1e293b]'
                    : ''
                }`}
              >
                <Users
                  color={activeTab === 'community' ? '#38bdf8' : '#64748b'}
                  size={15}
                />
                <Text
                  className={`text-xs font-bold ${
                    activeTab === 'community'
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Community Uploads
                  {communityLogos.length > 0 ? ` (${communityLogos.length})` : ''}
                </Text>
              </Pressable>
            </View>

            {/* Category Filter Pills (Only on Famous Companies tab) */}
            {activeTab === 'brands' ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingBottom: 10 }}
              >
                {COMPANY_LOGO_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <Pressable
                      key={cat.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => setSelectedCategory(cat.id)}
                      className={`rounded-full border px-3.5 py-1.5 ${
                        isSelected
                          ? 'border-sky-400 bg-sky-500/15 dark:border-sky-400 dark:bg-sky-500/20'
                          : 'border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-[#0f172a]'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          isSelected
                            ? 'text-sky-600 dark:text-sky-300'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {cat.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            ) : null}
          </View>

          {/* Main Scrollable Logo Grid */}
          <ScrollView
            className="flex-1 px-5"
            contentContainerStyle={{ paddingBottom: 28, paddingTop: 4 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {activeTab === 'brands' ? (
              <>
                {/* Curated Famous Company Logos Grid */}
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
                          className={`overflow-hidden rounded-xl border p-3 active:opacity-85 ${
                            selected
                              ? 'border-sky-400 bg-sky-500/10 dark:border-sky-400 dark:bg-[#132038]'
                              : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-[#0f172a]'
                          }`}
                        >
                          <View className="h-14 w-full items-center justify-center rounded-lg bg-slate-900/90 px-2.5 py-1.5 dark:bg-[#070d19]">
                            <MediaImage
                              sourceUrl={preset.value}
                              contentFit="contain"
                              style={{ width: '100%', height: 42 }}
                            />
                          </View>
                          <View className="mt-2.5 flex-row items-center justify-between">
                            <View className="flex-1 pr-1">
                              <Text
                                numberOfLines={1}
                                className="text-xs font-bold text-slate-900 dark:text-white"
                              >
                                {preset.label}
                              </Text>
                              <Text
                                numberOfLines={1}
                                className="text-[10px] text-slate-500 dark:text-slate-400"
                              >
                                {preset.domain}
                              </Text>
                            </View>
                            {selected ? (
                              <View className="h-5 w-5 items-center justify-center rounded-full bg-sky-500">
                                <Check color="#ffffff" size={12} strokeWidth={3} />
                              </View>
                            ) : null}
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}

                {/* Global Web Company Search Results (for any company worldwide) */}
                {searchQuery.trim().length >= 2 ? (
                  <View className="mt-5">
                    <View className="mb-2.5 flex-row items-center justify-between">
                      <View className="flex-row items-center gap-1.5">
                        <Globe color="#38bdf8" size={14} />
                        <Text className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          More Companies Matching “{searchQuery.trim()}”
                        </Text>
                      </View>
                      {loadingGlobal ? (
                        <ActivityIndicator size="small" color="#38bdf8" />
                      ) : null}
                    </View>

                    {globalResults.length > 0 ? (
                      <View className="flex-row flex-wrap justify-between gap-y-3">
                        {globalResults.map((company) => {
                          const selected = value === company.logoUrl;
                          return (
                            <Pressable
                              key={company.id}
                              accessibilityRole="button"
                              accessibilityLabel={`Select ${company.name} logo`}
                              accessibilityState={{ selected }}
                              onPress={() => handlePick(company.logoUrl, company.name)}
                              style={{ width: '48.2%' }}
                              className={`overflow-hidden rounded-xl border p-3 active:opacity-85 ${
                                selected
                                  ? 'border-sky-400 bg-sky-500/10 dark:border-sky-400 dark:bg-[#132038]'
                                  : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-[#0f172a]'
                              }`}
                            >
                              <View className="h-14 w-full items-center justify-center rounded-lg bg-white px-2.5 py-1.5">
                                <MediaImage
                                  sourceUrl={company.logoUrl}
                                  contentFit="contain"
                                  style={{ width: '100%', height: 40 }}
                                />
                              </View>
                              <View className="mt-2.5 flex-row items-center justify-between">
                                <View className="flex-1 pr-1">
                                  <Text
                                    numberOfLines={1}
                                    className="text-xs font-bold text-slate-900 dark:text-white"
                                  >
                                    {company.name}
                                  </Text>
                                  <Text
                                    numberOfLines={1}
                                    className="text-[10px] text-slate-500 dark:text-slate-400"
                                  >
                                    {company.domain}
                                  </Text>
                                </View>
                                {selected ? (
                                  <View className="h-5 w-5 items-center justify-center rounded-full bg-sky-500">
                                    <Check color="#ffffff" size={12} strokeWidth={3} />
                                  </View>
                                ) : null}
                              </View>
                            </Pressable>
                          );
                        })}
                      </View>
                    ) : !loadingGlobal && filteredPresets.length === 0 ? (
                      <View className="items-center rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-[#0f172a]">
                        <Building2 color="#64748b" size={28} />
                        <Text className="mt-2 text-center text-sm font-bold text-slate-800 dark:text-slate-200">
                          No matching company logos found
                        </Text>
                        <Text className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">
                          You can upload your company’s custom logo directly from your device.
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}
              </>
            ) : (
              /* Tab 2: Community / User-Uploaded Logos */
              <View>
                {loadingCommunity ? (
                  <View className="items-center justify-center py-12">
                    <ActivityIndicator size="small" color="#38bdf8" />
                    <Text className="mt-2.5 text-xs text-slate-500 dark:text-slate-400">
                      Loading community uploaded logos…
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
                          className={`overflow-hidden rounded-xl border p-3 active:opacity-85 ${
                            selected
                              ? 'border-sky-400 bg-sky-500/10 dark:border-sky-400 dark:bg-[#132038]'
                              : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-[#0f172a]'
                          }`}
                        >
                          <View className="h-14 w-full items-center justify-center rounded-lg bg-slate-900/90 px-2.5 py-1.5 dark:bg-[#070d19]">
                            <MediaImage
                              sourceUrl={item.value}
                              contentFit="contain"
                              style={{ width: '100%', height: 42 }}
                            />
                          </View>
                          <View className="mt-2.5 flex-row items-center justify-between">
                            <View className="flex-1 pr-1">
                              <Text
                                numberOfLines={1}
                                className="text-xs font-bold text-slate-900 dark:text-white"
                              >
                                {item.name}
                              </Text>
                              <Text
                                numberOfLines={1}
                                className="text-[10px] text-slate-500 dark:text-slate-400"
                              >
                                {item.isOwn ? 'Uploaded by you' : 'Community upload'}
                              </Text>
                            </View>
                            {selected ? (
                              <View className="h-5 w-5 items-center justify-center rounded-full bg-sky-500">
                                <Check color="#ffffff" size={12} strokeWidth={3} />
                              </View>
                            ) : null}
                          </View>
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
                      Logos uploaded by you and other VC Pros members will appear here so anyone on your team can select them.
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      onPress={onUploadFromDevice}
                      className="mt-4 flex-row items-center gap-2 rounded-lg bg-[#0284c7] px-4 py-2.5 active:opacity-85"
                    >
                      <Upload color="#ffffff" size={16} />
                      <Text className="text-xs font-bold text-white">
                        Upload a Company Logo
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
