import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  CreditCard,
  List,
  ScanLine,
  Send,
  Settings,
  type LucideIcon,
} from 'lucide-react-native';

import { Text } from '@/common/ui/Text';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';

type HomeTabBarProps = {
  state: {
    index: number;
    routes: { key: string; name: string }[];
  };
  navigateToTab: (routeKey: string) => void;
};

type TabItem = {
  routeName: string;
  label: string;
  Icon: LucideIcon;
  center?: boolean;
};

const TAB_ITEMS: TabItem[] = [
  { routeName: 'homepage', label: 'Cards', Icon: CreditCard },
  { routeName: 'contactsPage', label: 'Contacts', Icon: List },
  { routeName: 'sharePage', label: 'Share', Icon: Send, center: true },
  { routeName: 'scannerPage', label: 'Scan', Icon: ScanLine },
  { routeName: 'profilePage', label: 'Settings', Icon: Settings },
];

const VISIBLE_ROUTE_NAMES = new Set(TAB_ITEMS.map((item) => item.routeName));

export function HomeTabBar({ state, navigateToTab }: HomeTabBarProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';
  const palette = isDark ? Colors.dark : Colors.light;
  const activeRouteName = state.routes[state.index]?.name;

  const barBackground = isDark ? 'rgba(17, 24, 39, 0.94)' : 'rgba(255, 255, 255, 0.94)';
  const barBorder = isDark ? 'rgba(51, 65, 85, 0.65)' : 'rgba(148, 163, 184, 0.4)';
  const inactiveLabel = palette.tabIconDefault;
  const activeLabel = isDark ? Colors.palette.primaryWhite : Colors.palette.darkBody;
  const inactiveIcon = palette.tabIconDefault;
  const activeIcon = isDark ? Colors.palette.primaryWhite : Colors.palette.darkBody;

  const centerButtonBg = isDark ? Colors.palette.primaryWhite : Colors.palette.darkBody;
  const centerIconColor = isDark ? Colors.palette.darkBody : Colors.palette.primaryWhite;

  const onPressTab = (routeName: string, isFocused: boolean) => {
    if (!VISIBLE_ROUTE_NAMES.has(routeName)) return;
    const route = state.routes.find((r) => r.name === routeName);
    if (!route) return;
    if (isFocused) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    navigateToTab(route.key);
  };

  return (
    <View
      pointerEvents="box-none"
      style={{
        backgroundColor: 'transparent',
        paddingHorizontal: 12,
        paddingTop: 6,
        paddingBottom: Math.max(insets.bottom, 8),
      }}
    >
      <View
        className="flex-row items-end justify-between px-1 pt-2.5"
        style={{
          backgroundColor: barBackground,
          borderColor: barBorder,
          borderWidth: 1,
          borderRadius: 28,
          minHeight: 64,
          paddingBottom: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isDark ? 0.28 : 0.06,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        {TAB_ITEMS.map((item) => {
          const isFocused = activeRouteName === item.routeName;
          const color = isFocused ? activeIcon : inactiveIcon;
          const labelColor = isFocused ? activeLabel : inactiveLabel;
          const Icon = item.Icon;

          if (item.center) {
            return (
              <Pressable
                key={item.routeName}
                accessibilityRole="button"
                accessibilityState={{ selected: isFocused }}
                accessibilityLabel={item.label}
                onPress={() => onPressTab(item.routeName, isFocused)}
                className="flex-1 items-center"
                style={{ marginTop: -22 }}
              >
                <View
                  className="items-center justify-center rounded-2xl"
                  style={{
                    width: 56,
                    height: 56,
                    backgroundColor: centerButtonBg,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDark ? 0.22 : 0.1,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <Icon color={centerIconColor} size={26} strokeWidth={2.2} />
                </View>
                <Text
                  variant="none"
                  className="mt-1.5 text-[11px]"
                  style={{
                    color: isFocused ? activeLabel : inactiveLabel,
                    fontWeight: isFocused ? '700' : '500',
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={item.routeName}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={item.label}
              onPress={() => onPressTab(item.routeName, isFocused)}
              className="flex-1 items-center justify-end pb-0.5"
            >
              <Icon color={color} size={24} strokeWidth={isFocused ? 2.4 : 2} />
              <Text
                variant="none"
                className="mt-1 text-[11px]"
                style={{
                  color: labelColor,
                  fontWeight: isFocused ? '700' : '500',
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
