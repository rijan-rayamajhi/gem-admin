import { VehicleBrandRepository } from '../repositories/VehicleBrandRepository';
import { VehicleBrand, UpdateVehicleBrandRequest } from '../entities/VehicleBrand';

export class UpdateVehicleBrandUseCase {
  constructor(private vehicleBrandRepository: VehicleBrandRepository) {}

  async execute(request: UpdateVehicleBrandRequest): Promise<VehicleBrand> {
    if (!request.id) {
      throw new Error('Vehicle brand ID is required');
    }

    // Validate models if provided
    if (request.models && request.models.length === 0) {
      throw new Error('At least one model is required');
    }

    return await this.vehicleBrandRepository.updateVehicleBrand(request);
  }
}
