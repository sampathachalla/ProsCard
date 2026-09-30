// app/(tabs)/profilePage.tsx
import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Linking, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '../../context/ThemeContext';
import { Bell, CreditCard, Focus, HelpCircle, Info, Layers3, LogOut, Moon, Sparkles, Trash2, User } from 'lucide-react-native';
import { useCardViewPreference } from '@/components/homepageComponents/Hooks/useCardViewPreference';
import { SettingsRow } from '../../components/profileComponents/Components/SettingsRow';
import { useProfile } from '../../components/profileComponents/Hooks/useProfile';
import { useProfileSnapshot } from '../../components/profileComponents/Hooks/useProfileSnapshot';
import { useNotificationPreference } from '../../components/profileComponents/Hooks/useNotificationPreference';
import { ProfileDetails } from '../../components/profileComponents/Components/ProfileDetails';
import { PageHeader } from '@/components/uiComponents/PageHeader';
import { useFloatingTools } from '@/components/toolsButton';
import { QuickToolsSection } from '../../components/profileComponents/Components/QuickToolsSection';
import { useEditorPreferences } from '../../components/profileComponents/Hooks/useEditorPreferences';
import { confirmAction, showMessage } from '@/components/uiComponents/confirmAction';

const SUPPORT_EMAIL = 'support@proscard.app';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, toggleTheme } = useThemeContext();
  const { logout, deleteAccount } = useProfile();
  const [accountAction, setAccountAction] = useState<'logout' | 'delete' | null>(null);
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
  const {
    hydrated: cardViewHydrated,
    setViewMode,
    viewMode,
  } = useCardViewPreference();

  const handleLogout = async () => {
    if (accountAction) return;
    const confirmed = await confirmAction({ title: 'Log out', message: 'Are you sure you want to log out?', confirmLabel: 'Log out' });
    if (!confirmed) return;
    setAccountAction('logout');
    try {
      await logout();
    } finally {
      setAccountAction(null);
    }
  };

  const handleDeleteAccount = async () => {
    if (accountAction) return;
    const confirmed = await confirmAction({
      title: 'Delete account?',
      message: 'This permanently deletes your account, profile, cards, contacts and uploaded images. This cannot be undone.',
      confirmLabel: 'Delete account',
      destructive: true,
    });
    if (!confirmed) return;
    setAccountAction('delete');
    try {
      await deleteAccount();
    } catch (error) {
      showMessage('Delete failed', error instanceof Error ? error.message : 'Could not delete your account. Please try again.');
    } finally {
      setAccountAction(null);
    }
  };

  const handleHelpAndSupport = async () => {
    const mailUrl = `mailto:${SUPPORT_EMAIL}?subject=ProsCard%20Support`;
    const canOpen = await Linking.canOpenURL(mailUrl);
    if (canOpen) {
      Linking.openURL(mailUrl);
      return;
    }
    showMessage('Help & support', `No email app is set up on this device. Reach us at ${SUPPORT_EMAIL}.`);
  };

  const handleAbout = () => {
    const version = Constants.expoConfig?.version ?? '1.0.0';
    showMessage('ProsCard', `Version ${version}`);
  };

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <PageHeader
        className="px-0"
        title="Profile"
        subtitle="Your info, contact, and app preferences"
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 24) + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
      <View className="mb-4 flex-row gap-3 px-4">
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Log out"
          disabled={accountAction !== null}
          onPress={handleLogout}
          className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-card dark:bg-dark-card py-3.5 ${accountAction ? 'opacity-60' : ''}`}
        >
          {accountAction === 'logout' ? <ActivityIndicator color={Colors.light.tint} /> : <LogOut color={Colors.light.tint} size={18} strokeWidth={2.2} />}
          <Text className="font-semibold text-textPrimary dark:text-dark-textPrimary">Log out</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Delete account"
          disabled={accountAction !== null}
          onPress={handleDeleteAccount}
          className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-error dark:border-dark-error py-3.5 ${accountAction ? 'opacity-60' : ''}`}
        >
          {accountAction === 'delete' ? <ActivityIndicator color="#ef4444" /> : <Trash2 color="#ef4444" size={18} strokeWidth={2.2} />}
          <Text className="font-semibold text-error dark:text-dark-error">Delete account</Text>
        </TouchableOpacity>
      </View>

      <SettingsRow icon={User} label="Account" onPress={() => router.push('/(tabs)/accountPage')} />

      <ProfileDetails profile={profile} />

      <Text className="text-textMuted dark:text-dark-textMuted text-xs font-semibold uppercase mb-2 mt-4 px-4">
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

      <Text className="text-textMuted dark:text-dark-textMuted text-xs font-semibold uppercase mb-2 mt-4 px-4">
        Preferences
      </Text>
      <SettingsRow
        icon={Layers3}
        label="Wallet stack on homepage"
        right={
          <Switch
            disabled={!cardViewHydrated}
            value={viewMode === 'stack'}
            onValueChange={(enabled) => setViewMode(enabled ? 'stack' : 'carousel')}
            trackColor={{ false: Colors.light.border, true: Colors.light.tint }}
            thumbColor={Colors.palette.primaryWhite}
          />
        }
      />
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

      <Text className="text-textMuted dark:text-dark-textMuted text-xs font-semibold uppercase mb-2 mt-4 px-4">
        Support
      </Text>
      <SettingsRow icon={HelpCircle} label="Help & support" onPress={handleHelpAndSupport} />
      <SettingsRow icon={Info} label="About ProsCard" onPress={handleAbout} />
      </ScrollView>
    </View>
  );
}
