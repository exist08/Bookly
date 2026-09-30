import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';
import { Colors, type Palette } from '../constants/Colors';
import { storage } from '../store/storage';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextType {
  theme: Palette;
  isDarkMode: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  navigationTheme: Theme;
}

const THEME_KEY = 'app_theme_mode';

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useThemeColors = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeColors must be used inside ThemeProvider');
  }
  return ctx;
};

const readMode = (): ThemeMode => {
  const saved = storage.getString(THEME_KEY);
  return saved === 'light' || saved === 'dark' ? saved : 'system';
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(readMode);

  const setMode = useCallback((next: ThemeMode) => {
    storage.set(THEME_KEY, next);
    setModeState(next);
  }, []);

  const isDarkMode = mode === 'system' ? system === 'dark' : mode === 'dark';

  const value = useMemo<ThemeContextType>(() => {
    const theme = isDarkMode ? Colors.dark : Colors.light;
    const base = isDarkMode ? DarkTheme : DefaultTheme;
    return {
      theme,
      isDarkMode,
      mode,
      setMode,
      toggleTheme: () => setMode(isDarkMode ? 'light' : 'dark'),
      navigationTheme: {
        ...base,
        colors: {
          ...base.colors,
          primary: theme.accent,
          background: theme.background,
          card: theme.background,
          text: theme.text,
          border: theme.border,
          notification: theme.accent,
        },
      },
    };
  }, [isDarkMode, mode, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
