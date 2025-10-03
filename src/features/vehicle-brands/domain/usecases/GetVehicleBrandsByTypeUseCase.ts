import { VehicleBrandRepository } from '../repositories/VehicleBrandRepository';
import { VehicleBrand } from '../entities/VehicleBrand';

export class GetVehicleBrandsByTypeUseCase {
  constructor(private vehicleBrandRepository: VehicleBrandRepository) {}

  async execute(vehicleType: string): Promise<VehicleBrand[]> {
    if (!vehicleType) {
      throw new Error('Vehicle type is required');
    }

    return await this.vehicleBrandRepository.getVehicleBrandsByType(vehicleType);
  }
}
