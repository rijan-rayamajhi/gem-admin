import { DrivingLicenseRepository } from '../repositories/DrivingLicenseRepository';
import { DrivingLicense, DrivingLicenseUpdate } from '../entities/DrivingLicense';

export class UpdateDrivingLicenseUseCase {
  constructor(private drivingLicenseRepository: DrivingLicenseRepository) {}

  async execute(update: DrivingLicenseUpdate): Promise<DrivingLicense> {
    return await this.drivingLicenseRepository.updateDrivingLicense(update);
  }
}
