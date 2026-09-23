// components/profileComponents/Components/ProfileHero.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { PencilLine } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import type { Profile } from '../types/profile.types';
import { getInitials } from '../Utils/initials';

export function ProfileHero({
  profile,
  isEditing,
  onEditPress,
}: {
  profile: Profile;
  isEditing: boolean;
  onEditPress: () => void;
}) {
  return (
    <View className="items-center mb-6">
      <View className="h-32 w-full overflow-hidden rounded-3xl bg-slate-200 dark:bg-slate-800">
        {profile.coverPhotoUrl ? <Image source={{ uri: profile.coverPhotoUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" /> : null}
      </View>
      <View className="-mt-12 w-24 h-24 rounded-full border-4 border-background dark:border-dark-background bg-primary dark:bg-dark-primary items-center justify-center mb-3 overflow-hidden">
        {profile.photoUrl ? (
          <Image
            source={{ uri: profile.photoUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        ) : (
          <Text className="text-white text-2xl font-bold">{getInitials(profile.preferredName || profile.fullName)}</Text>
        )}
      </View>

      <Text className="text-textPrimary dark:text-dark-textPrimary text-xl font-extrabold text-center">
        {profile.preferredName || profile.fullName || 'Your name'}
      </Text>

      {profile.accreditations ? <Text className="mt-1 text-sm font-semibold text-textMuted dark:text-dark-textMuted">{profile.accreditations}</Text> : null}

      {(profile.title || profile.organization) && (
        <Text className="text-textMuted dark:text-dark-textMuted text-sm mt-1 text-center">
          {[profile.title, profile.department, profile.organization].filter(Boolean).join(' · ')}
        </Text>
      )}

      {profile.companyLogoUrl ? (
        <Image
          source={{ uri: profile.companyLogoUrl }}
          style={{ width: 28, height: 28, borderRadius: 6, marginTop: 8 }}
          contentFit="contain"
        />
      ) : null}

      {profile.tagline ? (
        <Text className="text-textMuted dark:text-dark-textMuted text-sm mt-2 text-center italic">
          {profile.tagline}
        </Text>
      ) : null}

      {!isEditing && (
        <TouchableOpacity
          className="flex-row items-center bg-card dark:bg-dark-card rounded-full px-4 py-2 mt-4"
          onPress={onEditPress}
        >
          <PencilLine color={Colors.light.tint} size={16} strokeWidth={2.2} />
          <Text className="text-textPrimary dark:text-dark-textPrimary font-medium ml-2">
            Edit profile
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
