import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const DEFAULT_SETTINGS = {
  appearance: {
    themeMode: 'dark', // 'dark', 'light', 'cyber', 'oled'
    accentColor: '#00d4ff', // Hex code
    accentName: 'Cyan Glow',
    fontSize: 'normal', // 'compact', 'normal', 'large'
    reducedMotion: false,
    enableGlassBlur: true,
  },
  vitals: {
    bpUnit: 'mmHg', // 'mmHg', 'kPa'
    tempUnit: 'C', // 'C', 'F'
    weightUnit: 'kg', // 'kg', 'lbs'
    heightUnit: 'cm', // 'cm', 'in'
    hrAlertMin: 55,
    hrAlertMax: 105,
    autoSyncInterval: '30s', // '10s', '30s', '60s', 'manual'
  },
  ai: {
    defaultLanguage: 'English', // 'English', 'Tamil', 'Hindi', 'Spanish'
    clinicalDepth: 'standard', // 'concise', 'standard', 'detailed'
    voiceAutoSpeak: false,
    autoScanReports: true,
    aiModelTier: 'Gemini 2.5 Flash Ultra',
  },
  notifications: {
    emergencyAlerts: true,
    criticalVitalSound: true,
    localEpidemicAlerts: true,
    medicationReminders: true,
    dailyCheckupPrompt: true,
  },
  profile: {
    phone: '+1 (555) 234-8901',
    age: 32,
    emergencyContactName: 'Dr. Evelyn Mercer',
    emergencyContactPhone: '+1 (555) 987-6543',
    hospitalPreference: 'Titan Memorial Hospital (Zone 4)',
    allergies: 'Penicillin, Peanuts (Mild)',
  }
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('titanvitals_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          appearance: { ...DEFAULT_SETTINGS.appearance, ...(parsed?.appearance || {}) },
          vitals: { ...DEFAULT_SETTINGS.vitals, ...(parsed?.vitals || {}) },
          ai: { ...DEFAULT_SETTINGS.ai, ...(parsed?.ai || {}) },
          notifications: { ...DEFAULT_SETTINGS.notifications, ...(parsed?.notifications || {}) },
          profile: { ...DEFAULT_SETTINGS.profile, ...(parsed?.profile || {}) },
        };
      }
    } catch (e) {
      console.warn('Failed to load saved settings, using defaults');
    }
    return DEFAULT_SETTINGS;
  });

  // Apply Appearance Settings to DOM in Real Time
  useEffect(() => {
    try {
      const root = document.documentElement;
      const appearance = settings?.appearance || DEFAULT_SETTINGS.appearance;
      const themeMode = appearance.themeMode || 'dark';
      const accentColor = appearance.accentColor || '#00d4ff';
      const fontSize = appearance.fontSize || 'normal';
      const reducedMotion = appearance.reducedMotion || false;

      // Apply theme mode
      if (themeMode === 'light') {
        root.setAttribute('data-theme', 'light');
      } else if (themeMode === 'cyber') {
        root.setAttribute('data-theme', 'cyber');
      } else if (themeMode === 'oled') {
        root.setAttribute('data-theme', 'oled');
      } else {
        root.setAttribute('data-theme', 'dark');
      }

      // Apply dynamic accent color
      root.style.setProperty('--accent-cyan', accentColor);
      root.style.setProperty('--shadow-color', `${accentColor}26`);

      // Apply dynamic font size
      if (fontSize === 'compact') {
        root.style.setProperty('--base-font-scale', '0.92');
        root.style.fontSize = '14.5px';
      } else if (fontSize === 'large') {
        root.style.setProperty('--base-font-scale', '1.08');
        root.style.fontSize = '17.5px';
      } else {
        root.style.setProperty('--base-font-scale', '1');
        root.style.fontSize = '16px';
      }

      // Reduced motion
      if (reducedMotion) {
        root.classList.add('reduce-motion');
      } else {
        root.classList.remove('reduce-motion');
      }

      // Save to localStorage
      localStorage.setItem('titanvitals_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Real-time settings DOM apply error:', e);
    }
  }, [settings]);

  // Update a single setting category/key in real time
  const updateSetting = (category, key, value) => {
    setSettings((prev) => {
      const currentCategory = prev?.[category] || DEFAULT_SETTINGS[category] || {};
      const updated = {
        ...DEFAULT_SETTINGS,
        ...prev,
        [category]: {
          ...currentCategory,
          [key]: value
        }
      };
      localStorage.setItem('titanvitals_settings', JSON.stringify(updated));
      return updated;
    });
  };

  // Update multiple fields in a category
  const updateCategory = (category, newValues) => {
    setSettings((prev) => {
      const currentCategory = prev?.[category] || DEFAULT_SETTINGS[category] || {};
      const updated = {
        ...DEFAULT_SETTINGS,
        ...prev,
        [category]: {
          ...currentCategory,
          ...newValues
        }
      };
      localStorage.setItem('titanvitals_settings', JSON.stringify(updated));
      return updated;
    });
  };

  // Reset to factory defaults
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem('titanvitals_settings', JSON.stringify(DEFAULT_SETTINGS));
    toast.success('All settings reset to defaults');
  };

  // Clear local health telemetry cache
  const clearHealthCache = () => {
    try {
      localStorage.removeItem('titan_bot_position');
      localStorage.removeItem('titan_cached_vitals');
      localStorage.removeItem('titan_chat_history');
      toast.success('Local health telemetry cache cleared');
    } catch (e) {
      toast.error('Failed to clear cache');
    }
  };

  // Export full health profile as JSON
  const exportHealthData = (user) => {
    try {
      const exportObject = {
        exportDate: new Date().toISOString(),
        userProfile: user,
        settings: settings,
        system: {
          app: 'TitanVitals nxt Gen AI',
          version: '2.5.0-PRO',
          database: 'Encrypted Cloud Storage'
        }
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `titanvitals_health_profile_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      toast.success('Health Profile exported successfully');
    } catch (e) {
      toast.error('Failed to export health profile');
    }
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSetting,
      updateCategory,
      resetSettings,
      clearHealthCache,
      exportHealthData
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
