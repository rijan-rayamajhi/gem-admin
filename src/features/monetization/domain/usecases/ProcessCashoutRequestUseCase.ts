import { MonetizationRepository } from '../repositories/MonetizationRepository';
import { CashoutRequestUpdate, CashoutStatus } from '../entities/CashoutRequest';

export class ProcessCashoutRequestUseCase {
  constructor(private monetizationRepository: MonetizationRepository) {}

  async execute(
    requestId: string, 
    status: CashoutStatus, 
    processedBy: string, 
    rejectionReason?: string,
    notes?: string
  ): Promise<void> {
    const request = await this.monetizationRepository.getCashoutRequest(requestId);
    
    if (!request) {
      throw new Error('Cashout request not found');
    }

    if (request.status !== CashoutStatus.PENDING) {
      throw new Error('Cashout request has already been processed');
    }

    const update: CashoutRequestUpdate = {
      status,
      processedBy,
      rejectionReason,
      notes,
    };

    await this.monetizationRepository.updateCashoutRequest(requestId, update);

    // If approved, update user's earnings
    if (status === CashoutStatus.APPROVED) {
      const earnings = await this.monetizationRepository.getEarnings(request.userId);
      if (earnings) {
        await this.monetizationRepository.updateEarnings({
          userId: request.userId,
          amount: -request.amount, // Subtract from available balance
        });
      }
    }
  }
}
