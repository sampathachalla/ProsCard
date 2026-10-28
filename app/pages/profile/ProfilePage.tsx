// pages/profile/ProfilePage.tsx
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Linking, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { Colors } from '@/constants/Colors';
import {
  ChevronRight,
  CreditCard,
  HelpCircle,
  Info,
  LogOut,
  Moon,
  Palette,
  Trash2,
  User,
} from 'lucide-react-native';
import { SettingsRow } from './Components/SettingsRow';
import { useProfile } from './Hooks/useProfile';
import { useEditorPreferenceStore } from './Stores/editorPreferenceStore';
import { refreshAppliedCardThemes } from '@/pages/cards/Services/cardsService';
import { PageHeader } from '@/common/ui/PageHeader';
import { useThemeContext } from '@/context/ThemeContext';
import { confirmAction, showMessage } from '@/common/ui/confirmAction';

const SUPPORT_EMAIL = 'support@proscard.app';
const switchTrack = { false: Colors.light.border, true: Colors.light.tint } as const;

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, setPreference } = useThemeContext();
  const { logout, deleteAccount } = useProfile();
  const logoThemesEnabled = useEditorPreferenceStore((s) => s.logoThemesEnabled ?? true);
  const setLogoThemesEnabled = useEditorPreferenceStore((s) => s.setLogoThemesEnabled);
  const [accountAction, setAccountAction] = useState<'logout' | 'delete' | null>(null);

  useEffect(() => {
    if (!useEditorPreferenceStore.persist.hasHydrated()) {
      void useEditorPreferenceStore.persist.rehydrate();
    }
  }, []);

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
    const mailUrl = `mailto:${SUPPORT_EMAIL}?subject=VC%20Pros%20Support`;
    const canOpen = await Linking.canOpenURL(mailUrl);
    if (canOpen) {
      Linking.openURL(mailUrl).catch(() => showMessage('Help & support', `Reach us at ${SUPPORT_EMAIL}.`));
      return;
    }
    showMessage('Help & support', `No email app is set up on this device. Reach us at ${SUPPORT_EMAIL}.`);
  };

  const handleAbout = () => {
    const version = Constants.expoConfig?.version ?? '1.0.0';
    showMessage('VC Pros', `Version ${version}`);
  };

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <PageHeader
        className="px-0"
        title="Profile"
        subtitle="Your info, contact, and app preferences"
        onBackPress={() => router.replace('/(tabs)/homepage')}
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 24) + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
      <Text className="text-textMuted dark:text-dark-textMuted text-xs font-semibold uppercase mb-2 mt-2 px-4">
        Account
      </Text>
      <View className="mb-3 gap-2 px-4">
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Account"
          onPress={() => router.push('/account')}
          className="w-full flex-row items-center rounded-2xl bg-card p-3.5 dark:bg-dark-card active:opacity-75"
        >
          <View className="mr-2.5 h-9 w-9 items-center justify-center rounded-full bg-background dark:bg-dark-background">
            <User color={Colors.light.tint} size={18} strokeWidth={2.2} />
          </View>
          <Text className="flex-1 text-sm font-medium text-textPrimary dark:text-dark-textPrimary">Account</Text>
          <ChevronRight color={Colors.light.mutedText} size={16} strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Manage my cards"
          onPress={() => router.push('/manage-cards')}
          className="w-full flex-row items-center rounded-2xl bg-card p-3.5 dark:bg-dark-card active:opacity-75"
        >
          <View className="mr-2.5 h-9 w-9 items-center justify-center rounded-full bg-background dark:bg-dark-background">
            <CreditCard color={Colors.light.tint} size={18} strokeWidth={2.2} />
          </View>
          <Text className="flex-1 text-sm font-medium text-textPrimary dark:text-dark-textPrimary">Manage cards</Text>
          <ChevronRight color={Colors.light.mutedText} size={16} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <Text className="text-textMuted dark:text-dark-textMuted text-xs font-semibold uppercase mb-2 mt-4 px-4">
        Preferences
      </Text>
      <SettingsRow
        icon={Moon}
        label="Dark mode"
        right={
          <Switch
            accessibilityLabel="Dark mode"
            value={theme === 'dark'}
            onValueChange={(enabled) => setPreference(enabled ? 'dark' : 'light')}
            trackColor={switchTrack}
            thumbColor={Colors.palette.primaryWhite}
          />
        }
      />
      <SettingsRow
        icon={Palette}
        label="Logo-adapted card themes"
        right={
          <Switch
            accessibilityLabel="Logo-adapted card themes"
            value={logoThemesEnabled}
            onValueChange={(enabled) => {
              setLogoThemesEnabled(enabled);
              // Saved cards (and their share links) switch immediately, not on the next edit.
              void refreshAppliedCardThemes().catch(() =>
                showMessage('Card themes', 'Could not update your cards. Check your connection and try again.'));
            }}
            trackColor={switchTrack}
            thumbColor={Colors.palette.primaryWhite}
          />
        }
      />
      <Text className="mb-2 px-4 text-xs leading-4 text-textMuted dark:text-dark-textMuted">
        When on, card colors follow your company logo after you upload it.
      </Text>

      <Text className="text-textMuted dark:text-dark-textMuted text-xs font-semibold uppercase mb-2 mt-4 px-4">
        Support
      </Text>
      <SettingsRow icon={HelpCircle} label="Help & support" onPress={handleHelpAndSupport} />
      <SettingsRow icon={Info} label="About VC Pros" onPress={handleAbout} />

      <View className="mb-2 mt-6 gap-2 px-4">
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Log out"
          disabled={accountAction !== null}
          onPress={handleLogout}
          className={`w-full flex-row items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-card py-3.5 dark:border-slate-700 dark:bg-dark-card ${accountAction ? 'opacity-60' : ''}`}
        >
          {accountAction === 'logout' ? <ActivityIndicator color={Colors.light.tint} /> : <LogOut color={Colors.light.tint} size={18} strokeWidth={2.2} />}
          <Text className="font-semibold text-textPrimary dark:text-dark-textPrimary">Log out</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Delete account"
          disabled={accountAction !== null}
          onPress={handleDeleteAccount}
          className={`w-full flex-row items-center justify-center gap-2 rounded-2xl border border-error py-3.5 dark:border-dark-error ${accountAction ? 'opacity-60' : ''}`}
        >
          {accountAction === 'delete' ? <ActivityIndicator color="#ef4444" /> : <Trash2 color="#ef4444" size={18} strokeWidth={2.2} />}
          <Text className="font-semibold text-error dark:text-dark-error">Delete account</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </View>
  );
}
