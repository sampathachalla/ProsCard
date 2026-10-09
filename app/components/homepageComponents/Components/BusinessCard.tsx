import { useState } from 'react';
import { View, useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import type { BusinessCard as BusinessCardData } from '@/components/cardsComponents/types/card.types';
import type { Profile } from '@/components/profileComponents/types/profile.types';
import { CardTapGesture } from '@/components/gestures';
import { CardDetailView } from '@/components/cardsComponents/Components/CardDetailView';

type Props = {
  card: BusinessCardData;
  height: number;
  onDoubleTap?: () => void;
  onSwipeDown?: () => void;
  profile: Profile;
  width: number;
};

/** The carousel renders the real full card and scales it into the preview frame. */
export function BusinessCard({ card, height, onDoubleTap, onSwipeDown, profile, width }: Props) {
  const { width: viewportWidth } = useWindowDimensions();
  const [contentHeight, setContentHeight] = useState(0);
  const sourceWidth = Math.max(viewportWidth, 320);
  const widthScale = width / sourceWidth;
  const scale = contentHeight > 0
    ? Math.min(widthScale, height / contentHeight)
    : widthScale;
  const scaledWidth = sourceWidth * scale;

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
          left: (width - scaledWidth) / 2,
          width: sourceWidth,
          transform: [{ scale }],
          transformOrigin: 'top left',
        }}
      >
        <View onLayout={measureContent} style={{ width: sourceWidth }}>
          <CardDetailView card={card} fullBleed profile={profile} />
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
