import { VehicleBrandRepository } from '../repositories/VehicleBrandRepository';
import { VehicleBrand } from '../entities/VehicleBrand';

export class GetVehicleBrandByIdUseCase {
  constructor(private vehicleBrandRepository: VehicleBrandRepository) {}

  async execute(id: string): Promise<VehicleBrand | null> {
    return await this.vehicleBrandRepository.getVehicleBrandById(id);
  }
}
