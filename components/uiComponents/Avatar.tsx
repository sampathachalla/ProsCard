import { Image, View, type StyleProp, type ViewStyle } from 'react-native';
import { getInitials } from '@/utils/initials';
import { Text } from './Text';

type AvatarProps = {
  name: string;
  initials?: string;
  imageUri?: string;
  size?: number;
  backgroundColor?: string;
  foregroundColor?: string;
  bordered?: boolean;
  borderColor?: string;
  showStatus?: boolean;
  statusColor?: string;
  style?: StyleProp<ViewStyle>;
};

export function Avatar({
  name,
  initials,
  imageUri,
  size = 48,
  backgroundColor = '#2563eb',
  foregroundColor = '#ffffff',
  bordered = false,
  borderColor = 'rgba(255,255,255,0.2)',
  showStatus = false,
  statusColor = '#22c55e',
  style,
}: AvatarProps) {
  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: bordered ? Math.max(1.5, size * 0.04) : 0,
    borderColor: bordered ? borderColor : 'transparent',
  };

  const statusSize = Math.max(10, Math.round(size * 0.26));

  return (
    <View style={[{ width: size, height: size, position: 'relative' }, style]}>
      {imageUri ? (
        <Image
          accessibilityLabel={`${name} profile image`}
          source={{ uri: imageUri }}
          style={containerStyle}
        />
      ) : (
        <View
          accessibilityLabel={`${name} avatar`}
          className="items-center justify-center shadow-sm"
          style={[containerStyle, { backgroundColor }]}
        >
          <Text
            numberOfLines={1}
            style={{
              color: foregroundColor,
              fontSize: Math.max(13, Math.round(size * 0.38)),
              fontWeight: '700',
              lineHeight: Math.round(size * 0.44),
            }}
          >
            {initials ?? getInitials(name)}
          </Text>
        </View>
      )}

      {showStatus && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: statusSize,
            height: statusSize,
            borderRadius: statusSize / 2,
            backgroundColor: statusColor,
            borderWidth: 2,
            borderColor: '#ffffff',
          }}
        />
      )}
    </View>
  );
}

