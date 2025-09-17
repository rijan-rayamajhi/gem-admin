import { MonetizationRepository } from '../repositories/MonetizationRepository';
import { MonetizationSettings, MonetizationSettingsUpdate } from '../entities/MonetizationSettings';

export class UpdateMonetizationSettingsUseCase {
  constructor(private monetizationRepository: MonetizationRepository) {}

  async execute(update: MonetizationSettingsUpdate, updatedBy: string): Promise<void> {
    const existingSettings = await this.monetizationRepository.getMonetizationSettings();
    
    if (!existingSettings) {
      // Create default settings if none exist
      const defaultSettings: MonetizationSettings = {
        id: 'default',
        allowCashout: true,
        predefinedAmounts: [10, 25, 50, 100],
        bankBalance: 1000,
        conversionRate: 100, // 100 coins = $1
        cashoutParams: {
          minimumRides: 5,
          minimumDistance: 10,
          minimumReferrals: 2,
        },
        gstPercentage: 18,
        platformCharge: 2,
        otherCharge: 1,
        limitBasedCashout: true,
        timeLimit: 7, // 7 days
        maxLimitCashout: 15,
        minCashout: 1,
        lastUpdated: new Date(),
        updatedBy,
      };

      await this.monetizationRepository.createMonetizationSettings(defaultSettings);
    }

    await this.monetizationRepository.updateMonetizationSettings({
      ...update,
      lastUpdated: new Date(),
      updatedBy,
    });
  }
}
