import { VehicleVerificationRepository } from '../repositories/VehicleVerificationRepository';
import { VehicleVerification, VehicleVerificationStatus } from '../entities/VehicleVerification';

export class GetVehicleVerificationsByStatusUseCase {
  constructor(private vehicleVerificationRepository: VehicleVerificationRepository) {}

  async execute(status: VehicleVerificationStatus): Promise<VehicleVerification[]> {
    return this.vehicleVerificationRepository.getVehicleVerificationsByStatus(status);
  }
}
