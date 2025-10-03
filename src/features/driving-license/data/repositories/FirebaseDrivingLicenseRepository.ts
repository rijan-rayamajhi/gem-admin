import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  updateDoc
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
        if (userData.drivingLicense) {
          const license = userData.drivingLicense;
          drivingLicenses.push({
            id: `${userDoc.id}_0`,
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

      return drivingLicenses.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
    } catch (error) {
      console.error('Error fetching driving licenses:', error);
      throw new Error('Failed to fetch driving licenses');
    }
  }

  async getDrivingLicenseById(id: string): Promise<DrivingLicense | null> {
    try {
      const [userId] = id.split('_');
      const userDoc = await getDoc(doc(db, this.collectionName, userId));
      
      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();
      if (!userData.drivingLicense) {
        return null;
      }

      const license = userData.drivingLicense;

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
      if (!userData.drivingLicense) {
        return [];
      }

      const license = userData.drivingLicense;

      return [{
        id: `${userId}_0`,
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
      }];
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
      const [userId] = update.id.split('_');
      const userDocRef = doc(db, this.collectionName, userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      if (!userData.drivingLicense) {
        throw new Error('No driving license found for user');
      }

      // Update the license
      const updatedLicenseData: Record<string, unknown> = {
        ...userData.drivingLicense,
        verificationStatus: update.verificationStatus,
        reviewedBy: update.reviewedBy,
        reviewedAt: new Date(),
      };

      // Only add optional fields if they are defined
      if (update.rejectionReason !== undefined) {
        updatedLicenseData.rejectionReason = update.rejectionReason;
      }
      if (update.notes !== undefined) {
        updatedLicenseData.notes = update.notes;
      }

      // Update the user document
      await updateDoc(userDocRef, {
        drivingLicense: updatedLicenseData
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
      const [userId] = id.split('_');
      const userDocRef = doc(db, this.collectionName, userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      if (!userData.drivingLicense) {
        throw new Error('No driving license found for user');
      }

      // Remove the driving license field entirely
      await updateDoc(userDocRef, {
        drivingLicense: null
      });
    } catch (error) {
      console.error('Error deleting driving license:', error);
      throw new Error('Failed to delete driving license');
    }
  }
}
