import { ActivityIndicator, Modal, View } from 'react-native';
import { Text } from '@/components/uiComponents/Text';

export function WalletProcessingModal({ label, visible }: { label: string; visible: boolean }) {
  const walletName = label.replace(/^Add to /, '') || 'your wallet';

  return (
    <Modal
      animationType="fade"
      onRequestClose={() => undefined}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View
        accessibilityLabel={`Adding card to ${walletName}`}
        accessibilityLiveRegion="polite"
        accessibilityRole="progressbar"
        className="flex-1 items-center justify-center bg-slate-950/60 px-8"
      >
        <View className="w-full max-w-sm items-center rounded-3xl bg-card px-6 py-7 shadow-lg dark:bg-dark-card">
          <ActivityIndicator color="#2563eb" size="large" />
          <Text variant="heading" className="mt-5 text-center">
            Adding to {walletName}
          </Text>
          <Text variant="muted" className="mt-2 text-center">
            Preparing and confirming your wallet pass. This may take a few seconds.
          </Text>
        </View>
      </View>
    </Modal>
  );
}
