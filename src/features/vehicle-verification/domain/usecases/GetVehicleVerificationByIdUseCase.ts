import { VehicleVerificationRepository } from '../repositories/VehicleVerificationRepository';
import { VehicleVerification } from '../entities/VehicleVerification';

export class GetVehicleVerificationByIdUseCase {
  constructor(private vehicleVerificationRepository: VehicleVerificationRepository) {}

  async execute(id: string): Promise<VehicleVerification | null> {
    return this.vehicleVerificationRepository.getVehicleVerificationById(id);
  }
}
