// app/(tabs)/profilePage.tsx
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '../../context/ThemeContext';
import { Bell, CreditCard, HelpCircle, Info, Moon, User, Wrench } from 'lucide-react-native';
import { SettingsRow } from '../../components/profileComponents/Components/SettingsRow';
import { useProfile } from '../../components/profileComponents/Hooks/useProfile';
import { getInitials } from '../../components/profileComponents/Utils/initials';
import { PageHeader } from '@/components/uiComponents/PageHeader';
import { FLOATING_TOOL_DEFINITIONS, useFloatingTools } from '@/components/toolsButton';

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, toggleTheme } = useThemeContext();
  const { user, logout } = useProfile();
  const {
    enabled: toolsEnabled,
    enabledTools,
    hydrated: toolsHydrated,
    setEnabled: setToolsEnabled,
    toggleTool,
  } = useFloatingTools();

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <PageHeader title="Profile" subtitle="Account and app preferences" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
      <View className="items-center mb-8">
        <View className="w-20 h-20 rounded-full bg-primary dark:bg-dark-primary items-center justify-center mb-3">
          <Text className="text-white text-2xl font-bold">{getInitials(user?.username)}</Text>
        </View>
        <Text className="text-textPrimary dark:text-dark-textPrimary text-xl font-extrabold">
          {user?.username ?? 'Guest'}
        </Text>
        <Text className="text-textMuted dark:text-dark-textMuted text-sm mt-1">
          {user ? `@${user.username}` : 'Not signed in'}
        </Text>
      </View>

      <Text className="text-textMuted dark:text-dark-textMuted text-xs font-semibold uppercase mb-2 ml-1">
        Account
      </Text>
      <SettingsRow icon={User} label="Edit profile" onPress={() => Alert.alert('Edit profile', 'Coming soon.')} />
      <SettingsRow icon={CreditCard} label="Manage my cards" onPress={() => router.push('/(tabs)/cardsPage')} />
      <SettingsRow icon={Bell} label="Notifications" onPress={() => Alert.alert('Notifications', 'Coming soon.')} />

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
        icon={Wrench}
        label="Floating card tools"
        right={
          <Switch
            disabled={!toolsHydrated}
            value={toolsEnabled}
            onValueChange={setToolsEnabled}
            trackColor={{ false: Colors.light.border, true: Colors.light.tint }}
            thumbColor={Colors.palette.primaryWhite}
          />
        }
      />
      {toolsEnabled ? (
        <>
          <Text className="mb-2 ml-1 mt-3 text-xs font-semibold uppercase text-textMuted dark:text-dark-textMuted">
            Quick tools
          </Text>
          {FLOATING_TOOL_DEFINITIONS.map((tool) => (
            <SettingsRow
              key={tool.id}
              icon={tool.icon}
              label={tool.label}
              right={
                <Switch
                  disabled={!toolsHydrated}
                  value={enabledTools.includes(tool.id)}
                  onValueChange={() => toggleTool(tool.id)}
                  trackColor={{ false: Colors.light.border, true: Colors.light.tint }}
                  thumbColor={Colors.palette.primaryWhite}
                />
              }
            />
          ))}
        </>
      ) : null}

      <Text className="text-textMuted dark:text-dark-textMuted text-xs font-semibold uppercase mb-2 mt-4 ml-1">
        Support
      </Text>
      <SettingsRow icon={HelpCircle} label="Help & support" onPress={() => Alert.alert('Help & support', 'Coming soon.')} />
      <SettingsRow icon={Info} label="About ProsCard" onPress={() => Alert.alert('ProsCard', 'Version 1.0.0')} />

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
