import { DrivingLicenseRepository } from '../repositories/DrivingLicenseRepository';

export class DeleteDrivingLicenseUseCase {
  constructor(private drivingLicenseRepository: DrivingLicenseRepository) {}

  async execute(id: string): Promise<void> {
    return await this.drivingLicenseRepository.deleteDrivingLicense(id);
  }
}
