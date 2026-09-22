import { View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScanLine, Users } from 'lucide-react-native';

import { Button } from '@/components/uiComponents/Button';

type HomeActionsProps = {
  onScanPress?: () => void;
  onContactsPress?: () => void;
};

export function HomeActions({
  onScanPress,
  onContactsPress,
}: HomeActionsProps) {
  const router = useRouter();

  const handleScan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    if (onScanPress) {
      onScanPress();
    } else {
      router.push('/(tabs)/scannerPage');
    }
  };

  const handleContacts = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    if (onContactsPress) {
      onContactsPress();
    } else {
      router.push('/(tabs)/contactsPage');
    }
  };

  return (
    <View>
      <View className="flex-row gap-3">
        <Button
          className="flex-1"
          icon={ScanLine}
          label="Scan Card"
          variant="secondary"
          onPress={handleScan}
        />
        <Button
          className="flex-1"
          icon={Users}
          label="Contacts"
          variant="primary"
          onPress={handleContacts}
        />
      </View>
    </View>
  );
}
