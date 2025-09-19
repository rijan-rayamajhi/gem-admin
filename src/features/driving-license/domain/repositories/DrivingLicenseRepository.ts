import { DrivingLicense, DrivingLicenseUpdate, VerificationStatus } from '../entities/DrivingLicense';

export interface DrivingLicenseRepository {
  getAllDrivingLicenses(): Promise<DrivingLicense[]>;
  getDrivingLicenseById(id: string): Promise<DrivingLicense | null>;
  getDrivingLicensesByUserId(userId: string): Promise<DrivingLicense[]>;
  getDrivingLicensesByStatus(status: VerificationStatus): Promise<DrivingLicense[]>;
  updateDrivingLicense(update: DrivingLicenseUpdate): Promise<DrivingLicense>;
  deleteDrivingLicense(id: string): Promise<void>;
}
