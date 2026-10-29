import { Alert, Pressable, View, useWindowDimensions } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { Text } from '@/common/ui/Text';
import { MediaImage } from '@/common/ui/MediaImage';
import type { ProfileMediaKind, UserMediaLibraryItem } from '@/services/api/types';

export type UserMediaGalleryLayout = 'cover' | 'avatar' | 'logo';

const LAYOUT_CONFIG: Record<
  UserMediaGalleryLayout,
  { columns: number; aspectRatio: number; imageFit: 'cover' | 'contain'; tileBg: string }
> = {
  cover: { columns: 2, aspectRatio: 16 / 9, imageFit: 'cover', tileBg: 'bg-slate-200 dark:bg-slate-800' },
  avatar: { columns: 3, aspectRatio: 1, imageFit: 'cover', tileBg: 'bg-slate-200 dark:bg-slate-800' },
  logo: { columns: 3, aspectRatio: 1, imageFit: 'contain', tileBg: 'bg-slate-50 dark:bg-slate-900' },
};

type Props = {
  items: UserMediaLibraryItem[];
  layout: UserMediaGalleryLayout;
  onDelete?: (item: UserMediaLibraryItem) => void;
};

function formatUploadedLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Responsive thumbnail grid for one media kind (covers, avatars, or logos). */
export function UserMediaThumbGrid({ items, layout, onDelete }: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const config = LAYOUT_CONFIG[layout];
  const horizontalPadding = 32;
  const gap = 12;
  const available = Math.min(windowWidth, 560) - horizontalPadding;
  const tileWidth = (available - gap * (config.columns - 1)) / config.columns;
  const tileHeight = Math.round(tileWidth / config.aspectRatio);

  const confirmDelete = (item: UserMediaLibraryItem) => {
    if (!onDelete) return;
    if (item.inUse) {
      Alert.alert('In use', 'This image is on your profile or a card. Replace it there before deleting.');
      return;
    }
    Alert.alert('Delete upload?', 'This removes the file from your library.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(item) },
    ]);
  };

  return (
    <View className="flex-row flex-wrap" style={{ gap }}>
      {items.map((item) => (
        <View key={item.mediaId} style={{ width: tileWidth }}>
          <Pressable
            accessibilityRole="imagebutton"
            accessibilityLabel={`Uploaded ${layout}${item.inUse ? ', currently active' : ''}`}
            onLongPress={onDelete ? () => confirmDelete(item) : undefined}
            className={`overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 ${config.tileBg}`}
            style={{ width: tileWidth, height: tileHeight }}
          >
            <MediaImage
              sourceUrl={item.contentUrl}
              style={{ width: '100%', height: '100%' }}
              contentFit={config.imageFit}
            />
            {item.inUse ? (
              <View className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 dark:bg-dark-primary">
                <Text variant="tiny" className="font-semibold uppercase tracking-wide text-white">
                  Active
                </Text>
              </View>
            ) : null}
            {onDelete && !item.inUse ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Delete upload"
                onPress={() => confirmDelete(item)}
                className="absolute bottom-2 right-2 h-8 w-8 items-center justify-center rounded-full bg-black/55 active:opacity-80"
              >
                <Trash2 color="#f8fafc" size={15} strokeWidth={2.2} />
              </Pressable>
            ) : null}
          </Pressable>
          <Text variant="tiny" className="mt-1.5 px-0.5" numberOfLines={1}>
            {formatUploadedLabel(item.createdAt)}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function layoutForMediaKind(kind: ProfileMediaKind): UserMediaGalleryLayout {
  if (kind === 'coverPhoto') return 'cover';
  if (kind === 'profilePhoto') return 'avatar';
  return 'logo';
}
