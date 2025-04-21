'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { theme } from '@/styles/theme';

type ThemeMode = 'light' | 'dark';
type ThemeContextType = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  theme: typeof theme;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Default to system preference, falling back to light
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    // Check for saved preference
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode | null;
    
    // If no saved preference, check system preference
    if (!savedMode) {
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? 'dark' 
        : 'light';
      setMode(systemPreference);
      return;
    }
    
    setMode(savedMode);
  }, []);

  useEffect(() => {
    // Update document attributes when theme changes
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  const toggleMode = () => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ mode, setMode, toggleMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
