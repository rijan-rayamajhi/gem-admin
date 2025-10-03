import { VehicleBrandRepository } from '../repositories/VehicleBrandRepository';
import { VehicleBrand } from '../entities/VehicleBrand';

export class GetAllVehicleBrandsUseCase {
  constructor(private vehicleBrandRepository: VehicleBrandRepository) {}

  async execute(): Promise<VehicleBrand[]> {
    return await this.vehicleBrandRepository.getAllVehicleBrands();
  }
}
