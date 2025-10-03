import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Ride, RideVerificationUpdate } from '../../domain/entities/Ride';
import { RideRepository } from '../../domain/repositories/RideRepository';

export class FirebaseRideRepository implements RideRepository {
  async getAllRides(): Promise<Ride[]> {
    try {
      const rides: Ride[] = [];
      
      // Get all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      
      // For each user, get their rides subcollection
      for (const userDoc of usersSnapshot.docs) {
        const ridesSnapshot = await getDocs(
          collection(db, 'users', userDoc.id, 'rides')
        );
        
        ridesSnapshot.forEach((rideDoc) => {
          rides.push({
            id: rideDoc.id,
            userId: userDoc.id,
            ...rideDoc.data()
          } as Ride);
        });
      }
      
      // Sort by startedAt timestamp (newest first)
      return rides.sort((a, b) => {
        const aTime = a.startedAt instanceof Date ? a.startedAt : new Date(0);
        const bTime = b.startedAt instanceof Date ? b.startedAt : new Date(0);
        return bTime.getTime() - aTime.getTime();
      });
    } catch (error) {
      console.error('Error fetching rides:', error);
      throw new Error('Failed to fetch rides');
    }
  }

  async getRidesByVerificationStatus(status: 'pending' | 'verified' | 'rejected'): Promise<Ride[]> {
    try {
      const allRides = await this.getAllRides();
      return allRides.filter(ride => ride.odometer?.verificationStatus === status);
    } catch (error) {
      console.error('Error fetching rides by verification status:', error);
      throw new Error('Failed to fetch rides by verification status');
    }
  }

  async updateRideOdometerVerification(
    rideId: string, 
    userId: string, 
    update: RideVerificationUpdate
  ): Promise<void> {
    try {
      const rideRef = doc(db, 'users', userId, 'rides', rideId);
      await updateDoc(rideRef, {
        'odometer.verificationStatus': update.verificationStatus,
        'odometer.reasons': update.reasons || ''
      });
    } catch (error) {
      console.error('Error updating ride odometer verification:', error);
      throw new Error('Failed to update ride odometer verification');
    }
  }
}
