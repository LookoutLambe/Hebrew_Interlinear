import React, { createContext, useContext } from 'react';
import { useAppContext } from './AppContext';

export interface Theme {
  bg: string;
  surface: string;
  text: string;
  textSecondary: string;
  accent: string;
  accentLight: string;
  border: string;
  hebrew: string;
  gloss: string;
  translit: string;
  verseNum: string;
  headerBg: string;
  headerText: string;
  cardBg: string;
}

const lightTheme: Theme = {
  bg: '#faf8f5',
  surface: '#ffffff',
  text: '#1a1a2e',
  textSecondary: '#666',
  accent: '#b8860b',
  accentLight: '#f5ecd7',
  border: '#e0d8cc',
  hebrew: '#1a1a2e',
  gloss: '#333',
  translit: '#555',
  verseNum: '#b8860b',
  headerBg: '#f5ecd7',
  headerText: '#1a1a2e',
  cardBg: '#fff',
};

const darkTheme: Theme = {
  bg: '#1a1a2e',
  surface: '#24243e',
  text: '#e8e0d4',
  textSecondary: '#999',
  accent: '#d4a843',
  accentLight: '#2a2a40',
  border: '#3a3a50',
  hebrew: '#e8e0d4',
  gloss: '#c0b8a8',
  translit: '#999',
  verseNum: '#d4a843',
  headerBg: '#24243e',
  headerText: '#e8e0d4',
  cardBg: '#24243e',
};

const ThemeContext = createContext<Theme>(lightTheme);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { darkMode } = useAppContext();
  const theme = darkMode ? darkTheme : lightTheme;
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
