import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { ImagePlus, Link2, Trash2, Upload, X } from 'lucide-react-native';
import { Text } from './Text';
import { pickImageFromLibrary } from './usePickImage';

export type ImageUploadVariant = 'banner' | 'avatar' | 'logo';

type ImageUploadFieldProps = {
  label: string;
  description?: string;
  value?: string;
  onChange: (uri: string) => void;
  onRemove?: () => void;
  variant?: ImageUploadVariant;
  disabled?: boolean;
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
}: ImageUploadFieldProps) {
  const [isPicking, setIsPicking] = useState(false);
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
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

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
      setUrlModalOpen(false);
    }
  };

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
          <Image
            source={{ uri: value }}
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

        <Pressable
          accessibilityLabel={`Paste URL for ${label}`}
          accessibilityRole="button"
          disabled={disabled || isPicking}
          onPress={() => {
            setUrlInput(value || '');
            setUrlModalOpen(true);
          }}
          className="h-11 w-11 items-center justify-center rounded-2xl border border-slate-300 bg-slate-100 active:opacity-85 dark:border-slate-700 dark:bg-[#0f172a]"
        >
          <Link2 color="#94a3b8" size={17} strokeWidth={2.2} />
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

      {/* URL Input Modal */}
      <Modal visible={urlModalOpen} transparent animationType="fade" onRequestClose={() => setUrlModalOpen(false)}>
        <Pressable className="flex-1 items-center justify-center bg-black/60 px-5" onPress={() => setUrlModalOpen(false)}>
          <Pressable className="w-full max-w-md rounded-[26px] border border-slate-200 bg-card p-5 dark:border-slate-700 dark:bg-dark-card" onPress={(e) => e.stopPropagation()}>
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-base font-bold text-textPrimary dark:text-dark-textPrimary">Enter Image URL</Text>
              <Pressable onPress={() => setUrlModalOpen(false)} className="p-1">
                <X color="#94a3b8" size={20} />
              </Pressable>
            </View>
            <TextInput
              value={urlInput}
              onChangeText={setUrlInput}
              placeholder="https://example.com/image.jpg"
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              className="rounded-xl border border-slate-200 bg-background px-4 py-3 text-textPrimary dark:border-slate-700 dark:bg-dark-background dark:text-dark-textPrimary"
            />
            <View className="mt-4 flex-row justify-end gap-2">
              <Pressable onPress={() => setUrlModalOpen(false)} className="rounded-xl px-4 py-2.5">
                <Text className="font-semibold text-textMuted dark:text-dark-textMuted">Cancel</Text>
              </Pressable>
              <Pressable onPress={handleApplyUrl} className="rounded-xl bg-primary px-5 py-2.5 dark:bg-dark-primary">
                <Text className="font-bold text-white">Apply</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
