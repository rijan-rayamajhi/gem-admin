import { VehicleVerificationRepository } from '../repositories/VehicleVerificationRepository';
import { VehicleVerification } from '../entities/VehicleVerification';

export class GetAllVehicleVerificationsUseCase {
  constructor(private vehicleVerificationRepository: VehicleVerificationRepository) {}

  async execute(): Promise<VehicleVerification[]> {
    return this.vehicleVerificationRepository.getAllVehicleVerifications();
  }
}
