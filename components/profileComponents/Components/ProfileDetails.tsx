// components/profileComponents/Components/ProfileDetails.tsx
import { View, Text, TouchableOpacity, Linking } from 'react-native';
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
      className="flex-row items-center bg-card dark:bg-dark-card rounded-2xl px-4 py-3 mb-3"
      onPress={onPress}
      disabled={!onPress}
    >
      <Icon color={Colors.light.tint} size={18} strokeWidth={2.2} />
      <Text className="text-textPrimary dark:text-dark-textPrimary ml-3 flex-1">{value}</Text>
    </TouchableOpacity>
  );
}

export function ProfileDetails({ profile }: { profile: Profile }) {
  return (
    <View>
      {profile.email ? (
        <DetailRow icon={Mail} value={profile.email} onPress={() => Linking.openURL(`mailto:${profile.email}`)} />
      ) : null}
      {profile.phone ? (
        <DetailRow icon={Phone} value={profile.phone} onPress={() => Linking.openURL(`tel:${profile.phone}`)} />
      ) : null}
      {profile.website ? (
        <DetailRow icon={Globe} value={profile.website} onPress={() => Linking.openURL(profile.website)} />
      ) : null}
      {profile.businessAddress ? (
        <DetailRow icon={MapPin} value={profile.businessAddress} />
      ) : null}

      {profile.shortBio ? (
        <View className="bg-card dark:bg-dark-card rounded-2xl px-4 py-4 mb-3">
          <Text className="text-textMuted dark:text-dark-textMuted text-xs font-semibold uppercase mb-2">
            About
          </Text>
          <Text className="text-textPrimary dark:text-dark-textPrimary leading-5">
            {profile.shortBio}
          </Text>
        </View>
      ) : null}

      {Object.entries(profile.social).filter(([, value]) => Boolean(value)).length > 0 ? (
        <View className="bg-card dark:bg-dark-card rounded-2xl px-4 py-4 mb-3">
          <Text className="text-textMuted dark:text-dark-textMuted text-xs font-semibold uppercase mb-2">Links</Text>
          {Object.entries(profile.social).filter(([, value]) => Boolean(value)).map(([label, value]) => (
            <TouchableOpacity key={label} className="py-2" onPress={() => Linking.openURL(value as string)}>
              <Text className="font-semibold capitalize text-primary dark:text-dark-primary">{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}
