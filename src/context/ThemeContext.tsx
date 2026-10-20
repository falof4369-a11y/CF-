import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'black' | 'white';

interface ThemeContextType {
  theme: ThemeMode;
  isWhite: boolean;
  isBlack: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'cf_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'white' || saved === 'black') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'black';
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // ignore
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'black' ? 'white' : 'black');
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'white') {
      root.classList.add('theme-white');
      root.classList.remove('theme-black');
      root.setAttribute('data-theme', 'white');
      root.style.colorScheme = 'light';
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#09090b';
    } else {
      root.classList.add('theme-black');
      root.classList.remove('theme-white');
      root.setAttribute('data-theme', 'black');
      root.style.colorScheme = 'dark';
      document.body.style.backgroundColor = '#000000';
      document.body.style.color = '#ffffff';
    }
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    isWhite: theme === 'white',
    isBlack: theme === 'black',
    toggleTheme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
