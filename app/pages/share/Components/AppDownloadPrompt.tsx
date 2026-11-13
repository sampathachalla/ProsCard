import { Linking, Modal, Platform, Pressable, View } from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Download, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/common/ui/Text';
import { WelcomeBrandHeader } from '@/pages/auth/Components/AuthWelcomeContent';
import { AuthWelcomeFeatureCarousel } from '@/pages/auth/Components/AuthWelcomeFeatureCarousel';

const APP_STORE_URL = process.env.EXPO_PUBLIC_IOS_APP_STORE_URL?.trim()
  || 'https://apps.apple.com/us/search?term=VC%20Pros';
const PLAY_STORE_URL = process.env.EXPO_PUBLIC_ANDROID_PLAY_STORE_URL?.trim()
  || 'https://play.google.com/store/apps/details?id=com.mindpros.proscard';

type MobilePlatform = 'ios' | 'android' | 'other';

function detectMobilePlatform(): MobilePlatform {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') return 'other';
  const userAgent = navigator.userAgent;
  if (/android/i.test(userAgent)) return 'android';
  if (/iPad|iPhone|iPod/i.test(userAgent) || (/Macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1)) {
    return 'ios';
  }
  return 'other';
}

function StoreButton({ label, store, url }: { label: string; store: 'ios' | 'android'; url: string }) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={() => void Linking.openURL(url)}
      className="min-h-[54px] flex-1 flex-row items-center justify-center gap-2.5 rounded-2xl bg-primary px-5 py-3.5 active:opacity-85 dark:bg-[#2563eb]"
    >
      <FontAwesome6 color="#FFFFFF" name={store === 'ios' ? 'app-store-ios' : 'google-play'} size={22} />
      <Text variant="none" className="text-center text-[15px] font-semibold text-white">
        {label}
      </Text>
    </Pressable>
  );
}

export function AppDownloadPrompt({ onClose, visible }: { onClose: () => void; visible: boolean }) {
  const mobilePlatform = detectMobilePlatform();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="fullScreen">
      <SafeAreaView className="flex-1 bg-background dark:bg-dark-background" edges={['top', 'left', 'right', 'bottom']}>
        <View className="absolute right-4 top-4 z-10">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close app download prompt"
            onPress={onClose}
            className="h-12 w-12 items-center justify-center rounded-full bg-card/90 active:opacity-75 dark:bg-dark-card/90"
          >
            <X color="#94a3b8" size={22} strokeWidth={2.2} />
          </Pressable>
        </View>

        <View className="flex-1 justify-between pb-5 pt-1">
          <WelcomeBrandHeader />
          <View className="min-h-0 flex-1">
            <AuthWelcomeFeatureCarousel />
          </View>

          <View className="px-6 pt-3">
            <View className="mb-3 flex-row items-center justify-center gap-2">
              <Download color="#38bdf8" size={18} strokeWidth={2.3} />
              <Text variant="none" className="text-center text-sm font-semibold text-textPrimary dark:text-dark-textPrimary">
                Create and share your own VC Pros card
              </Text>
            </View>
            <View className="flex-row gap-3">
              {mobilePlatform !== 'android' ? (
                <StoreButton label="Download on App Store" store="ios" url={APP_STORE_URL} />
              ) : null}
              {mobilePlatform !== 'ios' ? (
                <StoreButton label="Get it on Google Play" store="android" url={PLAY_STORE_URL} />
              ) : null}
            </View>
            <Pressable accessibilityRole="button" onPress={onClose} className="min-h-11 items-center justify-center pt-3">
              <Text variant="muted" className="text-sm font-medium">Continue viewing card</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
