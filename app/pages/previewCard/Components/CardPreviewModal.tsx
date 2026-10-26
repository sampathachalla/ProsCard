import { Modal, Pressable, ScrollView, View } from 'react-native';
import { Eye, Pencil } from 'lucide-react-native';
import { SafeAreaView, type EdgeInsets } from 'react-native-safe-area-context';
import { Text } from '@/common/ui/Text';
import { CardDetailView } from '@/pages/fullCard/Components/CardDetailView';
import type { BusinessCard } from '@/pages/cards/types/card.types';
import type { Profile } from '@/pages/profile/types/profile.types';

type Props = {
  card: BusinessCard;
  insets: EdgeInsets;
  profile: Profile;
  viewportHeight: number;
  visible: boolean;
  onClose: () => void;
};

/** Full-screen preview of the card as others will see it, with a way back to editing. */
export function CardPreviewModal({ card, insets, profile, viewportHeight, visible, onClose }: Props) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} presentationStyle="fullScreen" visible={visible}>
      <SafeAreaView
        className="flex-1 bg-background dark:bg-dark-background"
        edges={['left', 'right']}
        style={{
          paddingTop: Math.max(insets.top, 12),
          paddingBottom: Math.max(insets.bottom, 8),
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 88 }}>
          <CardDetailView card={card} fullBleed profile={profile} viewportHeight={viewportHeight} />
        </ScrollView>
        <Pressable
          accessibilityLabel="Exit preview"
          accessibilityRole="button"
          onPress={onClose}
          className="absolute right-4 min-h-[44px] flex-row items-center justify-center rounded-full border border-white/30 px-3.5 active:scale-95"
          style={{
            backgroundColor: 'rgba(2, 6, 23, 0.42)',
            elevation: 30,
            top: Math.max(insets.top + 8, 16),
          }}
        >
          <Eye color="#ffffff" size={19} strokeWidth={2.2} />
          <View className="ml-2 size-2 rounded-full bg-emerald-400" />
          <Text className="ml-1.5 text-sm font-bold text-white">Preview</Text>
        </Pressable>
        <View className="absolute inset-x-5" style={{ bottom: Math.max(insets.bottom + 18, 24), elevation: 30 }}>
          <Pressable
            accessibilityLabel="Back to edit"
            accessibilityRole="button"
            onPress={onClose}
            className="min-h-[48px] flex-1 flex-row items-center justify-center rounded-full border border-white/30 bg-slate-800 px-4 active:opacity-80"
          >
            <Pencil color="#ffffff" size={18} strokeWidth={2.4} />
            <Text className="ml-2 text-sm font-bold text-white">Back to edit</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
