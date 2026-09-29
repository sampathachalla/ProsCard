// components/scannerComponents/PermissionGate.tsx
import { Linking, View, Text, TouchableOpacity } from 'react-native';
import { Camera } from 'lucide-react-native';

export function PermissionGate({
  canAskAgain = true,
  onRequestPermission,
}: {
  /** false once the OS has permanently denied the prompt (won't re-show it). */
  canAskAgain?: boolean;
  onRequestPermission: () => void;
}) {
  return (
    <View className="flex-1 bg-background dark:bg-dark-background items-center justify-center px-8">
      <Camera color="#7A7A7A" size={56} strokeWidth={1.8} />
      <Text className="text-textPrimary dark:text-dark-textPrimary text-lg font-bold mt-4 text-center">
        Camera access needed
      </Text>
      <Text className="text-textMuted dark:text-dark-textMuted text-sm mt-2 text-center">
        {canAskAgain
          ? 'ProsCard needs your camera to scan QR codes on other business cards.'
          : 'Camera access was denied. Enable it in Settings to scan QR codes on other business cards.'}
      </Text>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={canAskAgain ? 'Grant camera permission' : 'Open Settings'}
        className="bg-primary dark:bg-dark-primary rounded-full px-6 py-3 mt-6"
        onPress={canAskAgain ? onRequestPermission : () => Linking.openSettings()}
      >
        <Text className="text-white font-semibold">{canAskAgain ? 'Grant permission' : 'Open Settings'}</Text>
      </TouchableOpacity>
    </View>
  );
}
