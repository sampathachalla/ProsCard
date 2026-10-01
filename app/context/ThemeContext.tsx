// context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import { useColorScheme } from 'nativewind';

type Theme = 'light' | 'dark';

interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: 'light',
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Start from the phone's light/dark setting instead of correcting it after the first render.
  const [theme, setTheme] = useState<Theme>(() => (Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'));
  const { setColorScheme } = useColorScheme();

  // Keep NativeWind's `dark:` classes in step with the theme.
  useEffect(() => {
    setColorScheme(theme);
  }, [theme, setColorScheme]);

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);