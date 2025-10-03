import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { 
  CarouselAd, 
  CreateCarouselAdRequest, 
  UpdateCarouselAdRequest, 
  CarouselAdFilters 
} from '../../domain/entities/CarouselAd';
import { CarouselAdRepository } from '../../domain/repositories/CarouselAdRepository';

export class FirebaseCarouselAdRepository implements CarouselAdRepository {
  private collectionName = 'carouselAds';

  async create(carouselAdData: CreateCarouselAdRequest): Promise<CarouselAd> {
    try {
      // Clean up undefined values before sending to Firebase
      const cleanCarouselAdData = this.cleanUndefinedValues(carouselAdData);
      
      const carouselAd = {
        ...cleanCarouselAdData,
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'admin' // TODO: Get from auth context
      };

      const docRef = await addDoc(collection(db, this.collectionName), carouselAd);
      
      return {
        id: docRef.id,
        ...carouselAd,
        createdAt: carouselAd.createdAt.toDate(),
        updatedAt: carouselAd.updatedAt.toDate()
      } as CarouselAd;
    } catch (error) {
      console.error('Error creating carousel ad:', error);
      throw new Error('Failed to create carousel ad');
    }
  }

  async getById(id: string): Promise<CarouselAd | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        scheduling: {
          ...data.scheduling,
          startDate: data.scheduling?.startDate?.toDate ? data.scheduling.startDate.toDate() : data.scheduling?.startDate,
          endDate: data.scheduling?.endDate?.toDate ? data.scheduling.endDate.toDate() : data.scheduling?.endDate,
        },
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
      } as CarouselAd;
    } catch (error) {
      console.error('Error getting carousel ad:', error);
      throw new Error('Failed to get carousel ad');
    }
  }

  async getAll(): Promise<CarouselAd[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const carouselAds: CarouselAd[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        carouselAds.push({
          id: doc.id,
          ...data,
          scheduling: {
            ...data.scheduling,
            startDate: data.scheduling?.startDate?.toDate ? data.scheduling.startDate.toDate() : data.scheduling?.startDate,
            endDate: data.scheduling?.endDate?.toDate ? data.scheduling.endDate.toDate() : data.scheduling?.endDate,
          },
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
        } as CarouselAd);
      });

      return carouselAds;
    } catch (error) {
      console.error('Error getting carousel ads:', error);
      throw new Error('Failed to get carousel ads');
    }
  }

  async getByFilters(filters: CarouselAdFilters): Promise<CarouselAd[]> {
    try {
      // Get all carousel ads first, then filter in memory to avoid composite index requirements
      const q = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const carouselAds: CarouselAd[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const carouselAd = {
          id: doc.id,
          ...data,
          scheduling: {
            ...data.scheduling,
            startDate: data.scheduling?.startDate?.toDate ? data.scheduling.startDate.toDate() : data.scheduling?.startDate,
            endDate: data.scheduling?.endDate?.toDate ? data.scheduling.endDate.toDate() : data.scheduling?.endDate,
          },
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
        } as CarouselAd;

        carouselAds.push(carouselAd);
      });

      // Apply filters in memory
      let filteredAds = carouselAds;

      if (filters.isActive !== undefined) {
        filteredAds = filteredAds.filter(ad => ad.isActive === filters.isActive);
      }

      if (filters.dateRange) {
        filteredAds = filteredAds.filter(ad => {
          if (!ad.scheduling.startDate || !ad.scheduling.endDate) return false;
          return ad.scheduling.startDate <= filters.dateRange!.endDate && 
                 ad.scheduling.endDate >= filters.dateRange!.startDate;
        });
      }

      // Filter by location and radius if provided
      if (filters.location) {
        filteredAds = filteredAds.filter(ad => {
          if (!ad.locationTargeting.location) return false;
          return this.isWithinRadius(ad.locationTargeting.location, filters.location!);
        });
      }

      return filteredAds;
    } catch (error) {
      console.error('Error getting filtered carousel ads:', error);
      throw new Error('Failed to get filtered carousel ads');
    }
  }

  async update(updateData: UpdateCarouselAdRequest): Promise<CarouselAd> {
    try {
      const { id, ...updateFields } = updateData;
      const docRef = doc(db, this.collectionName, id);
      
      // Clean up undefined values before sending to Firebase
      const cleanUpdateFields = this.cleanUndefinedValues(updateFields);
      
      const updatePayload = {
        ...cleanUpdateFields,
        updatedAt: Timestamp.now()
      };

      await updateDoc(docRef, updatePayload);
      
      const updatedDoc = await getDoc(docRef);
      if (!updatedDoc.exists()) {
        throw new Error('Carousel ad not found after update');
      }

      const data = updatedDoc.data();
      return {
        id: updatedDoc.id,
        ...data,
        scheduling: {
          ...data.scheduling,
          startDate: data.scheduling?.startDate?.toDate ? data.scheduling.startDate.toDate() : data.scheduling?.startDate,
          endDate: data.scheduling?.endDate?.toDate ? data.scheduling.endDate.toDate() : data.scheduling?.endDate,
        },
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
      } as CarouselAd;
    } catch (error) {
      console.error('Error updating carousel ad:', error);
      throw new Error('Failed to update carousel ad');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting carousel ad:', error);
      throw new Error('Failed to delete carousel ad');
    }
  }

  async uploadImage(file: File): Promise<string> {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `carousel-ads/${timestamp}-${file.name}`;
      const storageRef = ref(storage, fileName);

      // Upload file
      await uploadBytes(storageRef, file);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }

  private isWithinRadius(
    adLocation: { latitude: number; longitude: number },
    filterLocation: { latitude: number; longitude: number; radius: number }
  ): boolean {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(filterLocation.latitude - adLocation.latitude);
    const dLon = this.deg2rad(filterLocation.longitude - adLocation.longitude);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(adLocation.latitude)) * Math.cos(this.deg2rad(filterLocation.latitude)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers

    return distance <= filterLocation.radius;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  private cleanUndefinedValues<T>(obj: T): T {
    if (obj === null || obj === undefined) {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanUndefinedValues(item)) as T;
    }
    
    if (typeof obj === 'object') {
      const cleaned: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          cleaned[key] = this.cleanUndefinedValues(value);
        }
      }
      return cleaned as T;
    }
    
    return obj;
  }
}
