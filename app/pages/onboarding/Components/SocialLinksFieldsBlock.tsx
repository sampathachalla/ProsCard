import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import {
  Briefcase,
  Check,
  ChevronDown,
  Plus,
  Trash2,
  X,
} from 'lucide-react-native';

import { Text } from '@/common/ui/Text';
import { SocialMediaIcon } from '@/common/ui/SocialMediaIcon';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';
import { OnboardingFormField } from './OnboardingFormField';
import {
  countOnboardingLinks,
} from '../Utils/validateOnboarding';

export type SocialDraftKey = keyof Pick<
  import('../types/onboardingStepper.types').OnboardingDraft,
  | 'linkedin'
  | 'github'
  | 'x'
  | 'facebook'
  | 'instagram'
  | 'whatsapp'
  | 'youtube'
  | 'tiktok'
  | 'portfolio'
>;

export type SocialLinksDraft = Record<SocialDraftKey, string | undefined> & {
  website?: string;
  email?: string;
  phone?: string;
  businessAddress?: string;
};

const SOCIAL_PLATFORMS: {
  key: SocialDraftKey;
  label: string;
  placeholder: string;
  iconColor: string;
}[] = [
  {
    key: 'linkedin',
    label: 'LinkedIn',
    placeholder: 'linkedin.com/in/username or username',
    iconColor: '#0a66c2',
  },
  {
    key: 'youtube',
    label: 'YouTube',
    placeholder: 'youtube.com/@channel',
    iconColor: '#ff0000',
  },
  {
    key: 'github',
    label: 'GitHub',
    placeholder: '@username or github.com/username',
    iconColor: '#94a3b8',
  },
  {
    key: 'x',
    label: 'X',
    placeholder: '@username',
    iconColor: '#38bdf8',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    placeholder: 'instagram.com/username',
    iconColor: '#e1306c',
  },
  {
    key: 'facebook',
    label: 'Facebook',
    placeholder: 'facebook.com/username',
    iconColor: '#1877f2',
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    placeholder: 'https://wa.me/15551234567',
    iconColor: '#25d366',
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    placeholder: 'tiktok.com/@username',
    iconColor: '#f472b6',
  },
  {
    key: 'portfolio',
    label: 'Portfolio',
    placeholder: 'https://yoursite.com',
    iconColor: '#38bdf8',
  },
];

function firstEmptyPlatformKey(draft: SocialLinksDraft): SocialDraftKey | null {
  const empty = SOCIAL_PLATFORMS.find((p) => !draft[p.key]?.trim());
  return empty?.key ?? null;
}

export function SocialLinksFieldsBlock({
  draft,
  updateDraft,
  errors,
  minimumContactMethods = 0,
}: {
  draft: SocialLinksDraft;
  updateDraft: (fields: Partial<SocialLinksDraft>) => void;
  errors: Record<string, string>;
  embedded?: boolean;
  minimumContactMethods?: number;
}) {
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';
  const tintColor = isDark ? Colors.dark.tint : Colors.light.tint;

  const [formOpen, setFormOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<SocialDraftKey | null>(() =>
    firstEmptyPlatformKey(draft)
  );

  const platformByKey = useMemo(() => {
    const map = new Map<SocialDraftKey, (typeof SOCIAL_PLATFORMS)[number]>();
    for (const p of SOCIAL_PLATFORMS) map.set(p.key, p);
    return map;
  }, []);

  const savedKeys = useMemo(
    () => SOCIAL_PLATFORMS.filter((p) => Boolean(draft[p.key]?.trim())).map((p) => p.key),
    [draft]
  );
  const linkCount = countOnboardingLinks(draft);
  const hasMinimumLinks = linkCount >= minimumContactMethods;

  const selectedPlatform = selectedKey ? platformByKey.get(selectedKey) : undefined;

  const openAddForm = () => {
    const nextKey =
      selectedKey && !draft[selectedKey]?.trim()
        ? selectedKey
        : firstEmptyPlatformKey(draft) ?? savedKeys[0] ?? SOCIAL_PLATFORMS[0].key;
    setSelectedKey(nextKey);
    setFormOpen(true);
    setDropdownOpen(false);
  };

  const closeForm = () => {
    setFormOpen(false);
    setDropdownOpen(false);
  };

  const selectPlatform = (key: SocialDraftKey) => {
    setSelectedKey(key);
    setDropdownOpen(false);
  };

  const removePlatform = (key: SocialDraftKey) => {
    updateDraft({ [key]: '' } as Partial<SocialLinksDraft>);
    if (selectedKey === key) {
      setSelectedKey(firstEmptyPlatformKey({ ...draft, [key]: '' }));
    }
  };

  const editPlatform = (key: SocialDraftKey) => {
    setSelectedKey(key);
    setFormOpen(true);
    setDropdownOpen(false);
  };

  const firstSocialErrorKey = useMemo(() => {
    for (const platform of SOCIAL_PLATFORMS) {
      if (errors[platform.key]) return platform.key;
    }
    return null;
  }, [errors]);

  useEffect(() => {
    if (!firstSocialErrorKey) return;
    const timeout = setTimeout(() => {
      setSelectedKey(firstSocialErrorKey);
      setFormOpen(true);
    }, 0);
    return () => clearTimeout(timeout);
  }, [firstSocialErrorKey]);

  return (
    <View className="w-full">
      <View className="mb-2 flex-row items-center justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text
            variant="none"
            className="text-[14px] font-medium text-slate-600 dark:text-slate-300"
          >
            Social profiles
          </Text>
          <Text
            variant="none"
            className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400"
          >
            {minimumContactMethods > 0
              ? 'Add at least one website or social profile to continue.'
              : 'Add the social profiles you want to show on your cards.'}
          </Text>
        </View>
        {minimumContactMethods > 0 ? <View
          className={`rounded-full px-2.5 py-1 ${
            hasMinimumLinks
              ? 'bg-emerald-500/15'
              : 'bg-slate-200/80 dark:bg-slate-800'
          }`}
        >
          <Text
            variant="none"
            className={`text-[12px] font-semibold tabular-nums ${
              hasMinimumLinks
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {linkCount}/{minimumContactMethods} added
          </Text>
        </View> : null}
      </View>

      {errors.socialLinks && !hasMinimumLinks ? (
        <Text variant="none" className="mb-2.5 text-xs font-medium text-error dark:text-dark-error">
          {errors.socialLinks}
        </Text>
      ) : null}

      {firstSocialErrorKey && !formOpen ? (
        <Text variant="none" className="mb-2.5 text-xs font-medium text-error dark:text-dark-error">
          Fix the highlighted link below, then tap Continue again.
        </Text>
      ) : null}

      {formOpen ? (
        <View className="w-full">
          {/* Profile Type Selector (Flat solid rounded-lg field matching OnboardingFormField) */}
          <View className="mb-4">
            <View className="mb-2 flex-row items-center justify-between">
              <Text
                variant="none"
                className="text-[14px] font-normal text-slate-500 dark:text-slate-400"
              >
                Profile type
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close add social profile form"
                onPress={closeForm}
                hitSlop={8}
                className="flex-row items-center gap-1 active:opacity-70"
              >
                <X size={16} color={isDark ? '#94a3b8' : '#64748b'} strokeWidth={2.2} />
                <Text
                  variant="none"
                  className="text-[13px] font-medium text-slate-500 dark:text-slate-400"
                >
                  Close
                </Text>
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Choose social profile type"
              accessibilityState={{ expanded: dropdownOpen }}
              onPress={() => setDropdownOpen((open) => !open)}
              className={`min-h-[54px] flex-row items-center justify-between rounded-lg border px-4 py-3 ${
                dropdownOpen
                  ? 'border-primary/50 bg-slate-100/80 dark:border-dark-primary/50 dark:bg-[#1e293b]'
                  : 'border-transparent bg-slate-100 dark:bg-dark-card'
              }`}
            >
              <View className="flex-row items-center gap-3">
                {selectedPlatform ? (
                  <>
                    <View className="h-9 w-9 items-center justify-center rounded-lg bg-slate-200/70 dark:bg-slate-800/90">
                      {selectedPlatform.key === 'portfolio' ? (
                        <Briefcase color={selectedPlatform.iconColor} size={18} strokeWidth={2.2} />
                      ) : (
                        <SocialMediaIcon color={selectedPlatform.iconColor} platform={selectedPlatform.key} size={18} />
                      )}
                    </View>
                    <Text
                      variant="none"
                      className="text-[16px] font-normal text-textPrimary dark:text-dark-textPrimary"
                    >
                      {selectedPlatform.label}
                    </Text>
                  </>
                ) : (
                  <Text
                    variant="none"
                    className="text-[16px] font-normal text-slate-400 dark:text-slate-500"
                  >
                    Select network
                  </Text>
                )}
              </View>
              <ChevronDown
                size={20}
                color={isDark ? '#94a3b8' : '#64748b'}
                strokeWidth={2.2}
                style={{ transform: [{ rotate: dropdownOpen ? '180deg' : '0deg' }] }}
              />
            </Pressable>

            {dropdownOpen ? (
              <View
                className="mt-2 overflow-hidden rounded-lg border border-slate-200/80 bg-slate-100 dark:border-slate-800 dark:bg-dark-card"
                style={{ maxHeight: 236 }}
              >
                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                  {SOCIAL_PLATFORMS.map((platform, idx) => {
                    const isSelected = platform.key === selectedKey;
                    const isAdded = Boolean(draft[platform.key]?.trim());
                    return (
                      <Pressable
                        key={platform.key}
                        accessibilityRole="button"
                        accessibilityLabel={platform.label}
                        onPress={() => selectPlatform(platform.key)}
                        className={`flex-row items-center gap-3 px-4 py-3 ${
                          idx < SOCIAL_PLATFORMS.length - 1
                            ? 'border-b border-slate-200/60 dark:border-slate-800/80'
                            : ''
                        } active:bg-slate-200/50 dark:active:bg-slate-800/50 ${
                          // Keep the active: utilities on every row; toggling them
                          // after mount makes NativeWind remount and crash in dev.
                          isSelected ? 'bg-primary/10 dark:bg-sky-500/15' : ''
                        }`}
                      >
                        <View className="h-9 w-9 items-center justify-center rounded-lg bg-slate-200/70 dark:bg-slate-800/90">
                          {platform.key === 'portfolio' ? (
                            <Briefcase color={platform.iconColor} size={18} strokeWidth={2.2} />
                          ) : (
                            <SocialMediaIcon color={platform.iconColor} platform={platform.key} size={18} />
                          )}
                        </View>
                        <Text
                          variant="none"
                          className={`flex-1 text-[15px] ${
                            isSelected
                              ? 'font-semibold text-primary dark:text-sky-400'
                              : 'font-normal text-textPrimary dark:text-dark-textPrimary'
                          }`}
                        >
                          {platform.label}
                        </Text>
                        {isAdded ? (
                          <View className="flex-row items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 dark:bg-sky-500/15">
                            <Check size={12} color={tintColor} strokeWidth={2.6} />
                            <Text
                              variant="none"
                              style={{ color: tintColor }}
                              className="text-[11px] font-semibold"
                            >
                              Added
                            </Text>
                          </View>
                        ) : isSelected ? (
                          <Check size={16} color={tintColor} strokeWidth={2.4} />
                        ) : null}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            ) : null}
          </View>

          {/* Profile URL Field (Flat solid rounded-lg field) */}
          {selectedKey && selectedPlatform ? (
            <View className="w-full">
              <View className="mb-2 flex-row items-center justify-between">
                <Text
                  variant="none"
                  className="text-[14px] font-normal text-slate-500 dark:text-slate-400"
                >
                  Profile URL
                </Text>
                {draft[selectedKey]?.trim() ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${selectedPlatform.label}`}
                    onPress={() => removePlatform(selectedKey)}
                    hitSlop={8}
                  >
                    <Text variant="none" className="text-[13px] font-medium text-rose-500 dark:text-rose-400">
                      Remove
                    </Text>
                  </Pressable>
                ) : null}
              </View>
              <OnboardingFormField
                label=""
                value={String(draft[selectedKey] ?? '')}
                onChangeText={(text) =>
                  updateDraft({ [selectedKey]: text } as Partial<SocialLinksDraft>)
                }
                placeholder={selectedPlatform.placeholder}
                error={errors[selectedKey]}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
                hideClear
                compact
              />
            </View>
          ) : null}

          {/* Done Button matching the flat rounded-lg input design */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Done adding social profile"
            onPress={closeForm}
            className="mt-3 min-h-[50px] flex-row items-center justify-center rounded-lg border border-primary/30 bg-primary/12 px-4 py-3 active:opacity-85 dark:border-sky-400/30 dark:bg-sky-500/15"
          >
            <Text
              variant="none"
              style={{ color: tintColor }}
              className="text-[15px] font-semibold"
            >
              Done
            </Text>
          </Pressable>
        </View>
      ) : null}

      {/* Added Social Profiles List (Flat rounded-lg rows matching the new field style) */}
      {savedKeys.length > 0 ? (
        <View className={`gap-2.5 ${formOpen ? 'mt-3.5' : ''}`}>
          {savedKeys.map((key) => {
            const platform = platformByKey.get(key);
            if (!platform) return null;
            const value = draft[key]?.trim() ?? '';
            const hasError = Boolean(errors[key]);
            const isCurrentlyEditing = formOpen && selectedKey === key;

            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={`Edit ${platform.label}`}
                onPress={() => editPlatform(key)}
                className={`min-h-[54px] flex-row items-center justify-between rounded-lg border px-4 py-2.5 active:opacity-85 ${
                  hasError
                    ? 'border-error bg-red-50/70 dark:border-dark-error dark:bg-red-950/20'
                    : isCurrentlyEditing
                      ? 'border-primary/50 bg-slate-100/80 dark:border-dark-primary/50 dark:bg-[#1e293b]'
                      : 'border-transparent bg-slate-100 dark:bg-dark-card'
                }`}
              >
                <View className="min-w-0 flex-1 flex-row items-center gap-3 pr-2">
                  <View className="h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-200/70 dark:bg-slate-800/90">
                    {platform.key === 'portfolio' ? (
                      <Briefcase color={platform.iconColor} size={18} strokeWidth={2.2} />
                    ) : (
                      <SocialMediaIcon color={platform.iconColor} platform={platform.key} size={18} />
                    )}
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text
                      variant="none"
                      className="text-[15px] font-medium text-textPrimary dark:text-dark-textPrimary"
                    >
                      {platform.label}
                    </Text>
                    <Text
                      variant="none"
                      numberOfLines={1}
                      className="text-[13px] font-normal text-slate-500 dark:text-slate-400"
                    >
                      {value}
                    </Text>
                  </View>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${platform.label}`}
                  hitSlop={8}
                  onPress={() => removePlatform(key)}
                  className="h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 active:opacity-75"
                >
                  <Trash2 size={16} color="#ef4444" strokeWidth={2.1} />
                </Pressable>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {!formOpen ? (
        <>
          {savedKeys.length === 0 ? (
            <Text
              variant="none"
              className="mb-2.5 text-[13px] font-normal text-slate-500 dark:text-slate-400"
            >
              No profiles added yet — tap below to connect LinkedIn, X, GitHub, and more.
            </Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add social profile"
            onPress={openAddForm}
            className={`min-h-[54px] flex-row items-center justify-between rounded-lg border border-transparent bg-slate-100 px-4 py-3 active:opacity-85 dark:bg-dark-card ${
              savedKeys.length > 0 ? 'mt-3.5' : ''
            }`}
          >
            <View className="flex-row items-center gap-3">
              <View className="h-9 w-9 items-center justify-center rounded-lg bg-primary/10 dark:bg-sky-500/15">
                <Plus color={tintColor} size={19} strokeWidth={2.4} />
              </View>
              <Text
                variant="none"
                className="text-[16px] font-normal text-textPrimary dark:text-dark-textPrimary"
              >
                Add social profile
              </Text>
            </View>
            <Text
              variant="none"
              style={{ color: tintColor }}
              className="text-[14px] font-semibold"
            >
              Add
            </Text>
          </Pressable>
        </>
      ) : null}
    </View>
  );
}
