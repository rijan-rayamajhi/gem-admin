"use client";

import React, { useState, useEffect, createContext, useContext } from 'react';
import { appSettingsService, AppSettings } from './appSettingsService';

interface AppSettingsContextType {
  settings: AppSettings | null;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      let appSettings = await appSettingsService.getAppSettings();
      
      // Remove auto-initialization of default settings
      // if (!appSettings) {
      //   await appSettingsService.initializeDefaultSettings();
      //   appSettings = await appSettingsService.getAppSettings();
      // }
      setSettings(appSettings);
    } catch (err) {
      console.error('Error loading app settings:', err);
      setError('Failed to load app settings');
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    await loadSettings();
  };

  const updateSettings = async (updates: Partial<AppSettings>) => {
    try {
      setError(null);
      await appSettingsService.updateAppSettings(updates);
      await loadSettings(); // Reload to get the updated settings
    } catch (err) {
      console.error('Error updating app settings:', err);
      setError('Failed to update app settings');
      throw err;
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const value: AppSettingsContextType = {
    settings,
    loading,
    error,
    refreshSettings,
    updateSettings,
  };

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
}

// Convenience hook for getting specific settings
export function useAppSetting<K extends keyof AppSettings>(key: K): AppSettings[K] | null {
  const { settings } = useAppSettings();
  return settings ? settings[key] : null;
}

// Hook for getting app name
export function useAppName(): string {
  const { settings } = useAppSettings();
  return settings?.appName || 'GEM Admin';
}

// Hook for getting app version
export function useAppVersion(): string {
  const { settings } = useAppSettings();
  return settings?.appVersion || '1.0.0';
}

// Hook for getting terms and conditions
export function useTermsAndConditions(): string {
  const { settings } = useAppSettings();
  return settings?.termsAndConditions || '';
}

// Hook for getting privacy policy
export function usePrivacyPolicy(): string {
  const { settings } = useAppSettings();
  return settings?.privacyPolicy || '';
}

// Hook for getting contact information
export function useContactInfo() {
  const { settings } = useAppSettings();
  return {
    email: settings?.contactEmail || '',
    phone: settings?.contactPhone || '',
    website: settings?.website || '',
  };
}

// Hook for getting social media links
export function useSocialMedia() {
  const { settings } = useAppSettings();
  return settings?.socialMedia || {};
}

// Hook for getting feature flags
export function useFeatureFlags() {
  const { settings } = useAppSettings();
  return settings?.features || {
    enableNotifications: true,
    enableLocationServices: true,
    enableAnalytics: true,
    maintenanceMode: false,
  };
}

// Hook for getting app limits
export function useAppLimits() {
  const { settings } = useAppSettings();
  return settings?.limits || {
    maxFileSize: 10,
    maxEventImages: 10,
    maxEventDuration: 30,
    maxAttendeesPerEvent: 1000,
  };
}

// Hook for getting branding settings
export function useBranding() {
  const { settings } = useAppSettings();
  return settings?.branding || {
    primaryColor: '#3B82F6',
    secondaryColor: '#1F2937',
    logoUrl: '',
    faviconUrl: '',
  };
} 