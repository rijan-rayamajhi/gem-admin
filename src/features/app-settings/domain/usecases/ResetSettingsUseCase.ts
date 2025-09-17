import { SettingsRepository } from '../repositories/SettingsRepository';
import { AppSettings, defaultAppSettings } from '../entities/AppSettings';

export class ResetSettingsUseCase {
  constructor(private settingsRepository: SettingsRepository) {}

  async execute(): Promise<AppSettings> {
    try {
      await this.settingsRepository.resetSettings();
      return defaultAppSettings;
    } catch (error: unknown) {
      console.error('ResetSettingsUseCase error:', error);
      throw new Error('Failed to reset settings. Please try again.');
    }
  }
}
