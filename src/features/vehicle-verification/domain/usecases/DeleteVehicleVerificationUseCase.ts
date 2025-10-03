import { VehicleVerificationRepository } from '../repositories/VehicleVerificationRepository';

export class DeleteVehicleVerificationUseCase {
  constructor(private vehicleVerificationRepository: VehicleVerificationRepository) {}

  async execute(id: string): Promise<void> {
    return this.vehicleVerificationRepository.deleteVehicleVerification(id);
  }
}
