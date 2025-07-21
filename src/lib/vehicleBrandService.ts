import { collection, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from './firebase';

export interface VehicleModel {
  id: string;
  name: string;
}

export interface VehicleBrand {
  id?: string;
  name: string;
  country?: string;
  founded?: number;
  status: 'Active' | 'Inactive';
  models: VehicleModel[];
  vehicleType: 'two_wheeler' | 'four_wheeler' | 'two_wheeler_electric' | 'four_wheeler_electric';
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

class VehicleBrandService {
  private readonly ADMIN_COLLECTION = 'admin_data';
  private readonly VEHICLE_BRANDS_DOC_ID = 'vehicle_brands';

  async getVehicleBrands(): Promise<VehicleBrand[]> {
    try {
      const docRef = doc(db, this.ADMIN_COLLECTION, this.VEHICLE_BRANDS_DOC_ID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const brands = data.brands || [];
        return brands.map((brand: any) => ({
          ...brand,
          createdAt: brand.createdAt?.toDate() || new Date(),
          updatedAt: brand.updatedAt?.toDate() || new Date(),
        })) as VehicleBrand[];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching vehicle brands:', error);
      throw new Error('Failed to fetch vehicle brands');
    }
  }

  async addVehicleBrand(brandData: Omit<VehicleBrand, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const brandWithTimestamps = {
        id: Date.now().toString(), // Generate unique ID
        ...brandData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const docRef = doc(db, this.ADMIN_COLLECTION, this.VEHICLE_BRANDS_DOC_ID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        // Document exists, add to existing array
        await updateDoc(docRef, {
          brands: arrayUnion(brandWithTimestamps)
        });
      } else {
        // Document doesn't exist, create new document with array
        await setDoc(docRef, {
          brands: [brandWithTimestamps]
        });
      }
      
      return brandWithTimestamps.id;
    } catch (error) {
      console.error('Error adding vehicle brand:', error);
      throw new Error('Failed to add vehicle brand');
    }
  }

  async updateVehicleBrand(id: string, updates: Partial<VehicleBrand>): Promise<void> {
    try {
      const docRef = doc(db, this.ADMIN_COLLECTION, this.VEHICLE_BRANDS_DOC_ID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const brands = data.brands || [];
        const updatedBrands = brands.map((brand: any) => 
          brand.id === id 
            ? { ...brand, ...updates, updatedAt: new Date() }
            : brand
        );
        
        await updateDoc(docRef, { brands: updatedBrands });
      }
    } catch (error) {
      console.error('Error updating vehicle brand:', error);
      throw new Error('Failed to update vehicle brand');
    }
  }

  async deleteVehicleBrand(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.ADMIN_COLLECTION, this.VEHICLE_BRANDS_DOC_ID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const brands = data.brands || [];
        const brandToRemove = brands.find((brand: any) => brand.id === id);
        
        if (brandToRemove) {
          await updateDoc(docRef, {
            brands: arrayRemove(brandToRemove)
          });
        }
      }
    } catch (error) {
      console.error('Error deleting vehicle brand:', error);
      throw new Error('Failed to delete vehicle brand');
    }
  }

  async getVehicleBrandById(id: string): Promise<VehicleBrand | null> {
    try {
      const docRef = doc(db, this.ADMIN_COLLECTION, this.VEHICLE_BRANDS_DOC_ID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const brands = data.brands || [];
        const brand = brands.find((brand: any) => brand.id === id);
        
        if (brand) {
          return {
            ...brand,
            createdAt: brand.createdAt?.toDate() || new Date(),
            updatedAt: brand.updatedAt?.toDate() || new Date(),
          } as VehicleBrand;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching vehicle brand:', error);
      throw new Error('Failed to fetch vehicle brand');
    }
  }



  async getBrandsByCountry(country: string): Promise<VehicleBrand[]> {
    try {
      const brands = await this.getVehicleBrands();
      return brands.filter(brand => brand.country === country);
    } catch (error) {
      console.error('Error fetching brands by country:', error);
      throw new Error('Failed to fetch brands by country');
    }
  }

  async getActiveBrands(): Promise<VehicleBrand[]> {
    try {
      const brands = await this.getVehicleBrands();
      return brands.filter(brand => brand.status === 'Active');
    } catch (error) {
      console.error('Error fetching active brands:', error);
      throw new Error('Failed to fetch active brands');
    }
  }
}

export const vehicleBrandService = new VehicleBrandService(); 