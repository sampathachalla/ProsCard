import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image as ImageIcon, Sparkles, User } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { PageHeader } from '@/common/ui/PageHeader';
import { Text } from '@/common/ui/Text';
import { UserMediaLibrarySection } from './Components/UserMediaLibrarySection';
import { deleteMedia } from './Services/mediaService';
import {
  fetchUserMediaLibrary,
  groupUserMediaByKind,
} from './Services/userMediaLibraryService';
import type { UserMediaLibraryItem } from '@/services/api/types';
import { showMessage } from '@/common/ui/confirmAction';

export default function UserMediaLibraryPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<UserMediaLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const grouped = useMemo(() => groupUserMediaByKind(items), [items]);

  const loadLibrary = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') setLoading(true);
    else setRefreshing(true);
    try {
      const next = await fetchUserMediaLibrary();
      setItems(next);
    } catch (error) {
      showMessage(
        'Could not load media',
        error instanceof Error ? error.message : 'Check your connection and try again.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadLibrary('initial');
  }, [loadLibrary]);

  const handleDelete = async (item: UserMediaLibraryItem) => {
    try {
      await deleteMedia(item.mediaId);
      setItems((current) => current.filter((entry) => entry.mediaId !== item.mediaId));
    } catch (error) {
      showMessage(
        'Delete failed',
        error instanceof Error ? error.message : 'Could not delete this upload.',
      );
    }
  };

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <PageHeader
        title="Your media"
        subtitle="Every cover, profile photo, and logo you have uploaded"
        onBackPress={() => (router.canGoBack() ? router.back() : router.replace('/profile'))}
      />

      {loading && items.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={Colors.light.tint} size="large" />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: Math.max(insets.bottom, 24) + 32,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void loadLibrary('refresh')} />
          }
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-6 rounded-2xl border border-slate-200 bg-card px-4 py-4 dark:border-slate-800 dark:bg-dark-card">
            <View className="flex-row items-center gap-2">
              <Sparkles color={Colors.light.tint} size={18} strokeWidth={2.2} />
              <Text className="text-sm font-semibold text-textPrimary dark:text-dark-textPrimary">
                Your space
              </Text>
            </View>
            <Text variant="muted" className="mt-2 text-sm leading-5">
              Uploads from your account and cards live here. Active items show a badge on your profile or cards.
              Long-press or use the trash icon to remove unused files.
            </Text>
          </View>

          <UserMediaLibrarySection
            kind="coverPhoto"
            title="Cover photos"
            description="Banner images from your profile and cards"
            icon={ImageIcon}
            items={grouped.coverPhoto}
            loading={loading}
            onDeleteItem={(item) => void handleDelete(item)}
          />

          <UserMediaLibrarySection
            kind="profilePhoto"
            title="Profile photos"
            description="Headshots used on cards and your account"
            icon={User}
            items={grouped.profilePhoto}
            loading={loading}
            onDeleteItem={(item) => void handleDelete(item)}
          />

          <UserMediaLibrarySection
            kind="companyLogo"
            title="Logos"
            description="Company marks from your uploads"
            icon={Sparkles}
            items={grouped.companyLogo}
            loading={loading}
            onDeleteItem={(item) => void handleDelete(item)}
          />
        </ScrollView>
      )}
    </View>
  );
}
