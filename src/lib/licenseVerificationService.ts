import { db } from './firebase';
import { collection, doc, getDocs, getDoc, updateDoc, query, where, orderBy } from 'firebase/firestore';

export interface DrivingLicense {
  id: string;
  userId: string;
  back_image_url: string;
  front_image_url: string;
  license_type: string;
  submitted_at: string;
  verification_status: 'pending' | 'rejected' | 'verified';
  user_name?: string;
  user_email?: string;
}

export const licenseVerificationService = {
  // Get all license verifications from all users
  async getAllLicenseVerifications(): Promise<DrivingLicense[]> {
    try {
      const usersCollection = collection(db, 'users');
      const userDocs = await getDocs(usersCollection);
      
      const allLicenses: DrivingLicense[] = [];
      
      for (const userDoc of userDocs.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();
        
        // Check if user has driving_license field
        if (userData.driving_license) {
          const license = userData.driving_license;
          
          // Debug logging for submitted_at
          console.log('License data for user', userId, ':', {
            submitted_at: license.submitted_at,
            submitted_at_type: typeof license.submitted_at,
            submitted_at_constructor: license.submitted_at?.constructor?.name
          });
          
          // Get user name from profile.displayName or fallback options
          const userName = userData.profile?.displayName || 
                          userData.displayName || 
                          userData.name || 
                          'Unknown User';
          
          allLicenses.push({
            id: userId,
            userId: userId,
            back_image_url: license.back_image_url || '',
            front_image_url: license.front_image_url || '',
            license_type: license.license_type || '',
            submitted_at: license.submitted_at || '',
            verification_status: license.verification_status || 'pending',
            user_name: userName,
            user_email: userData.email || 'No email',
          });
        }
      }
      
      return allLicenses;
    } catch (error) {
      console.error('Error fetching license verifications:', error);
      throw error;
    }
  },

  // Get license verification for a specific user
  async getUserLicenseVerification(userId: string): Promise<DrivingLicense | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        if (userData?.driving_license) {
          const license = userData.driving_license;
          return {
            id: userId,
            userId: userId,
            back_image_url: license.back_image_url || '',
            front_image_url: license.front_image_url || '',
            license_type: license.license_type || '',
            submitted_at: license.submitted_at || '',
            verification_status: license.verification_status || 'pending',
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user license verification:', error);
      throw error;
    }
  },

  // Update license verification status
  async updateLicenseVerificationStatus(
    userId: string, 
    status: 'pending' | 'rejected' | 'verified',
    notes?: string
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'driving_license.verification_status': status,
        'driving_license.verified_at': new Date().toISOString(),
        'driving_license.notes': notes || '',
      });
    } catch (error) {
      console.error('Error updating license verification status:', error);
      throw error;
    }
  },

  // Get license verifications by status
  async getLicenseVerificationsByStatus(status: 'pending' | 'rejected' | 'verified'): Promise<DrivingLicense[]> {
    try {
      const allLicenses = await this.getAllLicenseVerifications();
      return allLicenses.filter(license => license.verification_status === status);
    } catch (error) {
      console.error('Error fetching license verifications by status:', error);
      throw error;
    }
  },

  // Get license verifications by license type
  async getLicenseVerificationsByType(licenseType: string): Promise<DrivingLicense[]> {
    try {
      const allLicenses = await this.getAllLicenseVerifications();
      return allLicenses.filter(license => license.license_type === licenseType);
    } catch (error) {
      console.error('Error fetching license verifications by type:', error);
      throw error;
    }
  },
}; 