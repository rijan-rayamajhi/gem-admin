import { SettingsRepository } from '../repositories/SettingsRepository';
import { AppSettings, defaultAppSettings } from '../entities/AppSettings';

export class GetSettingsUseCase {
  constructor(private settingsRepository: SettingsRepository) {}

  async execute(): Promise<AppSettings> {
    try {
      return await this.settingsRepository.getSettings();
    } catch (error: unknown) {
      console.error('GetSettingsUseCase error:', error);
      // Return default settings if there's an error loading
      return defaultAppSettings;
    }
  }
}
