import { RideVerificationUpdate } from '../entities/Ride';
import { RideRepository } from '../repositories/RideRepository';

export class UpdateRideOdometerVerificationUseCase {
  constructor(private rideRepository: RideRepository) {}

  async execute(rideId: string, userId: string, update: RideVerificationUpdate): Promise<void> {
    return await this.rideRepository.updateRideOdometerVerification(rideId, userId, update);
  }
}
