import { MonetizationRepository } from '../repositories/MonetizationRepository';
import { CashoutRequest, CashoutStatus } from '../entities/CashoutRequest';

export class GetCashoutRequestsUseCase {
  constructor(private monetizationRepository: MonetizationRepository) {}

  async execute(status?: CashoutStatus): Promise<CashoutRequest[]> {
    if (status) {
      return await this.monetizationRepository.getCashoutRequestsByStatus(status);
    }
    return await this.monetizationRepository.getAllCashoutRequests();
  }
}
