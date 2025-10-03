import { Ride, RideVerificationUpdate } from '../entities/Ride';
import { RideRepository } from '../repositories/RideRepository';

export class GetAllRidesUseCase {
  constructor(private rideRepository: RideRepository) {}

  async execute(): Promise<Ride[]> {
    return await this.rideRepository.getAllRides();
  }
}

export class GetRidesByVerificationStatusUseCase {
  constructor(private rideRepository: RideRepository) {}

  async execute(status: 'pending' | 'verified' | 'rejected'): Promise<Ride[]> {
    return await this.rideRepository.getRidesByVerificationStatus(status);
  }
}

export class UpdateRideOdometerVerificationUseCase {
  constructor(private rideRepository: RideRepository) {}

  async execute(rideId: string, userId: string, update: RideVerificationUpdate): Promise<void> {
    return await this.rideRepository.updateRideOdometerVerification(rideId, userId, update);
  }
}
