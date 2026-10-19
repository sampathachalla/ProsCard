// context/ThemeContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Appearance, type ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind';

export type Theme = 'light' | 'dark';
/** `system` follows the phone appearance; light/dark are explicit app overrides. */
export type ThemePreference = Theme | 'system';

const THEME_PREFERENCE_KEY = 'vcpros:theme-preference';

interface ThemeContextProps {
  /** Resolved UI theme used by logos, status bar, and NativeWind `dark:` classes. */
  theme: Theme;
  /** Stored preference — system until the user toggles Dark mode. */
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  /** Flips between light and dark (leaves system mode). */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: 'light',
  preference: 'system',
  setPreference: () => {},
  toggleTheme: () => {},
});

function schemeToTheme(scheme: ColorSchemeName): Theme {
  return scheme === 'dark' ? 'dark' : 'light';
}

function resolveTheme(preference: ThemePreference, system: Theme): Theme {
  return preference === 'system' ? system : preference;
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [systemTheme, setSystemTheme] = useState<Theme>(() =>
    schemeToTheme(Appearance.getColorScheme()),
  );
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const { setColorScheme } = useColorScheme();

  const theme = useMemo(
    () => resolveTheme(preference, systemTheme),
    [preference, systemTheme],
  );

  // Restore saved preference after install / relaunch (defaults to phone system).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
        if (cancelled) return;
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setPreferenceState(stored);
        }
      } catch {
        // Keep default `system` if storage is unavailable.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Follow phone light/dark changes (needed when preference is `system`).
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(schemeToTheme(colorScheme));
    });
    return () => subscription.remove();
  }, []);

  // Keep NativeWind `dark:` classes in step with the resolved theme.
  useEffect(() => {
    setColorScheme(theme);
  }, [theme, setColorScheme]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(THEME_PREFERENCE_KEY, next).catch(() => {});
  }, []);

  const toggleTheme = useCallback(() => {
    setPreference(theme === 'dark' ? 'light' : 'dark');
  }, [setPreference, theme]);

  const value = useMemo(
    () => ({ theme, preference, setPreference, toggleTheme }),
    [theme, preference, setPreference, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
