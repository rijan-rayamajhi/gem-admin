import { VehicleBrandRepository } from '../repositories/VehicleBrandRepository';
import { VehicleBrand, CreateVehicleBrandRequest } from '../entities/VehicleBrand';

export class CreateVehicleBrandUseCase {
  constructor(private vehicleBrandRepository: VehicleBrandRepository) {}

  async execute(request: CreateVehicleBrandRequest): Promise<VehicleBrand> {
    // Validate required fields
    if (!request.name || !request.logoUrl || !request.vehicleType) {
      throw new Error('Name, logo URL, and vehicle type are required');
    }

    if (!request.models || request.models.length === 0) {
      throw new Error('At least one model is required');
    }

    return await this.vehicleBrandRepository.createVehicleBrand(request);
  }
}
