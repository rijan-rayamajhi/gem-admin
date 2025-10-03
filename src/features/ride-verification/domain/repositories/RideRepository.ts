import { Ride, RideVerificationUpdate } from '../entities/Ride';

export interface RideRepository {
  getAllRides(): Promise<Ride[]>;
  getRidesByVerificationStatus(status: 'pending' | 'verified' | 'rejected'): Promise<Ride[]>;
  updateRideOdometerVerification(rideId: string, userId: string, update: RideVerificationUpdate): Promise<void>;
}
