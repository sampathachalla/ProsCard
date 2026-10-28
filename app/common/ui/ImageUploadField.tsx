import { Fragment, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check, ImagePlus, Pencil, Search, Trash2, Upload } from 'lucide-react-native';
import { Text } from './Text';
import { pickImageAssetFromLibrary, takePhotoAsset, type PickedImage } from './usePickImage';
import { PhotoAdjustmentModal } from './PhotoAdjustmentModal';
import { MediaImage } from './MediaImage';
import { CompanyLogoPickerModal } from './CompanyLogoPickerModal';
import { COVER_PHOTO_PRESETS } from '@/pages/cards/Services/coverPhotoPresets';
import {
  recordCommunityUploadedLogo,
} from '@/pages/cards/Services/companyLogoPresets';
import { AUTH_TEST_MODE } from '@/pages/auth/Config/authMode';
import {
  clearPendingMedia,
  commitPendingMedia,
} from '@/pages/profile/Services/pendingMedia';
import type { MediaKind } from '@/services/api/types';

export type ImageUploadVariant = 'banner' | 'avatar' | 'logo';

const VARIANT_MEDIA_KIND: Record<ImageUploadVariant, Exclude<MediaKind, 'contactCard'>> = {
  avatar: 'profilePhoto',
  banner: 'coverPhoto',
  logo: 'companyLogo',
};

type ImageUploadFieldProps = {
  label: string;
  description?: string;
  value?: string;
  onChange: (uri: string) => void;
  onRemove?: () => void;
  variant?: ImageUploadVariant;
  disabled?: boolean;
  /** Avatar-only: circle picker with upload icon; edit badge when filled (no remove/url row). */
  presentation?: 'default' | 'compact';
};

const VARIANT_CONFIG: Record<
  ImageUploadVariant,
  { aspect: [number, number]; previewClass: string; hint: string; contentFit: 'cover' | 'contain' }
> = {
  banner: {
    aspect: [16, 9],
    previewClass: 'h-40 w-full rounded-2xl',
    hint: 'Hero image shown at the top of your identity section.',
    contentFit: 'cover',
  },
  avatar: {
    aspect: [1, 1],
    previewClass: 'h-32 w-32 rounded-full',
    hint: 'Your headshot or avatar on the card.',
    contentFit: 'cover',
  },
  logo: {
    aspect: [1, 1],
    previewClass: 'h-24 w-44 rounded-2xl',
    hint: 'Search famous company logos, browse community uploads, or upload your own.',
    contentFit: 'contain',
  },
};

export function ImageUploadField({
  label,
  description,
  value,
  onChange,
  onRemove,
  variant = 'banner',
  disabled = false,
  presentation = 'default',
}: ImageUploadFieldProps) {
  const [isPicking, setIsPicking] = useState(false);
  const [logoModalVisible, setLogoModalVisible] = useState(false);
  const [pendingAsset, setPendingAsset] = useState<PickedImage | null>(null);
  const config = VARIANT_CONFIG[variant];
  const hasImage = Boolean(value?.trim());

  const uploadAdjustedImage = async (uri: string) => {
    setPendingAsset(null);
    if (AUTH_TEST_MODE) {
      onChange(uri);
      if (variant === 'logo') {
        void recordCommunityUploadedLogo({ value: uri, isOwn: true });
        setLogoModalVisible(false);
      }
      setIsPicking(false);
      return;
    }
    try {
      const remoteUrl = await commitPendingMedia(uri, VARIANT_MEDIA_KIND[variant]);
      onChange(remoteUrl);
      if (variant === 'logo') {
        void recordCommunityUploadedLogo({ value: remoteUrl, isOwn: true });
        setLogoModalVisible(false);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (error) {
      clearPendingMedia(uri);
      const message = error instanceof Error && error.message.trim() ? error.message : 'The uploaded image type or size is not allowed.';
      Alert.alert('Couldn’t upload image', message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    } finally {
      setIsPicking(false);
    }
  };

  const pickSource = async (source: 'camera' | 'library') => {
    if (disabled || isPicking) return;
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
    } catch (error) {
      setIsPicking(false);
      Alert.alert('Couldn’t open photo', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const handlePickFromDevice = () => {
    if (disabled || isPicking) return;
    Alert.alert(`Add ${label || 'photo'}`, 'Choose a photo source.', [
      { text: 'Take Photo', onPress: () => { void pickSource('camera'); } },
      { text: 'Photo Library', onPress: () => { void pickSource('library'); } },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handlePrimaryPress = () => {
    if (disabled || isPicking) return;
    if (variant === 'logo') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      setLogoModalVisible(true);
      return;
    }
    handlePickFromDevice();
  };

  const handleRemove = () => {
    if (disabled || isPicking) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    onRemove?.();
    onChange('');
  };

  if (presentation === 'compact' && variant === 'avatar') {
    return (
      <Fragment>
      <View className="mb-5 items-center">
        <Pressable
          accessibilityLabel={hasImage ? `Edit ${label || 'profile photo'}` : `Upload ${label || 'profile photo'}`}
          accessibilityRole="button"
          disabled={disabled || isPicking}
          onPress={handlePrimaryPress}
          className="relative active:opacity-90"
        >
          <View
            className={`h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-dashed ${
              hasImage
                ? 'border-slate-600 bg-slate-900 dark:border-slate-600'
                : 'border-slate-400 bg-slate-100/80 dark:border-slate-600 dark:bg-[#0f172a]'
            }`}
          >
            {isPicking ? (
              <ActivityIndicator size="small" color="#38bdf8" />
            ) : hasImage ? (
              <MediaImage
                sourceUrl={value ?? ''}
                contentFit="cover"
                style={{ width: '100%', height: '100%' }}
                accessibilityLabel={`${label || 'Profile photo'} preview`}
              />
            ) : (
              <>
                <Upload color="#64748b" size={32} strokeWidth={2} />
                <Text className="mt-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                  Upload photo
                </Text>
              </>
            )}
          </View>
          {hasImage && !isPicking ? (
            <View className="absolute bottom-0 right-0 h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-[#0284c7] dark:border-dark-background">
              <Pencil color="#ffffff" size={16} strokeWidth={2.4} />
            </View>
          ) : null}
        </Pressable>
      </View>
      <PhotoAdjustmentModal
        asset={pendingAsset}
        aspect={config.aspect}
        title={`Adjust ${label || 'photo'}`}
        onCancel={() => { setPendingAsset(null); setIsPicking(false); }}
        onSave={uploadAdjustedImage}
      />
      </Fragment>
    );
  }

  return (
    <View className="mb-4 rounded-[24px] border border-slate-200 bg-card p-4 dark:border-slate-800 dark:bg-[#0b1120]">
      <View className="mb-3">
        <Text className="text-xs font-bold uppercase tracking-wider text-textMuted dark:text-slate-400">
          {label}
        </Text>
        <Text className="mt-1 text-xs text-textMuted dark:text-slate-400">
          {description ?? config.hint}
        </Text>
      </View>

      <Pressable
        disabled={disabled || isPicking}
        onPress={handlePrimaryPress}
        className={`overflow-hidden border border-dashed border-slate-300 bg-slate-100/70 active:opacity-90 dark:border-slate-700 dark:bg-[#060a14] ${
          variant === 'avatar' ? 'my-2 items-center justify-center self-center' : 'my-1 w-full items-center justify-center'
        } ${config.previewClass}`}
      >
        {isPicking ? (
          <ActivityIndicator size="small" color="#38bdf8" />
        ) : hasImage ? (
          <MediaImage
            sourceUrl={value ?? ''}
            contentFit={config.contentFit}
            style={{ width: '100%', height: '100%' }}
            accessibilityLabel={`${label} preview`}
          />
        ) : (
          <View className="h-full w-full items-center justify-center px-4 py-6">
            {variant === 'logo' ? (
              <>
                <Search color="#38bdf8" size={28} strokeWidth={2} />
                <Text className="mt-2 text-center text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Tap to search company logos or upload
                </Text>
              </>
            ) : (
              <>
                <ImagePlus color="#64748b" size={32} strokeWidth={1.8} />
                <Text className="mt-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Tap to upload or select photo
                </Text>
              </>
            )}
          </View>
        )}
      </Pressable>

      {variant === 'banner' ? (
        <View className="mt-3">
          <Text className="mb-2 text-xs font-bold text-textPrimary dark:text-dark-textPrimary">Choose a professional cover</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 4 }}>
            {COVER_PHOTO_PRESETS.map((preset) => {
              const selected = value === preset.value;
              return (
                <Pressable
                  key={preset.id}
                  accessibilityLabel={`Use ${preset.label} cover`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  disabled={disabled || isPicking}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    onChange(preset.value);
                  }}
                  className={`overflow-hidden rounded-xl border-2 active:opacity-80 ${selected ? 'border-primary' : 'border-transparent'}`}
                  style={{ height: 72, width: 124 }}
                >
                  <MediaImage sourceUrl={preset.value} contentFit="cover" style={{ width: '100%', height: '100%' }} />
                  <View className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1">
                    <Text numberOfLines={1} className="text-[10px] font-bold text-white">{preset.label}</Text>
                  </View>
                  {selected ? (
                    <View className="absolute right-1.5 top-1.5 size-6 items-center justify-center rounded-full bg-white">
                      <Check color="#2563eb" size={14} strokeWidth={3} />
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      <View className="mt-3 flex-row items-center gap-2.5">
        <Pressable
          accessibilityLabel={hasImage ? `Replace ${label}` : `Upload ${label}`}
          accessibilityRole="button"
          disabled={disabled || isPicking}
          onPress={handlePrimaryPress}
          className="min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-[#0284c7] px-4 active:opacity-85 dark:bg-[#0284c7]"
        >
          {isPicking ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : variant === 'logo' ? (
            <>
              <Search color="#ffffff" size={17} strokeWidth={2.4} />
              <Text className="text-sm font-bold text-white">
                {hasImage ? 'Change / Search Logo' : 'Search or Upload Logo'}
              </Text>
            </>
          ) : (
            <>
              <Upload color="#ffffff" size={17} strokeWidth={2.4} />
              <Text className="text-sm font-bold text-white">{hasImage ? 'Replace' : 'Upload'}</Text>
            </>
          )}
        </Pressable>

        {hasImage ? (
          <Pressable
            accessibilityLabel={`Remove ${label}`}
            accessibilityRole="button"
            disabled={disabled || isPicking}
            onPress={handleRemove}
            className="min-h-11 flex-row items-center justify-center gap-2 rounded-2xl border border-rose-500/30 bg-slate-100 px-4 active:opacity-85 dark:border-rose-950 dark:bg-[#0f172a]"
          >
            <Trash2 color="#ef4444" size={17} strokeWidth={2.2} />
            <Text className="text-sm font-bold text-rose-500 dark:text-rose-400">Remove</Text>
          </Pressable>
        ) : null}
      </View>

      {variant === 'logo' ? (
        <CompanyLogoPickerModal
          visible={logoModalVisible}
          value={value}
          isUploading={isPicking}
          onClose={() => setLogoModalVisible(false)}
          onSelectLogo={(logoUri) => onChange(logoUri)}
          onUploadFromDevice={handlePickFromDevice}
          onRemoveLogo={hasImage ? handleRemove : undefined}
        />
      ) : null}
      <PhotoAdjustmentModal
        asset={pendingAsset}
        aspect={config.aspect}
        title={`Adjust ${label || 'photo'}`}
        onCancel={() => { setPendingAsset(null); setIsPicking(false); }}
        onSave={uploadAdjustedImage}
      />
    </View>
  );
}
