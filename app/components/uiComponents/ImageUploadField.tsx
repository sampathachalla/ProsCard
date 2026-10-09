import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check, ImagePlus, Pencil, Trash2, Upload } from 'lucide-react-native';
import { Text } from './Text';
import { pickImageFromLibrary } from './usePickImage';
import { MediaImage } from './MediaImage';
import { COVER_PHOTO_PRESETS } from '@/components/cardsComponents/Services/coverPhotoPresets';

export type ImageUploadVariant = 'banner' | 'avatar' | 'logo';

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
    hint: 'Company or personal mark displayed on the card.',
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
  const config = VARIANT_CONFIG[variant];
  const hasImage = Boolean(value?.trim());

  const handlePick = async () => {
    if (disabled || isPicking) return;
    setIsPicking(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      const uri = await pickImageFromLibrary({ aspect: config.aspect, allowsEditing: true });
      if (uri) onChange(uri);
    } finally {
      setIsPicking(false);
    }
  };

  const handleRemove = () => {
    if (disabled || isPicking) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    onRemove?.();
    onChange('');
  };

  if (presentation === 'compact' && variant === 'avatar') {
    return (
      <View className="mb-5 items-center">
        <Pressable
          accessibilityLabel={hasImage ? `Edit ${label || 'profile photo'}` : `Upload ${label || 'profile photo'}`}
          accessibilityRole="button"
          disabled={disabled || isPicking}
          onPress={handlePick}
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

      <View
        className={`overflow-hidden border border-dashed border-slate-300 bg-slate-100/70 dark:border-slate-700 dark:bg-[#060a14] ${
          variant === 'avatar' ? 'self-center items-center justify-center my-2' : 'w-full items-center justify-center my-1'
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
          <Pressable
            disabled={disabled || isPicking}
            onPress={handlePick}
            className="h-full w-full items-center justify-center px-4 py-6"
          >
            <ImagePlus color="#64748b" size={32} strokeWidth={1.8} />
            <Text className="mt-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
              Tap to upload or select photo
            </Text>
          </Pressable>
        )}
      </View>

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
          onPress={handlePick}
          className="min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-[#0284c7] px-4 active:opacity-85 dark:bg-[#0284c7]"
        >
          {isPicking ? (
            <ActivityIndicator color="#ffffff" size="small" />
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
    </View>
  );
}
