// components/profileComponents/Components/ProfileDetails.tsx
import { View, Text, TouchableOpacity, Linking, Alert } from 'react-native';
import { Mail, Phone, Globe, MapPin, type LucideIcon } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import type { Profile } from '../types/profile.types';

function DetailRow({
  icon: Icon,
  value,
  onPress,
}: {
  icon: LucideIcon;
  value: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={value}
      className="flex-row items-center bg-card dark:bg-dark-card px-4 py-3 mb-3"
      onPress={onPress}
      disabled={!onPress}
    >
      <Icon color={Colors.light.tint} size={18} strokeWidth={2.2} />
      <Text className="text-textPrimary dark:text-dark-textPrimary ml-3 flex-1">{value}</Text>
    </TouchableOpacity>
  );
}

/** Opens a link, telling the user instead of failing silently when no app can handle it. */
function openLink(url: string) {
  Linking.openURL(url).catch(() => Alert.alert('Could not open', url));
}

/** Websites are often saved without a scheme ("example.com"), which openURL rejects. */
function websiteUrl(website: string) {
  return /^[a-z][a-z0-9+.-]*:/i.test(website) ? website : `https://${website}`;
}

export function ProfileDetails({ profile }: { profile: Profile }) {
  return (
    <View>
      {profile.email ? (
        <DetailRow icon={Mail} value={profile.email} onPress={() => openLink(`mailto:${profile.email}`)} />
      ) : null}
      {profile.phone ? (
        <DetailRow icon={Phone} value={profile.phone} onPress={() => openLink(`tel:${profile.phone.replace(/[^\d+]/g, '')}`)} />
      ) : null}
      {profile.website ? (
        <DetailRow icon={Globe} value={profile.website} onPress={() => openLink(websiteUrl(profile.website))} />
      ) : null}
      {profile.businessAddress ? (
        <DetailRow icon={MapPin} value={profile.businessAddress} />
      ) : null}

      {profile.shortBio ? (
        <View className="bg-card dark:bg-dark-card px-4 py-4 mb-3">
          <Text className="text-textMuted dark:text-dark-textMuted text-xs font-semibold uppercase mb-2">
            About
          </Text>
          <Text className="text-textPrimary dark:text-dark-textPrimary leading-5">
            {profile.shortBio}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
