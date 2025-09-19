import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  updateDoc, 
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DrivingLicenseRepository } from '../../domain/repositories/DrivingLicenseRepository';
import { DrivingLicense, DrivingLicenseUpdate, VerificationStatus } from '../../domain/entities/DrivingLicense';

export class FirebaseDrivingLicenseRepository implements DrivingLicenseRepository {
  private collectionName = 'users';

  async getAllDrivingLicenses(): Promise<DrivingLicense[]> {
    try {
      const usersSnapshot = await getDocs(collection(db, this.collectionName));
      const drivingLicenses: DrivingLicense[] = [];

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        if (userData.drivingLicenses) {
          const licenses = Array.isArray(userData.drivingLicenses) 
            ? userData.drivingLicenses 
            : [userData.drivingLicenses];

          for (const license of licenses) {
            drivingLicenses.push({
              id: `${userDoc.id}_${license.id || Date.now()}`,
              userId: userDoc.id,
              userEmail: userData.email || '',
              userDisplayName: userData.displayName || userData.name || 'Unknown User',
              licenseType: license.licenseType || '',
              frontImagePath: license.frontImagePath || '',
              backImagePath: license.backImagePath || '',
              dob: license.dob ? (license.dob.toDate ? license.dob.toDate() : new Date(license.dob)) : new Date(),
              verificationStatus: license.verificationStatus || VerificationStatus.PENDING,
              submittedAt: license.submittedAt ? (license.submittedAt.toDate ? license.submittedAt.toDate() : new Date(license.submittedAt)) : new Date(),
              reviewedAt: license.reviewedAt ? (license.reviewedAt.toDate ? license.reviewedAt.toDate() : new Date(license.reviewedAt)) : undefined,
              reviewedBy: license.reviewedBy || undefined,
              rejectionReason: license.rejectionReason || undefined,
              notes: license.notes || undefined,
            });
          }
        }
      }

      return drivingLicenses.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
    } catch (error) {
      console.error('Error fetching driving licenses:', error);
      throw new Error('Failed to fetch driving licenses');
    }
  }

  async getDrivingLicenseById(id: string): Promise<DrivingLicense | null> {
    try {
      const [userId, licenseId] = id.split('_');
      const userDoc = await getDoc(doc(db, this.collectionName, userId));
      
      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();
      if (!userData.drivingLicenses) {
        return null;
      }

      const licenses = Array.isArray(userData.drivingLicenses) 
        ? userData.drivingLicenses 
        : [userData.drivingLicenses];

      const license = licenses.find(l => `${userId}_${l.id || Date.now()}` === id);
      if (!license) {
        return null;
      }

      return {
        id,
        userId,
        userEmail: userData.email || '',
        userDisplayName: userData.displayName || userData.name || 'Unknown User',
        licenseType: license.licenseType || '',
        frontImagePath: license.frontImagePath || '',
        backImagePath: license.backImagePath || '',
        dob: license.dob ? (license.dob.toDate ? license.dob.toDate() : new Date(license.dob)) : new Date(),
        verificationStatus: license.verificationStatus || VerificationStatus.PENDING,
        submittedAt: license.submittedAt ? (license.submittedAt.toDate ? license.submittedAt.toDate() : new Date(license.submittedAt)) : new Date(),
        reviewedAt: license.reviewedAt ? (license.reviewedAt.toDate ? license.reviewedAt.toDate() : new Date(license.reviewedAt)) : undefined,
        reviewedBy: license.reviewedBy || undefined,
        rejectionReason: license.rejectionReason || undefined,
        notes: license.notes || undefined,
      };
    } catch (error) {
      console.error('Error fetching driving license by ID:', error);
      throw new Error('Failed to fetch driving license');
    }
  }

  async getDrivingLicensesByUserId(userId: string): Promise<DrivingLicense[]> {
    try {
      const userDoc = await getDoc(doc(db, this.collectionName, userId));
      
      if (!userDoc.exists()) {
        return [];
      }

      const userData = userDoc.data();
      if (!userData.drivingLicenses) {
        return [];
      }

      const licenses = Array.isArray(userData.drivingLicenses) 
        ? userData.drivingLicenses 
        : [userData.drivingLicenses];

      return licenses.map((license, index) => ({
        id: `${userId}_${license.id || index}`,
        userId,
        userEmail: userData.email || '',
        userDisplayName: userData.displayName || userData.name || 'Unknown User',
        licenseType: license.licenseType || '',
        frontImagePath: license.frontImagePath || '',
        backImagePath: license.backImagePath || '',
        dob: license.dob ? (license.dob.toDate ? license.dob.toDate() : new Date(license.dob)) : new Date(),
        verificationStatus: license.verificationStatus || VerificationStatus.PENDING,
        submittedAt: license.submittedAt ? (license.submittedAt.toDate ? license.submittedAt.toDate() : new Date(license.submittedAt)) : new Date(),
        reviewedAt: license.reviewedAt ? (license.reviewedAt.toDate ? license.reviewedAt.toDate() : new Date(license.reviewedAt)) : undefined,
        reviewedBy: license.reviewedBy || undefined,
        rejectionReason: license.rejectionReason || undefined,
        notes: license.notes || undefined,
      })).sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
    } catch (error) {
      console.error('Error fetching driving licenses by user ID:', error);
      throw new Error('Failed to fetch driving licenses for user');
    }
  }

  async getDrivingLicensesByStatus(status: VerificationStatus): Promise<DrivingLicense[]> {
    try {
      const allLicenses = await this.getAllDrivingLicenses();
      return allLicenses.filter(license => license.verificationStatus === status);
    } catch (error) {
      console.error('Error fetching driving licenses by status:', error);
      throw new Error('Failed to fetch driving licenses by status');
    }
  }

  async updateDrivingLicense(update: DrivingLicenseUpdate): Promise<DrivingLicense> {
    try {
      const [userId, licenseId] = update.id.split('_');
      const userDocRef = doc(db, this.collectionName, userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      if (!userData.drivingLicenses) {
        throw new Error('No driving licenses found for user');
      }

      const licenses = Array.isArray(userData.drivingLicenses) 
        ? [...userData.drivingLicenses] 
        : [userData.drivingLicenses];

      const licenseIndex = licenses.findIndex(l => `${userId}_${l.id || licenses.indexOf(l)}` === update.id);
      if (licenseIndex === -1) {
        throw new Error('Driving license not found');
      }

      // Update the license
      licenses[licenseIndex] = {
        ...licenses[licenseIndex],
        verificationStatus: update.verificationStatus,
        rejectionReason: update.rejectionReason,
        notes: update.notes,
        reviewedBy: update.reviewedBy,
        reviewedAt: new Date(),
      };

      // Update the user document
      await updateDoc(userDocRef, {
        drivingLicenses: licenses
      });

      // Return the updated license
      const updatedLicense = await this.getDrivingLicenseById(update.id);
      if (!updatedLicense) {
        throw new Error('Failed to retrieve updated license');
      }

      return updatedLicense;
    } catch (error) {
      console.error('Error updating driving license:', error);
      throw new Error('Failed to update driving license');
    }
  }

  async deleteDrivingLicense(id: string): Promise<void> {
    try {
      const [userId, licenseId] = id.split('_');
      const userDocRef = doc(db, this.collectionName, userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      if (!userData.drivingLicenses) {
        throw new Error('No driving licenses found for user');
      }

      const licenses = Array.isArray(userData.drivingLicenses) 
        ? [...userData.drivingLicenses] 
        : [userData.drivingLicenses];

      const licenseIndex = licenses.findIndex(l => `${userId}_${l.id || licenses.indexOf(l)}` === id);
      if (licenseIndex === -1) {
        throw new Error('Driving license not found');
      }

      // Remove the license
      licenses.splice(licenseIndex, 1);

      // Update the user document
      await updateDoc(userDocRef, {
        drivingLicenses: licenses
      });
    } catch (error) {
      console.error('Error deleting driving license:', error);
      throw new Error('Failed to delete driving license');
    }
  }
}
