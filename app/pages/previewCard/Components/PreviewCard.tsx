import { View } from 'react-native';
import type { BusinessCard as BusinessCardData } from '@/pages/cards/types/card.types';
import type { Profile } from '@/pages/profile/types/profile.types';
import { CardTapGesture } from '@/common/gestures';
import { HomePreviewCardFace } from './HomePreviewCardFace';

type Props = {
  card: BusinessCardData;
  height: number;
  /** Opens the public card page in the browser. */
  onDoubleTap?: () => void;
  /** Opens the in-app full card screen. */
  onSingleTap?: () => void;
  onSwipeDown?: () => void;
  onMenuPress?: () => void;
  profile: Profile;
  width: number;
};

/** Home carousel preview: compact card face with cover, profile, logo, and QR. */
export function PreviewCard({
  card,
  height,
  onDoubleTap,
  onSingleTap,
  onSwipeDown,
  onMenuPress,
  profile,
  width,
}: Props) {
  const preview = (
    <HomePreviewCardFace
      card={card}
      height={height}
      profile={profile}
      width={width}
      onMenuPress={onMenuPress}
    />
  );

  if (!onDoubleTap && !onSingleTap) {
    return preview;
  }

  return (
    <CardTapGesture
      onDoubleTap={onDoubleTap ?? (() => {})}
      onSingleTap={onSingleTap}
      onSwipeDown={onSwipeDown}
    >
      <View style={{ width, height }}>{preview}</View>
    </CardTapGesture>
  );
}
