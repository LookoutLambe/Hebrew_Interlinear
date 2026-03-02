import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type DisplayMode = 'interlinear' | 'hebrew' | 'dual';

interface AppState {
  currentChapter: string;
  displayMode: DisplayMode;
  darkMode: boolean;
  fontSize: number;
  showTransliteration: boolean;
}

interface AppContextType extends AppState {
  setCurrentChapter: (id: string) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  setDarkMode: (dark: boolean) => void;
  setFontSize: (size: number) => void;
  setShowTransliteration: (show: boolean) => void;
  isLoading: boolean;
}

const defaultState: AppState = {
  currentChapter: 'ch1',
  displayMode: 'interlinear',
  darkMode: false,
  fontSize: 16,
  showTransliteration: true,
};

const AppContext = createContext<AppContextType>({
  ...defaultState,
  setCurrentChapter: () => {},
  setDisplayMode: () => {},
  setDarkMode: () => {},
  setFontSize: () => {},
  setShowTransliteration: () => {},
  isLoading: true,
});

const STORAGE_KEY = '@hebrewbom_settings';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try {
          const saved = JSON.parse(raw);
          setState(prev => ({ ...prev, ...saved }));
        } catch {}
      }
      setIsLoading(false);
    });
  }, []);

  const persist = useCallback((update: Partial<AppState>) => {
    setState(prev => {
      const next = { ...prev, ...update };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const ctx: AppContextType = {
    ...state,
    setCurrentChapter: (id) => persist({ currentChapter: id }),
    setDisplayMode: (mode) => persist({ displayMode: mode }),
    setDarkMode: (dark) => persist({ darkMode: dark }),
    setFontSize: (size) => persist({ fontSize: size }),
    setShowTransliteration: (show) => persist({ showTransliteration: show }),
    isLoading,
  };

  return <AppContext.Provider value={ctx}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}
