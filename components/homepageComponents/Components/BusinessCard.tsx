import { View } from 'react-native';
import type { BusinessCard as BusinessCardData } from '@/components/cardsComponents/types/card.types';
import type { Profile } from '@/components/profileComponents/types/profile.types';
import { CardTapGesture } from '@/components/gestures';
import { CardSectionFace } from '@/components/cardsComponents/Components/CardSectionFace';

type Props = {
  card: BusinessCardData;
  height: number;
  onDoubleTap?: () => void;
  onSwipeDown?: () => void;
  profile: Profile;
  width: number;
};

export function BusinessCard({ card, height, onDoubleTap, onSwipeDown, profile, width }: Props) {
  const gap = 8;
  const sectionHeight = (height - gap) / 2;
  const identityTheme = card.sectionThemes.identity;
  const view = (
    <View accessibilityLabel={`${card.name}, ${card.title} digital business card`} className="overflow-hidden rounded-[28px] border" style={{ width, height, gap, backgroundColor: identityTheme.backgroundColor, borderColor: identityTheme.accentColor }}>
      <CardSectionFace card={card} height={sectionHeight} profile={profile} sectionId="identity" width={width} />
      <CardSectionFace card={card} height={sectionHeight} profile={profile} sectionId="professional" width={width} />
    </View>
  );
  if (!onDoubleTap) return view;
  return <CardTapGesture onDoubleTap={onDoubleTap} onSwipeDown={onSwipeDown}>{view}</CardTapGesture>;
}
