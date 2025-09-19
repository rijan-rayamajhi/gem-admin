import { DrivingLicenseRepository } from '../repositories/DrivingLicenseRepository';
import { DrivingLicense, VerificationStatus } from '../entities/DrivingLicense';

export class GetDrivingLicensesByStatusUseCase {
  constructor(private drivingLicenseRepository: DrivingLicenseRepository) {}

  async execute(status: VerificationStatus): Promise<DrivingLicense[]> {
    return await this.drivingLicenseRepository.getDrivingLicensesByStatus(status);
  }
}
