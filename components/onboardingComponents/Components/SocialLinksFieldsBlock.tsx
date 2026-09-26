import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import {
  AtSign,
  Briefcase,
  Camera,
  GitFork,
  Link2,
  MessageCircle,
  Play,
  Plus,
  X,
  type LucideIcon,
} from 'lucide-react-native';

import { Text } from '@/components/uiComponents/Text';
import type { OnboardingDraft } from '../types/onboardingStepper.types';
import { OnboardingFormField } from './OnboardingFormField';

export type SocialDraftKey = keyof Pick<
  OnboardingDraft,
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

function initialActiveKeys(draft: OnboardingDraft): SocialDraftKey[] {
  return SOCIAL_PLATFORMS.filter((p) => Boolean(draft[p.key]?.trim())).map((p) => p.key);
}

export function SocialLinksFieldsBlock({
  draft,
  updateDraft,
  errors,
}: {
  draft: OnboardingDraft;
  updateDraft: (fields: Partial<OnboardingDraft>) => void;
  errors: Record<string, string>;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [addedKeys, setAddedKeys] = useState<SocialDraftKey[]>(() => initialActiveKeys(draft));
  const [focusedKey, setFocusedKey] = useState<SocialDraftKey | null>(null);

  const visibleKeys = useMemo(() => {
    const merged = new Set<SocialDraftKey>([...addedKeys, ...initialActiveKeys(draft)]);
    return SOCIAL_PLATFORMS.filter((p) => merged.has(p.key)).map((p) => p.key);
  }, [addedKeys, draft]);

  const platformByKey = useMemo(() => {
    const map = new Map<SocialDraftKey, (typeof SOCIAL_PLATFORMS)[number]>();
    for (const p of SOCIAL_PLATFORMS) map.set(p.key, p);
    return map;
  }, []);

  const availableToAdd = SOCIAL_PLATFORMS.filter((p) => !visibleKeys.includes(p.key));

  const addPlatform = (key: SocialDraftKey) => {
    setAddedKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
    setFocusedKey(key);
    setPickerOpen(false);
  };

  const removePlatform = (key: SocialDraftKey) => {
    updateDraft({ [key]: '' } as Partial<OnboardingDraft>);
    setAddedKeys((prev) => prev.filter((k) => k !== key));
    if (focusedKey === key) setFocusedKey(null);
  };

  return (
    <View className="w-full rounded-2xl border border-border/80 bg-card/40 p-4 dark:border-dark-border/80 dark:bg-dark-card/30">
      <View className="mb-1 flex-row items-center gap-2">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-sky-500/15">
          <Link2 size={18} color="#38bdf8" strokeWidth={2.2} />
        </View>
        <View className="flex-1">
          <Text
            variant="none"
            className="text-base font-semibold text-textPrimary dark:text-dark-textPrimary"
          >
            Social profiles
          </Text>
          <Text variant="none" className="mt-0.5 text-sm text-textMuted dark:text-dark-textMuted">
            Tap Add, pick a network, then paste your link
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row flex-wrap" style={{ gap: 10 }}>
        {visibleKeys.map((key) => {
          const platform = platformByKey.get(key);
          if (!platform) return null;
          const Icon = platform.icon;
          const filled = Boolean(draft[key]?.trim());
          const isFocused = focusedKey === key;
          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={`${platform.label}${filled ? ', link added' : ''}`}
              onPress={() => setFocusedKey(key)}
              className={`items-center rounded-2xl border px-3 py-2.5 ${
                isFocused
                  ? 'border-sky-400/70 bg-sky-500/10'
                  : 'border-border/60 bg-background/60 dark:border-dark-border/60 dark:bg-dark-background/50'
              }`}
            >
              <View
                className={`h-11 w-11 items-center justify-center rounded-full ${
                  filled ? 'bg-sky-500/20' : 'bg-slate-500/10'
                }`}
              >
                <Icon color={platform.iconColor} size={22} strokeWidth={2.2} />
              </View>
              <Text
                variant="none"
                className="mt-1.5 max-w-[72px] text-center text-[11px] font-medium text-textMuted dark:text-dark-textMuted"
                numberOfLines={1}
              >
                {platform.label}
              </Text>
            </Pressable>
          );
        })}

        {availableToAdd.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add social profile"
            onPress={() => setPickerOpen((open) => !open)}
            className={`min-h-[88px] items-center justify-center rounded-2xl border border-dashed px-4 py-2.5 ${
              pickerOpen
                ? 'border-sky-400/60 bg-sky-500/5'
                : 'border-border/70 bg-background/40 dark:border-dark-border/70 dark:bg-dark-background/30'
            }`}
            style={{ minWidth: 88 }}
          >
            <View className="h-11 w-11 items-center justify-center rounded-full bg-sky-500/15">
              <Plus color="#38bdf8" size={22} strokeWidth={2.5} />
            </View>
            <Text
              variant="none"
              className="mt-1.5 text-center text-[11px] font-semibold text-sky-500 dark:text-sky-400"
            >
              Add
            </Text>
          </Pressable>
        ) : null}
      </View>

      {pickerOpen && availableToAdd.length > 0 ? (
        <View className="mt-4 rounded-xl border border-border/70 bg-background/80 p-3 dark:border-dark-border/70 dark:bg-dark-background/60">
          <Text
            variant="none"
            className="mb-3 text-sm font-semibold text-textPrimary dark:text-dark-textPrimary"
          >
            Add social profile
          </Text>
          <View style={{ gap: 8 }}>
            {availableToAdd.map((platform) => {
              const Icon = platform.icon;
              return (
                <Pressable
                  key={platform.key}
                  accessibilityRole="button"
                  accessibilityLabel={`Add ${platform.label}`}
                  onPress={() => addPlatform(platform.key)}
                  className="flex-row items-center gap-3 rounded-xl px-3 py-2.5 active:bg-slate-500/10 dark:active:bg-slate-400/10"
                >
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-slate-500/10">
                    <Icon color={platform.iconColor} size={20} strokeWidth={2.2} />
                  </View>
                  <Text
                    variant="none"
                    className="flex-1 text-base font-medium text-textPrimary dark:text-dark-textPrimary"
                  >
                    {platform.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {visibleKeys.length > 0 ? (
        <View className="mt-5" style={{ gap: 12 }}>
          {visibleKeys.map((key) => {
              const platform = platformByKey.get(key);
              if (!platform) return null;
              const Icon = platform.icon;
              return (
                <View key={key} className="relative">
                  <View className="mb-2 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <Icon color={platform.iconColor} size={18} strokeWidth={2.2} />
                      <Text
                        variant="none"
                        className="text-sm font-semibold text-textPrimary dark:text-dark-textPrimary"
                      >
                        {platform.label}
                      </Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${platform.label}`}
                      onPress={() => removePlatform(key)}
                      hitSlop={8}
                      className="rounded-full p-1 active:opacity-70"
                    >
                      <X size={18} color="#94a3b8" strokeWidth={2.2} />
                    </Pressable>
                  </View>
                  <OnboardingFormField
                    label=""
                    value={String(draft[key] ?? '')}
                    onChangeText={(text) => updateDraft({ [key]: text } as Partial<OnboardingDraft>)}
                    placeholder={platform.placeholder}
                    error={errors[key]}
                    icon={Icon}
                    keyboardType="url"
                    autoCapitalize="none"
                    autoCorrect={false}
                    hideClear
                  />
                </View>
              );
            })}
        </View>
      ) : (
        <Text
          variant="none"
          className="mt-4 text-center text-sm text-textMuted dark:text-dark-textMuted"
        >
          No profiles yet — tap Add to connect LinkedIn, YouTube, and more.
        </Text>
      )}
    </View>
  );
}
