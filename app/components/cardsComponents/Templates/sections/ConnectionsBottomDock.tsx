import { Pressable, View } from 'react-native';
import { UserPlus } from 'lucide-react-native';
import { Text } from '@/components/uiComponents/Text';

export type ConnectionsBottomDockProps = {
  accentColor: string;
  compact?: boolean;
  disabled?: boolean;
  fontFamily?: string;
  letterSpacing?: number;
  onSaveContact?: () => void;
  onShareCard?: () => void;
  surfaceColor?: string;
  textColor?: string;
};

export function ConnectionsBottomDock({
  accentColor,
  compact = false,
  disabled = false,
  fontFamily,
  letterSpacing,
  onSaveContact,
}: ConnectionsBottomDockProps) {
  const buttonHeight = compact ? 50 : 52;
  const iconSize = compact ? 17 : 18;
  const textSize = 'text-sm';

  return (
    <View
      className="w-full"
      pointerEvents={disabled ? 'none' : 'auto'}
      style={{
        marginTop: compact ? 2 : 4,
        marginBottom: compact ? 2 : 4,
        opacity: disabled ? 0.9 : 1,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Save contact to phone"
        disabled={disabled}
        onPress={onSaveContact}
        className="w-full flex-row items-center justify-center rounded-xl active:opacity-85"
        style={{
          backgroundColor: accentColor,
          elevation: 2,
          height: buttonHeight,
          paddingHorizontal: 14,
          shadowColor: accentColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.18,
          shadowRadius: 4,
        }}
      >
        <UserPlus color="#FFFFFF" size={iconSize} />
        <Text
          variant="none"
          numberOfLines={1}
          className={`ml-2 font-bold text-white ${textSize}`}
          style={{ fontFamily, letterSpacing }}
        >
          Save Contact
        </Text>
      </Pressable>
    </View>
  );
}
