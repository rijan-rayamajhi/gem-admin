'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppSettings } from '../../domain/entities/AppSettings';
import { GetSettingsUseCase } from '../../domain/usecases/GetSettingsUseCase';
import { SaveSettingsUseCase } from '../../domain/usecases/SaveSettingsUseCase';
import { ResetSettingsUseCase } from '../../domain/usecases/ResetSettingsUseCase';
import { FirebaseSettingsRepository } from '../../data/repositories/FirebaseSettingsRepository';

interface SettingsContextType {
  settings: AppSettings;
  loading: boolean;
  saving: boolean;
  error: string | null;
  loadSettings: () => Promise<void>;
  saveSettings: (settings: AppSettings) => Promise<void>;
  resetSettings: () => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: React.ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>({
    appName: '',
    appTagline: '',
    termsAndConditionLink: '',
    email: '',
    whatsappNumber: '',
    phoneNumber: '',
    appVersion: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize use cases
  const settingsRepository = React.useMemo(() => new FirebaseSettingsRepository(), []);
  const getSettingsUseCase = React.useMemo(() => new GetSettingsUseCase(settingsRepository), [settingsRepository]);
  const saveSettingsUseCase = React.useMemo(() => new SaveSettingsUseCase(settingsRepository), [settingsRepository]);
  const resetSettingsUseCase = React.useMemo(() => new ResetSettingsUseCase(settingsRepository), [settingsRepository]);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loadedSettings = await getSettingsUseCase.execute();
      setSettings(loadedSettings);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load settings';
      setError(errorMessage);
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  }, [getSettingsUseCase]);

  const saveSettings = async (newSettings: AppSettings) => {
    setSaving(true);
    setError(null);
    try {
      await saveSettingsUseCase.execute(newSettings);
      setSettings(newSettings);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save settings';
      setError(errorMessage);
      console.error('Failed to save settings:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = async () => {
    setSaving(true);
    setError(null);
    try {
      const defaultSettings = await resetSettingsUseCase.execute();
      setSettings(defaultSettings);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset settings';
      setError(errorMessage);
      console.error('Failed to reset settings:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...updates
    }));
  };

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const value: SettingsContextType = {
    settings,
    loading,
    saving,
    error,
    loadSettings,
    saveSettings,
    resetSettings,
    updateSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
