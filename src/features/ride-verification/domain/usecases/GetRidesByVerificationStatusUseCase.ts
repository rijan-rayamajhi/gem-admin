import { Ride } from '../entities/Ride';
import { RideRepository } from '../repositories/RideRepository';

export class GetRidesByVerificationStatusUseCase {
  constructor(private rideRepository: RideRepository) {}

  async execute(status: 'pending' | 'verified' | 'rejected'): Promise<Ride[]> {
    return await this.rideRepository.getRidesByVerificationStatus(status);
  }
}
