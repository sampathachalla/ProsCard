import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Building2,
  Camera,
  Layers,
  ImagePlus,
  Trash2,
  type LucideIcon,
} from 'lucide-react-native';
import { Text } from '@/common/ui/Text';
import { ImageUploadField } from '@/common/ui/ImageUploadField';
import { MediaImage } from '@/common/ui/MediaImage';
import { PhotoAdjustmentModal } from '@/common/ui/PhotoAdjustmentModal';
import { pickImageAssetFromLibrary, takePhotoAsset, type PickedImage } from '@/common/ui/usePickImage';
import { AUTH_TEST_MODE } from '@/pages/auth/Config/authMode';
import {
  clearPendingMedia,
  commitPendingMedia,
} from '@/pages/profile/Services/pendingMedia';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';
import type { MediaKind } from '@/services/api/types';
import type { OnboardingDraft } from '../types/onboardingStepper.types';
import type { FieldSpec } from '../types/onboardingFlow.types';
import { OnboardingFormField } from './OnboardingFormField';
import { SocialLinksFieldsBlock } from './SocialLinksFieldsBlock';

function rebuildFullName(parts: OnboardingDraft): string {
  return [parts.prefix, parts.firstName, parts.middleName, parts.lastName, parts.suffix]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' ');
}

interface MediaUploadRowConfig {
  key: 'photoUrl' | 'companyLogoUrl' | 'coverPhotoUrl';
  title: string;
  subtitle: string;
  icon: LucideIcon;
  aspect: [number, number];
  mediaKind: Exclude<MediaKind, 'contactCard'>;
  contentFit: 'cover' | 'contain';
}

const ONBOARDING_MEDIA_ROWS: MediaUploadRowConfig[] = [
  {
    key: 'photoUrl',
    title: 'Profile photo',
    subtitle: 'PNG or JPG · square works best',
    icon: Camera,
    aspect: [1, 1],
    mediaKind: 'profilePhoto',
    contentFit: 'cover',
  },
  {
    key: 'companyLogoUrl',
    title: 'Company logo',
    subtitle: 'PNG or JPG · square works best',
    icon: Building2,
    aspect: [1, 1],
    mediaKind: 'companyLogo',
    contentFit: 'contain',
  },
  {
    key: 'coverPhotoUrl',
    title: 'Cover banner',
    subtitle: 'PNG or JPG · square works best',
    icon: Layers,
    aspect: [16, 9],
    mediaKind: 'coverPhoto',
    contentFit: 'cover',
  },
];

function OnboardingMediaRowCard({
  config,
  value,
  error,
  onChange,
}: {
  config: MediaUploadRowConfig;
  value: string;
  error?: string;
  onChange: (uri: string) => void;
}) {
  const [isPicking, setIsPicking] = useState(false);
  const [pendingAsset, setPendingAsset] = useState<PickedImage | null>(null);
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';
  const tintColor = isDark ? Colors.dark.tint : Colors.light.tint;
  const mutedIconColor = isDark ? '#94a3b8' : '#64748b';
  const hasImage = Boolean(value?.trim());
  const Icon = config.icon;

  const pickSource = async (source: 'camera' | 'library') => {
    if (isPicking) return;
    setIsPicking(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      const asset = source === 'camera'
        ? await takePhotoAsset()
        : await pickImageAssetFromLibrary({ allowsEditing: false });
      if (!asset) {
        setIsPicking(false);
        return;
      }
      setPendingAsset(asset);
    } catch (err) {
      setIsPicking(false);
      Alert.alert('Couldn’t open photo', err instanceof Error ? err.message : 'Please try again.');
    }
  };

  const handlePick = () => {
    if (isPicking) return;
    Alert.alert(`Add ${config.title}`, 'Choose a photo source.', [
      { text: 'Take Photo', onPress: () => { void pickSource('camera'); } },
      { text: 'Photo Library', onPress: () => { void pickSource('library'); } },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const saveAdjusted = async (uri: string) => {
    setPendingAsset(null);
    if (AUTH_TEST_MODE) {
      onChange(uri);
      setIsPicking(false);
      return;
    }
    try {
      const remoteUrl = await commitPendingMedia(uri, config.mediaKind);
      onChange(remoteUrl);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (err) {
      clearPendingMedia(uri);
      const message = err instanceof Error && err.message.trim() ? err.message : 'The uploaded image type or size is not allowed.';
      Alert.alert('Couldn’t upload image', message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    } finally {
      setIsPicking(false);
    }
  };

  const handleRemove = () => {
    if (isPicking) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    if (value?.trim()) {
      clearPendingMedia(value.trim());
    }
    onChange('');
  };

  return (
    <View className="mb-3.5 w-full">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={hasImage ? `Replace ${config.title}` : `Upload ${config.title}`}
        disabled={isPicking}
        onPress={handlePick}
        className={`flex-row items-center rounded-lg border p-4 active:opacity-90 ${
          error
            ? 'border-error bg-red-50/70 dark:border-dark-error dark:bg-red-950/20'
            : hasImage
              ? 'border-primary/50 bg-slate-100/80 dark:border-dark-primary/50 dark:bg-[#1e293b]'
              : 'border-transparent bg-slate-100 dark:bg-dark-card'
        }`}
      >
        <View className="mr-4 h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-slate-200/70 dark:bg-slate-800/90">
          {isPicking ? (
            <ActivityIndicator size="small" color={tintColor} />
          ) : hasImage ? (
            <MediaImage
              sourceUrl={value}
              contentFit={config.contentFit}
              style={{ width: '100%', height: '100%' }}
              accessibilityLabel={`${config.title} preview`}
            />
          ) : (
            <Icon size={24} color={mutedIconColor} strokeWidth={2} />
          )}
        </View>

        <View className="min-w-0 flex-1 pr-2">
          <Text
            variant="none"
            className="text-[16px] font-semibold text-textPrimary dark:text-dark-textPrimary"
          >
            {config.title}
          </Text>
          <Text
            variant="none"
            numberOfLines={1}
            className="mt-1 text-[13px] text-slate-500 dark:text-slate-400"
          >
            {hasImage ? 'Image selected · tap to replace' : config.subtitle}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          {hasImage && !isPicking ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove ${config.title}`}
              hitSlop={8}
              onPress={handleRemove}
              className="h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 active:opacity-75"
            >
              <Trash2 size={18} color="#ef4444" strokeWidth={2.1} />
            </Pressable>
          ) : null}
          <View className="h-9 w-9 items-center justify-center">
            <ImagePlus size={22} color={tintColor} strokeWidth={2.1} />
          </View>
        </View>
      </Pressable>
      <PhotoAdjustmentModal
        asset={pendingAsset}
        aspect={config.aspect}
        title={`Adjust ${config.title}`}
        onCancel={() => { setPendingAsset(null); setIsPicking(false); }}
        onSave={saveAdjusted}
      />

      {error ? (
        <Text className="mt-1.5 px-1 text-xs font-medium text-error dark:text-dark-error">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export function PresenceFieldsBlock({
  draft,
  updateDraft,
  errors,
}: {
  draft: OnboardingDraft;
  updateDraft: (fields: Partial<OnboardingDraft>) => void;
  errors: Record<string, string>;
}) {
  return (
    <View className="w-full">
      {ONBOARDING_MEDIA_ROWS.map((row) => (
        <OnboardingMediaRowCard
          key={row.key}
          config={row}
          value={draft[row.key] ?? ''}
          error={errors[row.key]}
          onChange={(uri) => updateDraft({ [row.key]: uri } as Partial<OnboardingDraft>)}
        />
      ))}
    </View>
  );
}

export function renderOnboardingField(
  spec: FieldSpec,
  draft: OnboardingDraft,
  updateDraft: (fields: Partial<OnboardingDraft>) => void,
  errors: Record<string, string>
): React.ReactNode {
  if (spec.widget === 'presence_block') {
    return (
      <PresenceFieldsBlock
        key="presence_block"
        draft={draft}
        updateDraft={updateDraft}
        errors={errors}
      />
    );
  }

  if (spec.widget === 'social_block') {
    return (
      <View key="social_block" className="w-full">
        <OnboardingFormField
          label="Website"
          value={draft.website ?? ''}
          onChangeText={(text) => updateDraft({ website: text })}
          placeholder="https://yourcompany.com"
          error={errors.website}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          variant="boxed"
        />
        <SocialLinksFieldsBlock
          draft={draft}
          updateDraft={updateDraft}
          errors={errors}
        />
      </View>
    );
  }

  if (spec.widget === 'image_logo') {
    return (
      <View key={spec.key} className="w-full">
        <ImageUploadField
          label={spec.label}
          description="Optional logo on your card."
          value={String(draft[spec.key] ?? '')}
          onChange={(uri) => updateDraft({ [spec.key]: uri } as Partial<OnboardingDraft>)}
          onRemove={() => updateDraft({ [spec.key]: '' } as Partial<OnboardingDraft>)}
          variant="logo"
        />
        {errors[spec.key] ? <Text className="mt-2 text-sm text-rose-400">{errors[spec.key]}</Text> : null}
      </View>
    );
  }

  const value = String(draft[spec.key] ?? '');
  const nameKeys = new Set(['prefix', 'firstName', 'middleName', 'lastName', 'suffix']);

  const onChangeText = (text: string) => {
    if (nameKeys.has(spec.key)) {
      const next = { ...draft, [spec.key]: text } as OnboardingDraft;
      updateDraft({
        [spec.key]: text,
        fullName: rebuildFullName(next),
      } as Partial<OnboardingDraft>);
      return;
    }
    updateDraft({ [spec.key]: text } as Partial<OnboardingDraft>);
  };

  if (spec.key === 'tagline') {
    return (
      <OnboardingFormField
        key={spec.key}
        label={spec.label || 'Tagline'}
        value={value}
        onChangeText={onChangeText}
        placeholder={spec.placeholder ?? 'One short line that appears on your card'}
        error={errors[spec.key]}
        required={spec.required}
        hint={spec.hint}
        maxLength={spec.maxLength ?? 120}
        multiline
        numberOfLines={3}
        autoCapitalize={spec.autoCapitalize ?? 'sentences'}
        showCharacterCount
        characterCountPlacement="top"
        variant="boxed"
      />
    );
  }

  if (spec.key === 'shortBio') {
    return (
      <OnboardingFormField
        key={spec.key}
        label={spec.label || 'Short bio'}
        value={value}
        onChangeText={onChangeText}
        placeholder={spec.placeholder ?? 'I am here to build tools for the future'}
        error={errors[spec.key]}
        required={spec.required}
        hint={spec.hint}
        maxLength={spec.maxLength ?? 240}
        multiline
        numberOfLines={4}
        autoCapitalize={spec.autoCapitalize ?? 'sentences'}
        showCharacterCount
        characterCountPlacement="top"
        variant="boxed"
      />
    );
  }

  return (
    <OnboardingFormField
      key={spec.key}
      label={spec.label || spec.placeholder || ''}
      value={value}
      onChangeText={onChangeText}
      placeholder={spec.placeholder ?? spec.label}
      error={errors[spec.key]}
      keyboardType={spec.keyboardType}
      autoCapitalize={spec.autoCapitalize ?? 'sentences'}
      autoCorrect={spec.key === 'email' || spec.key === 'phone' ? false : true}
      required={spec.required}
      hint={spec.hint}
      maxLength={spec.maxLength}
      variant="boxed"
    />
  );
}
