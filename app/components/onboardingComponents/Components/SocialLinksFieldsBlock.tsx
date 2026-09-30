import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import {
  AtSign,
  Briefcase,
  Camera,
  ChevronDown,
  GitFork,
  Link2,
  MessageCircle,
  Play,
  Plus,
  X,
  type LucideIcon,
} from 'lucide-react-native';

import { Text } from '@/components/uiComponents/Text';
import { OnboardingFormField } from './OnboardingFormField';

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

export type SocialLinksDraft = Record<SocialDraftKey, string | undefined>;

const SOCIAL_PLATFORMS: {
  key: SocialDraftKey;
  label: string;
  placeholder: string;
  icon: LucideIcon;
  iconColor: string;
}[] = [
  {
    key: 'linkedin',
    label: 'LinkedIn',
    placeholder: 'linkedin.com/in/username or username',
    icon: Link2,
    iconColor: '#0a66c2',
  },
  {
    key: 'youtube',
    label: 'YouTube',
    placeholder: 'youtube.com/@channel',
    icon: Play,
    iconColor: '#ff0000',
  },
  {
    key: 'github',
    label: 'GitHub',
    placeholder: '@username or github.com/username',
    icon: GitFork,
    iconColor: '#e6edf3',
  },
  {
    key: 'x',
    label: 'X',
    placeholder: '@username',
    icon: AtSign,
    iconColor: '#38bdf8',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    placeholder: 'instagram.com/username',
    icon: Camera,
    iconColor: '#e1306c',
  },
  {
    key: 'facebook',
    label: 'Facebook',
    placeholder: 'facebook.com/username',
    icon: AtSign,
    iconColor: '#1877f2',
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    placeholder: 'https://wa.me/15551234567',
    icon: MessageCircle,
    iconColor: '#25d366',
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    placeholder: 'tiktok.com/@username',
    icon: Play,
    iconColor: '#f472b6',
  },
  {
    key: 'portfolio',
    label: 'Portfolio',
    placeholder: 'https://yoursite.com',
    icon: Briefcase,
    iconColor: '#38bdf8',
  },
];

const SOCIAL_CHIP_COLUMNS = 4;
const SOCIAL_CHIP_GAP = 10;
/** ~4 chips per row with gap; flex item width for wrap layout */
const SOCIAL_CHIP_WIDTH = `${(100 - (SOCIAL_CHIP_COLUMNS - 1) * 2.2) / SOCIAL_CHIP_COLUMNS}%`;

function firstEmptyPlatformKey(draft: SocialLinksDraft): SocialDraftKey | null {
  const empty = SOCIAL_PLATFORMS.find((p) => !draft[p.key]?.trim());
  return empty?.key ?? null;
}

function chunkSocialChipKeys(keys: SocialDraftKey[]): SocialDraftKey[][] {
  const rows: SocialDraftKey[][] = [];
  for (let i = 0; i < keys.length; i += SOCIAL_CHIP_COLUMNS) {
    rows.push(keys.slice(i, i + SOCIAL_CHIP_COLUMNS));
  }
  return rows;
}

export function SocialLinksFieldsBlock({
  draft,
  updateDraft,
  errors,
  embedded = false,
}: {
  draft: SocialLinksDraft;
  updateDraft: (fields: Partial<SocialLinksDraft>) => void;
  errors: Record<string, string>;
  embedded?: boolean;
}) {
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

  const chipRows = useMemo(() => chunkSocialChipKeys(savedKeys), [savedKeys]);

  const selectedPlatform = selectedKey ? platformByKey.get(selectedKey) : undefined;
  const SelectedDropdownIcon = selectedPlatform?.icon;

  const openAddForm = () => {
    const nextKey = selectedKey && !draft[selectedKey]?.trim()
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
    <View className={embedded ? 'w-full' : 'w-full rounded-2xl border border-border/80 bg-card/40 p-4 dark:border-dark-border/80 dark:bg-dark-card/30'}>
      {firstSocialErrorKey && !formOpen ? (
        <Text variant="none" className="mb-3 text-center text-sm font-medium text-red-400">
          Fix the highlighted link below, then tap Continue again.
        </Text>
      ) : null}
      {!formOpen ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add social profile"
          onPress={openAddForm}
          className="flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-sky-400/50 bg-sky-500/5 px-4 py-3.5 active:opacity-85"
        >
          <Plus color="#38bdf8" size={20} strokeWidth={2.5} />
          <Text variant="none" className="text-base font-semibold text-sky-500 dark:text-sky-400">
            Add social profile
          </Text>
        </Pressable>
      ) : (
        <View className="mt-4 rounded-xl border border-border/70 bg-background/80 p-4 dark:border-dark-border/70 dark:bg-dark-background/60">
          <View className="mb-4 flex-row items-center justify-between">
            <Text
              variant="none"
              className="text-base font-semibold text-textPrimary dark:text-dark-textPrimary"
            >
              Add social profile
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close add social profile form"
              onPress={closeForm}
              hitSlop={8}
              className="rounded-full p-1 active:opacity-70"
            >
              <X size={20} color="#94a3b8" strokeWidth={2.2} />
            </Pressable>
          </View>

          <Text
            variant="none"
            className="mb-2 text-sm font-medium text-textMuted dark:text-dark-textMuted"
          >
            Profile type
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choose social profile type"
            accessibilityState={{ expanded: dropdownOpen }}
            onPress={() => setDropdownOpen((open) => !open)}
            className="flex-row items-center justify-between rounded-xl border border-border/80 bg-card/50 px-4 py-3.5 dark:border-dark-border/80 dark:bg-dark-card/40"
          >
            <View className="flex-row items-center gap-3">
              {selectedPlatform && SelectedDropdownIcon ? (
                <>
                  <View className="h-9 w-9 items-center justify-center rounded-full bg-slate-500/15">
                    <SelectedDropdownIcon
                      color={selectedPlatform.iconColor}
                      size={18}
                      strokeWidth={2.2}
                    />
                  </View>
                  <Text
                    variant="none"
                    className="text-base font-medium text-textPrimary dark:text-dark-textPrimary"
                  >
                    {selectedPlatform.label}
                  </Text>
                </>
              ) : (
                <Text variant="none" className="text-base text-textMuted dark:text-dark-textMuted">
                  Select network
                </Text>
              )}
            </View>
            <ChevronDown
              size={20}
              color="#94a3b8"
              strokeWidth={2.2}
              style={{ transform: [{ rotate: dropdownOpen ? '180deg' : '0deg' }] }}
            />
          </Pressable>

          {dropdownOpen ? (
            <View
              className="mt-2 overflow-hidden rounded-xl border border-border/70 bg-background dark:border-dark-border/70 dark:bg-dark-background"
              style={{ maxHeight: 220 }}
            >
              {SOCIAL_PLATFORMS.map((platform) => {
                const Icon = platform.icon;
                const isSelected = platform.key === selectedKey;
                return (
                  <Pressable
                    key={platform.key}
                    accessibilityRole="button"
                    accessibilityLabel={platform.label}
                    onPress={() => selectPlatform(platform.key)}
                    className={`flex-row items-center gap-3 border-b border-border/40 px-4 py-3 dark:border-dark-border/40 ${
                      isSelected ? 'bg-sky-500/10' : 'active:bg-slate-500/10'
                    }`}
                  >
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-slate-500/10">
                      <Icon color={platform.iconColor} size={18} strokeWidth={2.2} />
                    </View>
                    <Text
                      variant="none"
                      className="flex-1 text-base font-medium text-textPrimary dark:text-dark-textPrimary"
                    >
                      {platform.label}
                    </Text>
                    {draft[platform.key]?.trim() ? (
                      <Text variant="none" className="text-xs text-textMuted dark:text-dark-textMuted">
                        Added
                      </Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          {selectedKey && selectedPlatform ? (
            <View className="mt-4">
              <View className="mb-2 flex-row items-center justify-between">
                <Text
                  variant="none"
                  className="text-sm font-medium text-textMuted dark:text-dark-textMuted"
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
                    <Text variant="none" className="text-sm font-medium text-red-400">
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
                icon={selectedPlatform.icon}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
                hideClear
              />
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Done adding social profile"
            onPress={closeForm}
            className="mt-5 items-center rounded-xl bg-sky-500/15 py-3 active:opacity-85"
          >
            <Text variant="none" className="text-base font-semibold text-sky-500 dark:text-sky-400">
              Done
            </Text>
          </Pressable>
        </View>
      )}

      {chipRows.length > 0 ? (
        <View className="mt-4" style={{ gap: SOCIAL_CHIP_GAP }}>
          {chipRows.map((row, rowIndex) => (
            <View
              key={`social-chip-row-${rowIndex}`}
              className="flex-row justify-start"
              style={{ gap: SOCIAL_CHIP_GAP }}
            >
              {row.map((key) => {
                const platform = platformByKey.get(key);
                if (!platform) return null;
                const Icon = platform.icon;
                return (
                  <Pressable
                    key={key}
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${platform.label}`}
                    onPress={() => editPlatform(key)}
                    style={{
                      width: SOCIAL_CHIP_WIDTH,
                      flexGrow: 0,
                      flexShrink: 0,
                    }}
                    className={`items-center rounded-2xl border px-1 py-2.5 ${
                  errors[key]
                    ? 'border-red-400/70 bg-red-500/5'
                    : 'border-border/60 bg-background/60 dark:border-dark-border/60 dark:bg-dark-background/50'
                }`}
                  >
                    <View className="h-11 w-11 items-center justify-center rounded-full bg-sky-500/20">
                      <Icon color={platform.iconColor} size={22} strokeWidth={2.2} />
                    </View>
                    <Text
                      variant="none"
                      className="mt-1.5 w-full text-center text-[11px] font-medium text-textMuted dark:text-dark-textMuted"
                      numberOfLines={1}
                    >
                      {platform.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      ) : null}

      {!formOpen && savedKeys.length === 0 ? (
        <Text
          variant="none"
          className="mt-3 text-center text-sm text-textMuted dark:text-dark-textMuted"
        >
          No profiles yet — tap Add social profile to get started.
        </Text>
      ) : null}
    </View>
  );
}
