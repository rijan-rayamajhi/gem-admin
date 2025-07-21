import { db } from './firebase';
import { collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { TimestampUtils } from './timestampUtils';

export interface CarosealAd {
  id?: string;
  title: string;
  description: string;
  adImage: string; // Firebase Storage URL
  actionType: {
    type: 'website' | 'app_screen';
    value: string;
  };
  location: {
    type: 'specific' | 'pan_india';
    latitude?: number;
    longitude?: number;
    radius?: number;
  };
  startDate: Timestamp;
  endDate: Timestamp;
  status: 'active' | 'inactive' | 'expired';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Type for ad updates that can handle File objects for uploads
export type CarosealAdUpdateData = Omit<CarosealAd, 'id' | 'status' | 'createdAt' | 'updatedAt'> & {
  id: string;
};

class CarosealAdService {
  private collectionName = 'carosealAds';

  // Upload file to Firebase Storage and return URL
  async uploadFile(file: File, path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  // Delete file from Firebase Storage
  async deleteFile(url: string): Promise<void> {
    try {
      const fileRef = ref(storage, url);
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      // Don't throw error for file deletion failures
    }
  }

  /**
   * Create a new ad - now works directly with Timestamps
   */
  async createAd(adData: Omit<CarosealAd, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log('Service: Creating ad with timestamp data:', adData);
      
      const adWithMetadata = {
        ...adData,
        status: 'active' as const,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      console.log('Service: Final ad data with metadata:', adWithMetadata);

      const docRef = await addDoc(collection(db, this.collectionName), adWithMetadata);
      console.log('Service: Document created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Service: Error creating ad:', error);
      throw new Error(`Failed to create ad: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all ads - simplified with automatic timestamp normalization
   */
  async getAds(): Promise<CarosealAd[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Normalize timestamps using TimestampUtils
        return {
          id: doc.id,
          ...data,
          startDate: TimestampUtils.normalize(data.startDate),
          endDate: TimestampUtils.normalize(data.endDate),
          createdAt: TimestampUtils.normalize(data.createdAt),
          updatedAt: TimestampUtils.normalize(data.updatedAt),
        };
      }) as CarosealAd[];
    } catch (error) {
      console.error('Error fetching ads:', error);
      throw new Error('Failed to fetch ads');
    }
  }

  /**
   * Get ad by ID - simplified timestamp handling
   */
  async getAdById(id: string): Promise<CarosealAd | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        return {
          id: docSnap.id,
          ...data,
          startDate: TimestampUtils.normalize(data.startDate),
          endDate: TimestampUtils.normalize(data.endDate),
          createdAt: TimestampUtils.normalize(data.createdAt),
          updatedAt: TimestampUtils.normalize(data.updatedAt),
        } as CarosealAd;
      }
      return null;
    } catch (error) {
      console.error('Error fetching ad:', error);
      throw new Error('Failed to fetch ad');
    }
  }

  /**
   * Update ad - simplified for direct Timestamp usage
   */
  async updateAd(adId: string, adData: Partial<CarosealAdUpdateData>): Promise<void> {
    try {
      const adRef = doc(db, this.collectionName, adId);
      const adDoc = await getDoc(adRef);
      
      if (!adDoc.exists()) {
        throw new Error('Ad not found');
      }

      const currentAd = adDoc.data() as CarosealAd;
      
      // Handle file uploads and deletions for updates
      const uploadPromises: Promise<any>[] = [];
      const deletePromises: Promise<void>[] = [];
      
      // Handle ad image
      if (adData.adImage && typeof adData.adImage !== 'string') {
        const adImageFile = adData.adImage as File;
        // Delete old ad image if it exists
        if (currentAd.adImage) {
          deletePromises.push(this.deleteFile(currentAd.adImage));
        }
        // Upload new ad image
        const adImagePromise = this.uploadFile(
          adImageFile,
          `carosealAds/images/${Date.now()}_${adImageFile.name}`
        ).then(url => { adData.adImage = url; });
        uploadPromises.push(adImagePromise);
      }

      // Wait for all uploads and deletions to complete
      await Promise.all([...uploadPromises, ...deletePromises]);

      // Update the document - Timestamps are preserved as-is
      const updateData = {
        ...adData,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(adRef, updateData);
    } catch (error) {
      console.error('Error updating ad:', error);
      throw new Error('Failed to update ad');
    }
  }

  /**
   * Delete ad and associated files
   */
  async deleteAd(adId: string): Promise<void> {
    try {
      const adRef = doc(db, this.collectionName, adId);
      const adDoc = await getDoc(adRef);
      
      if (adDoc.exists()) {
        const ad = adDoc.data() as CarosealAd;
        
        // Delete associated files
        if (ad.adImage) {
          await this.deleteFile(ad.adImage);
        }
      }
      
      await deleteDoc(adRef);
    } catch (error) {
      console.error('Error deleting ad:', error);
      throw new Error('Failed to delete ad');
    }
  }

  /**
   * Get ads by status
   */
  async getAdsByStatus(status: CarosealAd['status']): Promise<CarosealAd[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: TimestampUtils.normalize(data.startDate),
          endDate: TimestampUtils.normalize(data.endDate),
          createdAt: TimestampUtils.normalize(data.createdAt),
          updatedAt: TimestampUtils.normalize(data.updatedAt),
        };
      }) as CarosealAd[];
    } catch (error) {
      console.error('Error fetching ads by status:', error);
      throw new Error('Failed to fetch ads by status');
    }
  }

  async getActiveAds(): Promise<CarosealAd[]> {
    return this.getAdsByStatus('active');
  }

  async getInactiveAds(): Promise<CarosealAd[]> {
    return this.getAdsByStatus('inactive');
  }

  async getExpiredAds(): Promise<CarosealAd[]> {
    return this.getAdsByStatus('expired');
  }

  /**
   * Get ads by date range using Timestamps
   */
  async getAdsByDateRange(startDate: Timestamp, endDate: Timestamp): Promise<CarosealAd[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('startDate', '>=', startDate),
        where('startDate', '<=', endDate),
        orderBy('startDate', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: TimestampUtils.normalize(data.startDate),
          endDate: TimestampUtils.normalize(data.endDate),
          createdAt: TimestampUtils.normalize(data.createdAt),
          updatedAt: TimestampUtils.normalize(data.updatedAt),
        };
      }) as CarosealAd[];
    } catch (error) {
      console.error('Error fetching ads by date range:', error);
      throw new Error('Failed to fetch ads by date range');
    }
  }

  /**
   * Check and update expired ads based on Timestamps
   */
  async checkAndUpdateExpiredAds(): Promise<void> {
    try {
      const now = Timestamp.now();
      const activeAds = await this.getActiveAds();
      
      // Use TimestampUtils for comparison
      const expiredAds = activeAds.filter(ad => TimestampUtils.isPast(ad.endDate));
      
      // Update expired ads
      const updatePromises = expiredAds.map(ad =>
        updateDoc(doc(db, this.collectionName, ad.id!), {
          status: 'expired',
          updatedAt: Timestamp.now(),
        })
      );

      await Promise.all(updatePromises);
      console.log(`Updated ${expiredAds.length} expired ads`);
    } catch (error) {
      console.error('Error checking expired ads:', error);
      throw new Error('Failed to check expired ads');
    }
  }

  /**
   * Get ads that are currently active (between start and end dates)
   */
  async getCurrentlyActiveAds(): Promise<CarosealAd[]> {
    try {
      const allActiveAds = await this.getActiveAds();
      
      // Filter by actual date range using TimestampUtils
      return allActiveAds.filter(ad => 
        TimestampUtils.isActive(ad.startDate, ad.endDate)
      );
    } catch (error) {
      console.error('Error fetching currently active ads:', error);
      throw new Error('Failed to fetch currently active ads');
    }
  }

  /**
   * Get upcoming ads (start date is in the future)
   */
  async getUpcomingAds(): Promise<CarosealAd[]> {
    try {
      const allActiveAds = await this.getActiveAds();
      
      // Filter for upcoming ads
      return allActiveAds.filter(ad => 
        TimestampUtils.isFuture(ad.startDate)
      );
    } catch (error) {
      console.error('Error fetching upcoming ads:', error);
      throw new Error('Failed to fetch upcoming ads');
    }
  }
}

export const carosealAdService = new CarosealAdService();
export default carosealAdService; 