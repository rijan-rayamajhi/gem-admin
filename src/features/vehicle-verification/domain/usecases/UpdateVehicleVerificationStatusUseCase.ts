import { VehicleVerificationRepository } from '../repositories/VehicleVerificationRepository';
import { VehicleVerificationStatus } from '../entities/VehicleVerification';

export class UpdateVehicleVerificationStatusUseCase {
  constructor(private vehicleVerificationRepository: VehicleVerificationRepository) {}

  async execute(id: string, status: VehicleVerificationStatus): Promise<void> {
    return this.vehicleVerificationRepository.updateVehicleVerificationStatus(id, status);
  }
}
