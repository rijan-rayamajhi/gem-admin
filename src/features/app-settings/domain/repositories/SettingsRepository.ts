import { AppSettings } from '../entities/AppSettings';

export interface SettingsRepository {
  getSettings(): Promise<AppSettings>;
  saveSettings(settings: AppSettings): Promise<void>;
  resetSettings(): Promise<void>;
}
