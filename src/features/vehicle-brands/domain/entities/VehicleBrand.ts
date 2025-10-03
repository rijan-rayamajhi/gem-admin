export interface VehicleBrand {
  id: string;
  name: string;
  logoUrl: string;
  vehicleType: 'two_wheeler' | 'four_wheeler' | 'two_wheeler_electric' | 'four_wheeler_electric';
  models: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateVehicleBrandRequest {
  name: string;
  logoUrl: string;
  vehicleType: 'two_wheeler' | 'four_wheeler' | 'two_wheeler_electric' | 'four_wheeler_electric';
  models: string[];
}

export interface UpdateVehicleBrandRequest {
  id: string;
  name?: string;
  logoUrl?: string;
  vehicleType?: 'two_wheeler' | 'four_wheeler' | 'two_wheeler_electric' | 'four_wheeler_electric';
  models?: string[];
}
