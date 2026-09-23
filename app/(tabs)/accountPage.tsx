// app/(tabs)/accountPage.tsx
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { PageHeader } from '@/components/uiComponents/PageHeader';
import { ProfileHero } from '@/components/profileComponents/Components/ProfileHero';
import { ProfileForm } from '@/components/profileComponents/Components/ProfileForm';
import { useProfileEditor } from '@/components/profileComponents/Hooks/useProfileEditor';

export default function AccountScreen() {
  const router = useRouter();
  const { draft, isSaving, updateField, updateSocial, submit } = useProfileEditor();

  const goToProfile = () => {
    router.replace('/(tabs)/profilePage');
  };

  const handleSave = async () => {
    const saved = await submit();
    if (saved) goToProfile();
  };

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <PageHeader title="Profile" subtitle="Update your details below" onBackPress={goToProfile} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHero profile={draft} isEditing onEditPress={() => {}} />
        <ProfileForm draft={draft} onChange={updateField} onSocialChange={updateSocial} />

        <View className="flex-row mt-2 mb-8" style={{ gap: 12 }}>
          <TouchableOpacity
            className="flex-1 rounded-2xl py-4 items-center border border-textMuted dark:border-dark-textMuted"
            onPress={goToProfile}
            disabled={isSaving}
          >
            <Text className="text-textPrimary dark:text-dark-textPrimary font-semibold">
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 rounded-2xl py-4 items-center bg-primary dark:bg-dark-primary"
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-semibold">Save changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
