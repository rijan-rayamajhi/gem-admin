import { VehicleVerification, VehicleVerificationStatus } from '../entities/VehicleVerification';

export interface VehicleVerificationRepository {
  getAllVehicleVerifications(): Promise<VehicleVerification[]>;
  getVehicleVerificationsByStatus(status: VehicleVerificationStatus): Promise<VehicleVerification[]>;
  getVehicleVerificationById(id: string): Promise<VehicleVerification | null>;
  updateVehicleVerificationStatus(id: string, status: VehicleVerificationStatus): Promise<void>;
  deleteVehicleVerification(id: string): Promise<void>;
}
