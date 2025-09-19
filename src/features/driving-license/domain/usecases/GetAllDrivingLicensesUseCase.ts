import { DrivingLicenseRepository } from '../repositories/DrivingLicenseRepository';
import { DrivingLicense } from '../entities/DrivingLicense';

export class GetAllDrivingLicensesUseCase {
  constructor(private drivingLicenseRepository: DrivingLicenseRepository) {}

  async execute(): Promise<DrivingLicense[]> {
    return await this.drivingLicenseRepository.getAllDrivingLicenses();
  }
}
