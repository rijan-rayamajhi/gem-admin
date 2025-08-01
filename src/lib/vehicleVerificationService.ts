import { collection, doc, getDocs, getDoc, updateDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface VehicleVerification {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  vehicleNumber: string;
  vehicleType: string;
  brand: string;
  model: string;
  year: string;
  registrationAuthority: string;
  registrationDate: string;
  expiryDate: string;
  status: 'notVerified' | 'approved' | 'pending' | 'rejected';
  documentUrl: string;
  createdAt: string;
  updatedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  // Add other profile fields as needed
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  vehicleType: string;
  brand: string;
  model: string;
  year: string;
  registrationAuthority: string;
  registrationDate: string;
  expiryDate: string;
  status: 'notVerified' | 'approved' | 'pending' | 'rejected';
  documentUrl: string;
  createdAt: string;
  updatedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
}

class VehicleVerificationService {
  /**
   * Get all vehicle verifications by fetching from users collection
   */
  async getVehicleVerifications(): Promise<VehicleVerification[]> {
    try {
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      const verifications: VehicleVerification[] = [];
      
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();
        
        // Get user profile - try different possible field structures
        let userName = 'Unknown';
        let userEmail = 'Unknown';
        
        // Try different possible user data structures
        if (userData.profile && typeof userData.profile === 'object') {
          // If profile is an object field
          userName = userData.profile.name || userData.profile.displayName || userData.profile.fullName || 'Unknown';
          userEmail = userData.profile.email || userData.email || 'Unknown';
        } else if (userData.name || userData.displayName || userData.fullName) {
          // If user data has name fields directly
          userName = userData.name || userData.displayName || userData.fullName || 'Unknown';
          userEmail = userData.email || 'Unknown';
        } else if (userData.email) {
          // If only email is available
          userEmail = userData.email;
          userName = userData.email.split('@')[0] || 'Unknown'; // Use email prefix as name
        }
        
        // Skip if no email found (likely not a valid user)
        if (userEmail === 'Unknown') continue;
        
        // Get vehicles subcollection
        const vehiclesRef = collection(db, 'users', userId, 'vehicles');
        const vehiclesSnapshot = await getDocs(vehiclesRef);
        
        for (const vehicleDoc of vehiclesSnapshot.docs) {
          const vehicleData = vehicleDoc.data() as Vehicle;
          
          verifications.push({
            id: vehicleDoc.id,
            userId: userId,
            userName: userName,
            userEmail: userEmail,
            vehicleNumber: vehicleData.vehicleNumber,
            vehicleType: vehicleData.vehicleType,
            brand: vehicleData.brand,
            model: vehicleData.model,
            year: vehicleData.year,
            registrationAuthority: vehicleData.registrationAuthority,
            registrationDate: vehicleData.registrationDate,
            expiryDate: vehicleData.expiryDate,
            status: vehicleData.status,
            documentUrl: vehicleData.documentUrl,
            createdAt: vehicleData.createdAt,
            updatedAt: vehicleData.updatedAt,
            verifiedAt: vehicleData.verifiedAt,
            verifiedBy: vehicleData.verifiedBy,
            notes: vehicleData.notes,
          });
        }
      }
      
      return verifications;
    } catch (error) {
      console.error('Error fetching vehicle verifications:', error);
      throw new Error('Failed to fetch vehicle verifications');
    }
  }

  /**
   * Update vehicle verification status
   */
  async updateVehicleStatus(
    userId: string, 
    vehicleId: string, 
    status: 'approved' | 'rejected', 
    verifiedBy: string,
    notes?: string
  ): Promise<void> {
    try {
      const vehicleRef = doc(db, 'users', userId, 'vehicles', vehicleId);
      
      const updateData: any = {
        status: status,
        updatedAt: Timestamp.now().toDate().toISOString(),
        verifiedAt: Timestamp.now().toDate().toISOString(),
        verifiedBy: verifiedBy,
      };
      
      if (notes) {
        updateData.notes = notes;
      }
      
      await updateDoc(vehicleRef, updateData);
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      throw new Error('Failed to update vehicle status');
    }
  }

  /**
   * Get vehicle verification by ID
   */
  async getVehicleVerification(userId: string, vehicleId: string): Promise<VehicleVerification | null> {
    try {
      const vehicleRef = doc(db, 'users', userId, 'vehicles', vehicleId);
      const vehicleDoc = await getDoc(vehicleRef);
      
      if (!vehicleDoc.exists()) {
        return null;
      }
      
      const vehicleData = vehicleDoc.data() as Vehicle;
      
      // Get user profile
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      
      // Try different possible user data structures
      let userName = 'Unknown';
      let userEmail = 'Unknown';
      
      if (userData?.profile && typeof userData.profile === 'object') {
        userName = userData.profile.name || userData.profile.displayName || userData.profile.fullName || 'Unknown';
        userEmail = userData.profile.email || userData.email || 'Unknown';
      } else if (userData?.name || userData?.displayName || userData?.fullName) {
        userName = userData.name || userData.displayName || userData.fullName || 'Unknown';
        userEmail = userData.email || 'Unknown';
      } else if (userData?.email) {
        userEmail = userData.email;
        userName = userData.email.split('@')[0] || 'Unknown';
      }
      
      return {
        id: vehicleDoc.id,
        userId: userId,
        userName: userName,
        userEmail: userEmail,
        vehicleNumber: vehicleData.vehicleNumber,
        vehicleType: vehicleData.vehicleType,
        brand: vehicleData.brand,
        model: vehicleData.model,
        year: vehicleData.year,
        registrationAuthority: vehicleData.registrationAuthority,
        registrationDate: vehicleData.registrationDate,
        expiryDate: vehicleData.expiryDate,
        status: vehicleData.status,
        documentUrl: vehicleData.documentUrl,
        createdAt: vehicleData.createdAt,
        updatedAt: vehicleData.updatedAt,
        verifiedAt: vehicleData.verifiedAt,
        verifiedBy: vehicleData.verifiedBy,
        notes: vehicleData.notes,
      };
    } catch (error) {
      console.error('Error fetching vehicle verification:', error);
      throw new Error('Failed to fetch vehicle verification');
    }
  }

  /**
   * Get vehicle verifications by status
   */
  async getVehicleVerificationsByStatus(status: string): Promise<VehicleVerification[]> {
    const allVerifications = await this.getVehicleVerifications();
    return allVerifications.filter(v => v.status === status);
  }

  /**
   * Get vehicle verifications by user ID
   */
  async getVehicleVerificationsByUserId(userId: string): Promise<VehicleVerification[]> {
    try {
      const vehiclesRef = collection(db, 'users', userId, 'vehicles');
      const vehiclesSnapshot = await getDocs(vehiclesRef);
      
      const verifications: VehicleVerification[] = [];
      
      // Get user profile
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      
      // Try different possible user data structures
      let userName = 'Unknown';
      let userEmail = 'Unknown';
      
      if (userData?.profile && typeof userData.profile === 'object') {
        userName = userData.profile.name || userData.profile.displayName || userData.profile.fullName || 'Unknown';
        userEmail = userData.profile.email || userData.email || 'Unknown';
      } else if (userData?.name || userData?.displayName || userData?.fullName) {
        userName = userData.name || userData.displayName || userData.fullName || 'Unknown';
        userEmail = userData.email || 'Unknown';
      } else if (userData?.email) {
        userEmail = userData.email;
        userName = userData.email.split('@')[0] || 'Unknown';
      }
      
      for (const vehicleDoc of vehiclesSnapshot.docs) {
        const vehicleData = vehicleDoc.data() as Vehicle;
        
        verifications.push({
          id: vehicleDoc.id,
          userId: userId,
          userName: userName,
          userEmail: userEmail,
          vehicleNumber: vehicleData.vehicleNumber,
          vehicleType: vehicleData.vehicleType,
          brand: vehicleData.brand,
          model: vehicleData.model,
          year: vehicleData.year,
          registrationAuthority: vehicleData.registrationAuthority,
          registrationDate: vehicleData.registrationDate,
          expiryDate: vehicleData.expiryDate,
          status: vehicleData.status,
          documentUrl: vehicleData.documentUrl,
          createdAt: vehicleData.createdAt,
          updatedAt: vehicleData.updatedAt,
          verifiedAt: vehicleData.verifiedAt,
          verifiedBy: vehicleData.verifiedBy,
          notes: vehicleData.notes,
        });
      }
      
      return verifications;
    } catch (error) {
      console.error('Error fetching vehicle verifications by user ID:', error);
      throw new Error('Failed to fetch vehicle verifications');
    }
  }
}

export const vehicleVerificationService = new VehicleVerificationService(); 