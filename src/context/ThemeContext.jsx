import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Immediate synchronous check to eliminate initial flash or switch lag
const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem('theme-mode');
    if (saved) return saved === 'dark';
    
    const settingsStr = localStorage.getItem('titanvitals_settings');
    if (settingsStr) {
      const parsed = JSON.parse(settingsStr);
      if (parsed?.appearance?.themeMode) {
        return parsed.appearance.themeMode !== 'light';
      }
    }
    return true; // default dark
  } catch (e) {
    return true;
  }
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(getInitialTheme);

  // Synchronously update DOM attribute and storage immediately
  const applyTheme = useCallback((dark) => {
    const mode = dark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', mode);
    try {
      localStorage.setItem('theme-mode', mode);
      const settingsStr = localStorage.getItem('titanvitals_settings');
      if (settingsStr) {
        const parsed = JSON.parse(settingsStr);
        parsed.appearance = { ...parsed.appearance, themeMode: mode };
        localStorage.setItem('titanvitals_settings', JSON.stringify(parsed));
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    applyTheme(isDark);
  }, [isDark, applyTheme]);

  // Instant zero-lag toggle
  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      const nextMode = next ? 'dark' : 'light';
      // Apply to HTML element instantly without waiting for next React render cycle
      document.documentElement.setAttribute('data-theme', nextMode);
      try {
        localStorage.setItem('theme-mode', nextMode);
      } catch (e) {}
      return next;
    });
  }, []);

  const value = useMemo(() => ({
    isDark,
    toggleTheme,
    colors: isDark ? {
      bg: {
        primary: '#0a0a1a',
        secondary: '#1a1a2e',
        tertiary: '#16213e',
        hover: '#0f3460'
      },
      text: {
        primary: '#ffffff',
        secondary: '#8088a0',
        tertiary: '#5a6c7d'
      },
      accent: {
        cyan: '#00d4ff',
        purple: '#7c3aed',
        pink: '#ec4899',
        red: '#ef4444',
        green: '#10b981',
        orange: '#f59e0b',
        blue: '#3b82f6'
      },
      border: '#2a2a3e',
      shadow: 'rgba(0, 212, 255, 0.1)'
    } : {
      bg: {
        primary: '#f8fafc',
        secondary: '#ffffff',
        tertiary: '#f1f5f9',
        hover: '#e2e8f0'
      },
      text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#94a3b8'
      },
      accent: {
        cyan: '#0284c7',
        purple: '#6d28d9',
        pink: '#db2777',
        red: '#dc2626',
        green: '#059669',
        orange: '#d97706',
        blue: '#2563eb'
      },
      border: '#e2e8f0',
      shadow: 'rgba(0, 0, 0, 0.06)'
    }
  }), [isDark, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
