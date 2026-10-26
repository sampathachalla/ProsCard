import { useState } from 'react';
import { View, useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import type { BusinessCard as BusinessCardData } from '@/pages/cards/types/card.types';
import type { Profile } from '@/pages/profile/types/profile.types';
import { CardTapGesture } from '@/common/gestures';
import { CardDetailView } from '@/pages/fullCard/Components/CardDetailView';

type Props = {
  card: BusinessCardData;
  height: number;
  onDoubleTap?: () => void;
  onSwipeDown?: () => void;
  profile: Profile;
  width: number;
};

/** The carousel renders the real full card and scales it into the preview frame. */
export function PreviewCard({ card, height, onDoubleTap, onSwipeDown, profile, width }: Props) {
  const { width: viewportWidth } = useWindowDimensions();
  const [contentHeight, setContentHeight] = useState(0);
  const sourceWidth = Math.max(viewportWidth, 320);
  const widthScale = width / sourceWidth;
  const heightScale = contentHeight > 0 ? height / contentHeight : widthScale;

  const measureContent = (event: LayoutChangeEvent) => {
    const nextHeight = event.nativeEvent.layout.height;
    if (nextHeight > 0 && Math.abs(nextHeight - contentHeight) > 0.5) {
      setContentHeight(nextHeight);
    }
  };

  const preview = (
    <View
      accessibilityLabel={`${card.name}, ${card.title} digital business card`}
      className="overflow-hidden rounded-[28px] border"
      style={{
        width,
        height,
        backgroundColor: card.sectionThemes.identity.backgroundColor,
        borderColor: card.sectionThemes.identity.accentColor,
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: sourceWidth,
          transform: [{ scaleX: widthScale }, { scaleY: heightScale }],
          transformOrigin: 'top left',
        }}
      >
        <View onLayout={measureContent} style={{ width: sourceWidth }}>
          <CardDetailView card={card} fullBleed interactiveActions={false} profile={profile} />
        </View>
      </View>
    </View>
  );

  if (!onDoubleTap) return preview;
  return (
    <CardTapGesture onDoubleTap={onDoubleTap} onSwipeDown={onSwipeDown}>
      {preview}
    </CardTapGesture>
  );
}
