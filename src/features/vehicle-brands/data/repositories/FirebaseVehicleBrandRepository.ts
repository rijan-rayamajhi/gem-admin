import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { VehicleBrandRepository } from '../../domain/repositories/VehicleBrandRepository';
import { VehicleBrand, CreateVehicleBrandRequest, UpdateVehicleBrandRequest } from '../../domain/entities/VehicleBrand';

export class FirebaseVehicleBrandRepository implements VehicleBrandRepository {
  private collectionName = 'vehicleBrands';

  async getAllVehicleBrands(): Promise<VehicleBrand[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('name', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as VehicleBrand[];
    } catch (error) {
      console.error('Error getting vehicle brands:', error);
      throw new Error('Failed to fetch vehicle brands');
    }
  }

  async getVehicleBrandById(id: string): Promise<VehicleBrand | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate(),
          updatedAt: docSnap.data().updatedAt?.toDate(),
        } as VehicleBrand;
      }
      return null;
    } catch (error) {
      console.error('Error getting vehicle brand:', error);
      throw new Error('Failed to fetch vehicle brand');
    }
  }

  async createVehicleBrand(request: CreateVehicleBrandRequest): Promise<VehicleBrand> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...request,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      return {
        id: docRef.id,
        ...request,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error creating vehicle brand:', error);
      throw new Error('Failed to create vehicle brand');
    }
  }

  async updateVehicleBrand(request: UpdateVehicleBrandRequest): Promise<VehicleBrand> {
    try {
      const { id, ...updateData } = request;
      const docRef = doc(db, this.collectionName, id);
      
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
      
      // Fetch updated document
      const updatedDoc = await getDoc(docRef);
      if (updatedDoc.exists()) {
        return {
          id: updatedDoc.id,
          ...updatedDoc.data(),
          createdAt: updatedDoc.data().createdAt?.toDate(),
          updatedAt: updatedDoc.data().updatedAt?.toDate(),
        } as VehicleBrand;
      }
      
      throw new Error('Failed to fetch updated vehicle brand');
    } catch (error) {
      console.error('Error updating vehicle brand:', error);
      throw new Error('Failed to update vehicle brand');
    }
  }

  async deleteVehicleBrand(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting vehicle brand:', error);
      throw new Error('Failed to delete vehicle brand');
    }
  }

  async getVehicleBrandsByType(vehicleType: string): Promise<VehicleBrand[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('vehicleType', '==', vehicleType),
        orderBy('name', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as VehicleBrand[];
    } catch (error) {
      console.error('Error getting vehicle brands by type:', error);
      throw new Error('Failed to fetch vehicle brands by type');
    }
  }
}
