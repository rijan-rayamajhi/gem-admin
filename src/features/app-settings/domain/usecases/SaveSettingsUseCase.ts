import { SettingsRepository } from '../repositories/SettingsRepository';
import { AppSettings } from '../entities/AppSettings';

export class SaveSettingsUseCase {
  constructor(private settingsRepository: SettingsRepository) {}

  async execute(settings: AppSettings): Promise<void> {
    try {
      // Validate required fields
      if (!settings.appName.trim()) {
        throw new Error('App name is required');
      }

      // Validate email format if provided
      if (settings.email && settings.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(settings.email)) {
          throw new Error('Invalid email format');
        }
      }

      // Validate URL format if provided
      if (settings.termsAndConditionLink && settings.termsAndConditionLink.trim()) {
        try {
          new URL(settings.termsAndConditionLink);
        } catch {
          throw new Error('Invalid URL format for terms and conditions link');
        }
      }

      await this.settingsRepository.saveSettings(settings);
    } catch (error: unknown) {
      console.error('SaveSettingsUseCase error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to save settings. Please try again.');
    }
  }
}
