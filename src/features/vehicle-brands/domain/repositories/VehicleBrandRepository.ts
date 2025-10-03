import { VehicleBrand, CreateVehicleBrandRequest, UpdateVehicleBrandRequest } from '../entities/VehicleBrand';

export interface VehicleBrandRepository {
  getAllVehicleBrands(): Promise<VehicleBrand[]>;
  getVehicleBrandById(id: string): Promise<VehicleBrand | null>;
  createVehicleBrand(request: CreateVehicleBrandRequest): Promise<VehicleBrand>;
  updateVehicleBrand(request: UpdateVehicleBrandRequest): Promise<VehicleBrand>;
  deleteVehicleBrand(id: string): Promise<void>;
  getVehicleBrandsByType(vehicleType: string): Promise<VehicleBrand[]>;
}
