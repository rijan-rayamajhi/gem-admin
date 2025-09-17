import { MonetizationRepository } from '../repositories/MonetizationRepository';
import { Earnings } from '../entities/Earnings';

export class GetAllEarningsUseCase {
  constructor(private monetizationRepository: MonetizationRepository) {}

  async execute(): Promise<Earnings[]> {
    return await this.monetizationRepository.getAllEarnings();
  }
}
