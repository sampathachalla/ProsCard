import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RotateCcw } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { PageHeader } from '@/components/uiComponents/PageHeader';
import { MediaImage } from '@/components/uiComponents/MediaImage';
import { getInitials } from '@/components/profileComponents/Utils/initials';
import { PROFILE_SECTIONS, ProfileSectionEditor, ProfileSectionGrid, type ProfileSectionId } from '@/components/profileComponents/Components/ProfileForm';
import { useProfileEditor } from '@/components/profileComponents/Hooks/useProfileEditor';

export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedSection, setSelectedSection] = useState<ProfileSectionId | null>(null);
  const { draft, isSaving, loading, offline, resetDraft, updateField, updateSocial, submit } = useProfileEditor();
  const section = PROFILE_SECTIONS.find(({ id }) => id === selectedSection);
  const goBackToCaller = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/homepage');
  };
  const closeEditor = () => { resetDraft(); setSelectedSection(null); };
  const handleSave = async () => {
    if (selectedSection && await submit(selectedSection, section?.heading)) setSelectedSection(null);
  };

  const headerActions = selectedSection ? (
    <View className="flex-row items-center" style={{ gap: 4 }}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Undo changes" onPress={resetDraft} disabled={isSaving} className="h-10 flex-row items-center rounded-xl px-2">
        <RotateCcw color={Colors.light.tint} size={16} /><Text className="ml-1 text-xs font-semibold text-primary dark:text-dark-primary">Undo</Text>
      </TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Save changes" onPress={handleSave} disabled={isSaving || offline} className={`h-10 min-w-16 items-center justify-center rounded-xl bg-primary px-3 dark:bg-dark-primary ${(isSaving || offline) ? 'opacity-50' : ''}`}>
        {isSaving ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text className="text-xs font-bold text-white">Save</Text>}
      </TouchableOpacity>
    </View>
  ) : undefined;

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <PageHeader title={section?.heading ?? 'Profile'} subtitle={selectedSection ? (offline ? 'Offline · reconnect to save' : 'Edit this section') : 'Choose a section to view or edit'} onBackPress={selectedSection ? closeEditor : goBackToCaller} right={headerActions} />
      {loading ? <View className="flex-1 items-center justify-center"><ActivityIndicator color={Colors.light.tint} /></View> : (
        <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 24) + 24 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {selectedSection ? <ProfileSectionEditor sectionId={selectedSection} draft={draft} onChange={updateField} onSocialChange={updateSocial} /> : <>
            <View className="mb-6 flex-row items-center rounded-3xl border border-black/5 bg-card p-4 dark:border-white/5 dark:bg-dark-card">
              <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-primary dark:bg-dark-primary">
                {draft.photoUrl ? (
                  <MediaImage sourceUrl={draft.photoUrl} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                ) : (
                  <Text className="text-xl font-bold text-white">{getInitials(draft.preferredName || draft.fullName)}</Text>
                )}
              </View>
              <View className="ml-4 min-w-0 flex-1">
                <Text className="text-xl font-bold text-textPrimary dark:text-dark-textPrimary" numberOfLines={2}>
                  {draft.preferredName || draft.fullName || 'Your name'}
                </Text>
              </View>
            </View>
            <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-textMuted dark:text-dark-textMuted">Profile details</Text>
            <ProfileSectionGrid profile={draft} onSelect={setSelectedSection} />
          </>}
        </ScrollView>
      )}
    </View>
  );
}
