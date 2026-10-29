import { useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RotateCcw } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { PageHeader } from '@/common/ui/PageHeader';
import { AccountDetailsForm } from './Components/AccountDetailsForm';
import { useProfileEditor } from '@/pages/profile/Hooks/useProfileEditor';

function profilesEqual(a: ReturnType<typeof useProfileEditor>['draft'], b: ReturnType<typeof useProfileEditor>['profile']) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { draft, isSaving, loading, offline, profile, resetDraft, updateField, updateSocial, submit } =
    useProfileEditor();
  const hasChanges = useMemo(() => !profilesEqual(draft, profile), [draft, profile]);

  const goBackToCaller = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/profile');
  };

  const handleBack = () => {
    if (!hasChanges) {
      goBackToCaller();
      return;
    }
    Alert.alert('Discard changes?', 'Unsaved account edits will be lost.', [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: goBackToCaller },
    ]);
  };

  const handleSave = async () => {
    if (!hasChanges || offline) return;
    await submit('all', 'Account');
  };

  const headerActions = (
    <View className="flex-row items-center" style={{ gap: 4 }}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Undo changes"
        onPress={resetDraft}
        disabled={isSaving || !hasChanges}
        className={`h-10 flex-row items-center rounded-xl px-2 ${!hasChanges ? 'opacity-40' : ''}`}
      >
        <RotateCcw color={Colors.light.tint} size={16} />
        <Text className="ml-1 text-xs font-semibold text-primary dark:text-dark-primary">Undo</Text>
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Save account"
        onPress={() => void handleSave()}
        disabled={isSaving || offline || !hasChanges}
        className={`h-10 min-w-16 items-center justify-center rounded-xl bg-primary px-3 dark:bg-dark-primary ${
          isSaving || offline || !hasChanges ? 'opacity-50' : ''
        }`}
      >
        {isSaving ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text className="text-xs font-bold text-white">Save</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <PageHeader
        title="Account"
        subtitle={offline ? 'Offline · reconnect to save' : 'Your profile details for new cards'}
        onBackPress={handleBack}
        right={headerActions}
      />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={Colors.light.tint} />
        </View>
      ) : (
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 4 : 0}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: Math.max(insets.bottom, 24) + 32,
            }}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <AccountDetailsForm draft={draft} onChange={updateField} onSocialChange={updateSocial} />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}
