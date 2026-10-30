import { useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Text } from '@/common/ui/Text';
import { AccountDetailsForm } from './Components/AccountDetailsForm';
import { AccountPageHeader } from './Components/AccountPageHeader';
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

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <AccountPageHeader
        isSaving={isSaving}
        canUndo={hasChanges}
        canSave={hasChanges && !offline}
        offline={offline}
        onBack={handleBack}
        onUndo={resetDraft}
        onSave={() => void handleSave()}
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
            {!offline ? (
              <Text variant="muted" className="mb-3 text-center text-sm">
                Your profile details for new cards
              </Text>
            ) : null}
            <AccountDetailsForm draft={draft} onChange={updateField} onSocialChange={updateSocial} />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}
