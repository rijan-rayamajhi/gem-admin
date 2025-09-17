import { MonetizationRepository } from '../repositories/MonetizationRepository';
import { MonetizationSettings } from '../entities/MonetizationSettings';

export class GetMonetizationSettingsUseCase {
  constructor(private monetizationRepository: MonetizationRepository) {}

  async execute(): Promise<MonetizationSettings | null> {
    return await this.monetizationRepository.getMonetizationSettings();
  }
}
