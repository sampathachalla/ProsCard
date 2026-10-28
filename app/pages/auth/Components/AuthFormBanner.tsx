import { View } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { Text } from '@/common/ui/Text';

type Props = {
  message: string;
};

/** Inline error shown above the auth form (replaces popup alerts for form-level failures). */
export function AuthFormBanner({ message }: Props) {
  if (!message.trim()) return null;
  return (
    <View
      accessibilityRole="alert"
      className="mb-4 flex-row items-start rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 dark:border-red-900/50 dark:bg-red-950/40"
    >
      <AlertCircle color="#ef4444" size={18} strokeWidth={2.2} style={{ marginTop: 1 }} />
      <Text variant="none" className="ml-2.5 flex-1 text-sm leading-5 text-red-700 dark:text-red-300">
        {message}
      </Text>
    </View>
  );
}
