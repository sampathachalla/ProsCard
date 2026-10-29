import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Camera, Check, Image as ImageIcon, ImagePlus, Trash2, UserRound, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MediaImage } from './MediaImage';
import { Text } from './Text';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';
import { deleteMedia } from '@/pages/profile/Services/mediaService';
import { fetchUserMediaLibrary } from '@/pages/profile/Services/userMediaLibraryService';
import type { ProfileMediaKind, UserMediaLibraryItem } from '@/services/api/types';

export type CardMediaPickerModalProps = {
  visible: boolean;
  field: 'coverPhoto' | 'profilePhoto';
  currentValue: string;
  onClose: () => void;
  onSelectMedia: (url: string) => void;
  onTakePhoto: () => void;
  onPickFromDeviceLibrary: () => void;
  onRemove?: () => void;
};

export function CardMediaPickerModal({
  visible,
  field,
  currentValue,
  onClose,
  onSelectMedia,
  onTakePhoto,
  onPickFromDeviceLibrary,
  onRemove,
}: CardMediaPickerModalProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';
  const tint = isDark ? Colors.dark.tint : Colors.light.tint;

  const [items, setItems] = useState<UserMediaLibraryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const isCover = field === 'coverPhoto';
  const title = isCover ? 'Cover photo' : 'Profile photo';
  const HeaderIcon = isCover ? ImagePlus : UserRound;

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    setLoading(true);

    fetchUserMediaLibrary(field as ProfileMediaKind)
      .then((data) => {
        if (cancelled) return;
        setItems(data.filter((item) => item.kind === field));
      })
      .catch(() => {
        if (cancelled) return;
        setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [field, visible]);

  const handleSelect = (url: string) => {
    Haptics.selectionAsync().catch(() => {});
    onSelectMedia(url);
    onClose();
  };

  const handleDeleteItem = (item: UserMediaLibraryItem) => {
    if (item.contentUrl === currentValue) {
      Alert.alert('In use', 'This image is currently active. Remove or replace it before deleting.');
      return;
    }
    Alert.alert('Delete upload?', 'This will permanently remove the file from your uploads.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMedia(item.mediaId);
            setItems((curr) => curr.filter((i) => i.mediaId !== item.mediaId));
          } catch (error) {
            Alert.alert('Delete failed', error instanceof Error ? error.message : 'Please try again.');
          }
        },
      },
    ]);
  };

  // Dimensions for grid items
  const containerWidth = Math.min(windowWidth - 40, 440);
  const contentPadding = 32;
  const availableWidth = containerWidth - contentPadding;
  const gap = 10;

  const columns = isCover ? 2 : 3;
  const tileWidth = (availableWidth - gap * (columns - 1)) / columns;
  const tileHeight = isCover ? Math.round(tileWidth * (9 / 16)) : tileWidth;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-slate-950/75 px-5">
        <Pressable
          className="absolute inset-0"
          onPress={onClose}
          accessibilityLabel="Dismiss media picker"
        />
        <View
          style={{ width: containerWidth, maxHeight: '85%' }}
          className="rounded-3xl border border-slate-200/80 bg-background p-5 shadow-2xl dark:border-slate-800 dark:bg-dark-card"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-slate-200/70 dark:border-slate-800">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10 dark:bg-sky-500/15">
                <HeaderIcon size={20} color={tint} strokeWidth={2.2} />
              </View>
              <View>
                <Text className="text-[17px] font-bold text-textPrimary dark:text-dark-textPrimary">
                  {title}
                </Text>
                <Text className="text-xs text-textMuted dark:text-dark-textMuted">
                  Choose from your uploads or upload new
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close dialog"
              hitSlop={8}
              onPress={onClose}
              className="h-8 w-8 items-center justify-center rounded-full bg-slate-100 active:opacity-75 dark:bg-slate-800"
            >
              <X size={16} color={isDark ? '#94a3b8' : '#64748b'} strokeWidth={2.2} />
            </Pressable>
          </View>

          {/* Quick Upload / Device actions */}
          <View className="mt-3.5 flex-row gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Take photo"
              onPress={() => {
                onClose();
                onTakePhoto();
              }}
              className="flex-1 min-h-[44px] flex-row items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 px-3 active:opacity-75 dark:bg-sky-500/15 dark:border-sky-500/25"
            >
              <Camera size={16} color={tint} strokeWidth={2.2} />
              <Text className="ml-2 text-xs font-bold text-primary dark:text-dark-primary">
                Camera
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Photo library"
              onPress={() => {
                onClose();
                onPickFromDeviceLibrary();
              }}
              className="flex-1 min-h-[44px] flex-row items-center justify-center rounded-2xl bg-slate-100 border border-slate-200 px-3 active:opacity-75 dark:bg-slate-800 dark:border-slate-700"
            >
              <ImageIcon size={16} color={isDark ? '#cbd5e1' : '#475569'} strokeWidth={2.2} />
              <Text className="ml-2 text-xs font-bold text-textPrimary dark:text-dark-textPrimary">
                Device library
              </Text>
            </Pressable>

            {currentValue.trim() && onRemove ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove photo"
                onPress={() => {
                  onRemove();
                  onClose();
                }}
                className="h-[44px] w-[44px] items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 active:opacity-75 dark:border-rose-900/40 dark:bg-rose-950/25"
              >
                <Trash2 size={16} color={isDark ? '#f87171' : '#e11d48'} strokeWidth={2.2} />
              </Pressable>
            ) : null}
          </View>

          {/* Uploads section */}
          <View className="mt-4 flex-row items-center justify-between">
            <Text className="text-xs font-semibold uppercase tracking-wider text-textMuted dark:text-dark-textMuted">
              Your media uploads ({items.length})
            </Text>
          </View>

          <ScrollView
            className="mt-2"
            contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 12) + 4 }}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View className="h-32 items-center justify-center">
                <ActivityIndicator color={tint} />
              </View>
            ) : items.length === 0 ? (
              <View className="items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-8 px-4 dark:border-slate-800 dark:bg-slate-900/30">
                <HeaderIcon size={28} color={isDark ? '#64748b' : '#94a3b8'} strokeWidth={1.8} />
                <Text className="mt-2 text-center text-xs font-medium text-textMuted dark:text-dark-textMuted">
                  No uploaded {isCover ? 'cover photos' : 'profile photos'} yet.{'\n'}Use Camera or Device library above to add one.
                </Text>
              </View>
            ) : (
              <View className="flex-row flex-wrap" style={{ gap }}>
                {items.map((item) => {
                  const isSelected = item.contentUrl === currentValue;
                  return (
                    <View key={item.mediaId} style={{ width: tileWidth }}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Select this ${title}`}
                        onPress={() => handleSelect(item.contentUrl)}
                        onLongPress={() => handleDeleteItem(item)}
                        style={{ width: tileWidth, height: tileHeight }}
                        className={`overflow-hidden rounded-2xl border active:opacity-85 ${
                          isSelected
                            ? 'border-primary ring-2 ring-primary/40 dark:border-dark-primary'
                            : 'border-slate-200 dark:border-slate-700'
                        } ${isCover ? '' : 'rounded-full'}`}
                      >
                        <MediaImage
                          sourceUrl={item.contentUrl}
                          style={{ width: '100%', height: '100%' }}
                          contentFit="cover"
                        />
                        {isSelected ? (
                          <View className="absolute inset-0 items-center justify-center bg-black/35">
                            <View className="size-6 items-center justify-center rounded-full bg-primary dark:bg-dark-primary">
                              <Check color="#ffffff" size={14} strokeWidth={3} />
                            </View>
                          </View>
                        ) : null}
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
