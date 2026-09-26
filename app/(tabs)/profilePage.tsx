// app/(tabs)/profilePage.tsx
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '../../context/ThemeContext';
import { Bell, CreditCard, Focus, HelpCircle, Info, Moon, Sparkles, User } from 'lucide-react-native';
import { SettingsRow } from '../../components/profileComponents/Components/SettingsRow';
import { useProfile } from '../../components/profileComponents/Hooks/useProfile';
import { useProfileSnapshot } from '../../components/profileComponents/Hooks/useProfileSnapshot';
import { useNotificationPreference } from '../../components/profileComponents/Hooks/useNotificationPreference';
import { ProfileDetails } from '../../components/profileComponents/Components/ProfileDetails';
import { PageHeader } from '@/components/uiComponents/PageHeader';
import { useFloatingTools } from '@/components/toolsButton';
import { QuickToolsSection } from '../../components/profileComponents/Components/QuickToolsSection';
import { useEditorPreferences } from '../../components/profileComponents/Hooks/useEditorPreferences';

const SUPPORT_EMAIL = 'support@proscard.app';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, toggleTheme } = useThemeContext();
  const { logout } = useProfile();
  const { profile } = useProfileSnapshot();
  const {
    enabled: toolsEnabled,
    enabledTools,
    hydrated: toolsHydrated,
    setEnabled: setToolsEnabled,
    toggleTool,
  } = useFloatingTools();
  const {
    enabled: notificationsEnabled,
    hydrated: notificationsHydrated,
    setEnabled: setNotificationsEnabled,
  } = useNotificationPreference();
  const {
    glassmorphicEditorEnabled,
    hydrated: editorPreferencesHydrated,
    sectionHighlightEnabled,
    setGlassmorphicEditorEnabled,
    setSectionHighlightEnabled,
  } = useEditorPreferences();

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };

  const handleHelpAndSupport = async () => {
    const mailUrl = `mailto:${SUPPORT_EMAIL}?subject=ProsCard%20Support`;
    const canOpen = await Linking.canOpenURL(mailUrl);
    if (canOpen) {
      Linking.openURL(mailUrl);
      return;
    }
    Alert.alert(
      'Help & support',
      `No email app is set up on this device. Reach us at ${SUPPORT_EMAIL}.`,
    );
  };

  const handleAbout = () => {
    const version = Constants.expoConfig?.version ?? '1.0.0';
    Alert.alert('ProsCard', `Version ${version}`);
  };

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <PageHeader title="Profile" subtitle="Your info, contact, and app preferences" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 24) + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
      <SettingsRow icon={User} label="Account" onPress={() => router.push('/(tabs)/accountPage')} />

      <ProfileDetails profile={profile} />

      <Text className="text-textMuted dark:text-dark-textMuted text-xs font-semibold uppercase mb-2 mt-4 ml-1">
        Account
      </Text>
      <SettingsRow icon={CreditCard} label="Manage my cards" onPress={() => router.push('/(tabs)/cardsPage')} />
      <SettingsRow
        icon={Bell}
        label="Notifications"
        right={
          <Switch
            disabled={!notificationsHydrated}
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: Colors.light.border, true: Colors.light.tint }}
            thumbColor={Colors.palette.primaryWhite}
          />
        }
      />

      <Text className="text-textMuted dark:text-dark-textMuted text-xs font-semibold uppercase mb-2 mt-4 ml-1">
        Preferences
      </Text>
      <SettingsRow
        icon={Moon}
        label="Dark mode"
        right={
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: Colors.light.border, true: Colors.light.tint }}
            thumbColor={Colors.palette.primaryWhite}
          />
        }
      />
      <SettingsRow
        icon={Focus}
        label="Editing section highlight"
        right={
          <Switch
            disabled={!editorPreferencesHydrated}
            value={sectionHighlightEnabled}
            onValueChange={setSectionHighlightEnabled}
            trackColor={{ false: Colors.light.border, true: Colors.light.tint }}
            thumbColor={Colors.palette.primaryWhite}
          />
        }
      />
      <SettingsRow
        icon={Sparkles}
        label="Glassmorphic editor chrome"
        right={
          <Switch
            disabled={!editorPreferencesHydrated}
            value={glassmorphicEditorEnabled}
            onValueChange={setGlassmorphicEditorEnabled}
            trackColor={{ false: Colors.light.border, true: Colors.light.tint }}
            thumbColor={Colors.palette.primaryWhite}
          />
        }
      />
      <QuickToolsSection
        toolsEnabled={toolsEnabled}
        setToolsEnabled={setToolsEnabled}
        enabledTools={enabledTools}
        hydrated={toolsHydrated}
        toggleTool={toggleTool}
      />

      <Text className="text-textMuted dark:text-dark-textMuted text-xs font-semibold uppercase mb-2 mt-4 ml-1">
        Support
      </Text>
      <SettingsRow icon={HelpCircle} label="Help & support" onPress={handleHelpAndSupport} />
      <SettingsRow icon={Info} label="About ProsCard" onPress={handleAbout} />

      <TouchableOpacity
        className="mt-6 rounded-2xl py-4 items-center border border-error dark:border-dark-error"
        onPress={handleLogout}
      >
        <Text className="text-error dark:text-dark-error font-semibold">Log out</Text>
      </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
