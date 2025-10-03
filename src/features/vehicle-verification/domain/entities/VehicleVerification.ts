import { VehicleVerificationStatus } from './VehicleVerificationStatus';

export { VehicleVerificationStatus } from './VehicleVerificationStatus';

export interface VehicleVerification {
  id: string;
  userId: string;
  userEmail?: string;
  userDisplayName?: string;
  vehicleType: string;
  vehicleBrandImage: string;
  vehicleBrandName: string;
  vehicleModelName: string;
  vehicleRegistrationNumber: string;
  vehicleTyreType: string;
  verificationStatus: VehicleVerificationStatus;
  vehicleSlideImages?: string[];
  vehicleInsuranceImage?: string;
  vehicleFrontImage?: string;
  vehicleBackImage?: string;
  vehicleRCFrontImage?: string;
  vehicleRCBackImage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
