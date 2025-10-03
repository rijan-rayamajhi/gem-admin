import { collection, doc, getDocs, query, where, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { VehicleVerificationRepository } from '../../domain/repositories/VehicleVerificationRepository';
import { VehicleVerification, VehicleVerificationStatus } from '../../domain/entities/VehicleVerification';

export class FirebaseVehicleVerificationRepository implements VehicleVerificationRepository {
  private readonly collectionName = 'users';

  async getAllVehicleVerifications(): Promise<VehicleVerification[]> {
    try {
      const vehicleVerifications: VehicleVerification[] = [];
      
      // Get all users
      const usersSnapshot = await getDocs(collection(db, this.collectionName));
      
      for (const userDoc of usersSnapshot.docs) {
        // Get user details
        const userData = userDoc.data();
        
        const vehiclesSnapshot = await getDocs(
          collection(db, this.collectionName, userDoc.id, 'vehicles')
        );
        
        vehiclesSnapshot.forEach((vehicleDoc) => {
          const data = vehicleDoc.data();
          vehicleVerifications.push({
            id: vehicleDoc.id,
            userId: userDoc.id,
            userEmail: userData.email || '',
            userDisplayName: userData.displayName || userData.name || '',
            vehicleType: data.vehicleType || '',
            vehicleBrandImage: data.vehicleBrandImage || '',
            vehicleBrandName: data.vehicleBrandName || '',
            vehicleModelName: data.vehicleModelName || '',
            vehicleRegistrationNumber: data.vehicleRegistrationNumber || '',
            vehicleTyreType: data.vehicleTyreType || '',
            verificationStatus: data.verificationStatus || VehicleVerificationStatus.NOT_VERIFIED,
            vehicleSlideImages: data.vehicleSlideImages || [],
            vehicleInsuranceImage: data.vehicleInsuranceImage || '',
            vehicleFrontImage: data.vehicleFrontImage || '',
            vehicleBackImage: data.vehicleBackImage || '',
            vehicleRCFrontImage: data.vehicleRCFrontImage || '',
            vehicleRCBackImage: data.vehicleRCBackImage || '',
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          });
        });
      }
      
      // Sort by createdAt in memory instead of using orderBy in query
      return vehicleVerifications.sort((a, b) => {
        const aTime = a.createdAt?.getTime() || 0;
        const bTime = b.createdAt?.getTime() || 0;
        return bTime - aTime; // Descending order (newest first)
      });
    } catch (error) {
      console.error('Error fetching vehicle verifications:', error);
      throw new Error('Failed to fetch vehicle verifications');
    }
  }

  async getVehicleVerificationsByStatus(status: VehicleVerificationStatus): Promise<VehicleVerification[]> {
    try {
      const vehicleVerifications: VehicleVerification[] = [];
      
      // Get all users
      const usersSnapshot = await getDocs(collection(db, this.collectionName));
      
      for (const userDoc of usersSnapshot.docs) {
        // Get user details
        const userData = userDoc.data();
        
        const vehiclesSnapshot = await getDocs(
          query(
            collection(db, this.collectionName, userDoc.id, 'vehicles'),
            where('verificationStatus', '==', status)
          )
        );
        
        vehiclesSnapshot.forEach((vehicleDoc) => {
          const data = vehicleDoc.data();
          vehicleVerifications.push({
            id: vehicleDoc.id,
            userId: userDoc.id,
            userEmail: userData.email || '',
            userDisplayName: userData.displayName || userData.name || '',
            vehicleType: data.vehicleType || '',
            vehicleBrandImage: data.vehicleBrandImage || '',
            vehicleBrandName: data.vehicleBrandName || '',
            vehicleModelName: data.vehicleModelName || '',
            vehicleRegistrationNumber: data.vehicleRegistrationNumber || '',
            vehicleTyreType: data.vehicleTyreType || '',
            verificationStatus: data.verificationStatus || VehicleVerificationStatus.NOT_VERIFIED,
            vehicleSlideImages: data.vehicleSlideImages || [],
            vehicleInsuranceImage: data.vehicleInsuranceImage || '',
            vehicleFrontImage: data.vehicleFrontImage || '',
            vehicleBackImage: data.vehicleBackImage || '',
            vehicleRCFrontImage: data.vehicleRCFrontImage || '',
            vehicleRCBackImage: data.vehicleRCBackImage || '',
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          });
        });
      }
      
      // Sort by createdAt in memory instead of using orderBy in query
      return vehicleVerifications.sort((a, b) => {
        const aTime = a.createdAt?.getTime() || 0;
        const bTime = b.createdAt?.getTime() || 0;
        return bTime - aTime; // Descending order (newest first)
      });
    } catch (error) {
      console.error('Error fetching vehicle verifications by status:', error);
      throw new Error('Failed to fetch vehicle verifications by status');
    }
  }

  async getVehicleVerificationById(id: string): Promise<VehicleVerification | null> {
    try {
      // Get all users
      const usersSnapshot = await getDocs(collection(db, this.collectionName));
      
      for (const userDoc of usersSnapshot.docs) {
        const vehicleSnapshot = await getDocs(collection(db, this.collectionName, userDoc.id, 'vehicles'));
        
        const vehicleData = vehicleSnapshot.docs.find(doc => doc.id === id);
        if (vehicleData) {
          const data = vehicleData.data();
          const userData = userDoc.data();
          return {
            id: vehicleData.id,
            userId: userDoc.id,
            userEmail: userData.email || '',
            userDisplayName: userData.displayName || userData.name || '',
            vehicleType: data.vehicleType || '',
            vehicleBrandImage: data.vehicleBrandImage || '',
            vehicleBrandName: data.vehicleBrandName || '',
            vehicleModelName: data.vehicleModelName || '',
            vehicleRegistrationNumber: data.vehicleRegistrationNumber || '',
            vehicleTyreType: data.vehicleTyreType || '',
            verificationStatus: data.verificationStatus || VehicleVerificationStatus.NOT_VERIFIED,
            vehicleSlideImages: data.vehicleSlideImages || [],
            vehicleInsuranceImage: data.vehicleInsuranceImage || '',
            vehicleFrontImage: data.vehicleFrontImage || '',
            vehicleBackImage: data.vehicleBackImage || '',
            vehicleRCFrontImage: data.vehicleRCFrontImage || '',
            vehicleRCBackImage: data.vehicleRCBackImage || '',
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching vehicle verification by ID:', error);
      throw new Error('Failed to fetch vehicle verification');
    }
  }

  async updateVehicleVerificationStatus(id: string, status: VehicleVerificationStatus): Promise<void> {
    try {
      // Find the vehicle in all users
      const usersSnapshot = await getDocs(collection(db, this.collectionName));
      
      for (const userDoc of usersSnapshot.docs) {
        const vehicleDoc = doc(db, this.collectionName, userDoc.id, 'vehicles', id);
        const vehicleSnapshot = await getDocs(collection(db, this.collectionName, userDoc.id, 'vehicles'));
        
        const vehicleData = vehicleSnapshot.docs.find(doc => doc.id === id);
        if (vehicleData) {
          await updateDoc(vehicleDoc, {
            verificationStatus: status,
            updatedAt: new Date(),
          });
          return;
        }
      }
      
      throw new Error('Vehicle verification not found');
    } catch (error) {
      console.error('Error updating vehicle verification status:', error);
      throw new Error('Failed to update vehicle verification status');
    }
  }

  async deleteVehicleVerification(id: string): Promise<void> {
    try {
      // Find the vehicle in all users
      const usersSnapshot = await getDocs(collection(db, this.collectionName));
      
      for (const userDoc of usersSnapshot.docs) {
        const vehicleDoc = doc(db, this.collectionName, userDoc.id, 'vehicles', id);
        const vehicleSnapshot = await getDocs(collection(db, this.collectionName, userDoc.id, 'vehicles'));
        
        const vehicleData = vehicleSnapshot.docs.find(doc => doc.id === id);
        if (vehicleData) {
          await deleteDoc(vehicleDoc);
          return;
        }
      }
      
      throw new Error('Vehicle verification not found');
    } catch (error) {
      console.error('Error deleting vehicle verification:', error);
      throw new Error('Failed to delete vehicle verification');
    }
  }
}
