import { VehicleBrandRepository } from '../repositories/VehicleBrandRepository';

export class DeleteVehicleBrandUseCase {
  constructor(private vehicleBrandRepository: VehicleBrandRepository) {}

  async execute(id: string): Promise<void> {
    if (!id) {
      throw new Error('Vehicle brand ID is required');
    }

    return await this.vehicleBrandRepository.deleteVehicleBrand(id);
  }
}
