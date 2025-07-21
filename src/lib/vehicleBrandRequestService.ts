import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from './firebase';

export interface VehicleBrandRequest {
  id: string;
  type: 'brand' | 'model';
  brandName?: string;
  modelName?: string;
  modelDescription?: string;
  vehicleType: 'two_wheeler' | 'four_wheeler' | 'two_wheeler_electric' | 'four_wheeler_electric';
  description: string;
  userEmail: string;
  userName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt?: Date;
  notes?: string;
}

class VehicleBrandRequestService {
  private readonly ADMIN_COLLECTION = 'admin_data';
  private readonly REQUESTS_DOC_ID = 'vehicle_requests';

  async getVehicleBrandRequests(): Promise<VehicleBrandRequest[]> {
    try {
      const docRef = doc(db, this.ADMIN_COLLECTION, this.REQUESTS_DOC_ID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const requests = data.requests || [];
        return requests.map((request: any) => ({
          ...request,
          createdAt: request.createdAt?.toDate() || new Date(),
          updatedAt: request.updatedAt?.toDate() || new Date(),
        })) as VehicleBrandRequest[];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching vehicle brand requests:', error);
      throw new Error('Failed to fetch vehicle brand requests');
    }
  }

  async addVehicleBrandRequest(requestData: Omit<VehicleBrandRequest, 'id' | 'createdAt'>): Promise<string> {
    try {
      const requestWithTimestamps = {
        id: Date.now().toString(),
        ...requestData,
        createdAt: new Date(),
      };
      
      const docRef = doc(db, this.ADMIN_COLLECTION, this.REQUESTS_DOC_ID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        // Document exists, add to existing array
        await updateDoc(docRef, {
          requests: arrayUnion(requestWithTimestamps)
        });
      } else {
        // Document doesn't exist, create new document with array
        await setDoc(docRef, {
          requests: [requestWithTimestamps]
        });
      }
      
      return requestWithTimestamps.id;
    } catch (error) {
      console.error('Error adding vehicle brand request:', error);
      throw new Error('Failed to add vehicle brand request');
    }
  }

  async updateRequestStatus(id: string, status: 'approved' | 'rejected', notes?: string): Promise<void> {
    try {
      const docRef = doc(db, this.ADMIN_COLLECTION, this.REQUESTS_DOC_ID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const requests = data.requests || [];
        const updatedRequests = requests.map((request: any) => 
          request.id === id 
            ? { 
                ...request, 
                status, 
                notes, 
                updatedAt: new Date() 
              }
            : request
        );
        
        await updateDoc(docRef, { requests: updatedRequests });
      }
    } catch (error) {
      console.error('Error updating request status:', error);
      throw new Error('Failed to update request status');
    }
  }

  async deleteRequest(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.ADMIN_COLLECTION, this.REQUESTS_DOC_ID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const requests = data.requests || [];
        const requestToRemove = requests.find((request: any) => request.id === id);
        
        if (requestToRemove) {
          await updateDoc(docRef, {
            requests: arrayRemove(requestToRemove)
          });
        }
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      throw new Error('Failed to delete request');
    }
  }

  async getRequestById(id: string): Promise<VehicleBrandRequest | null> {
    try {
      const docRef = doc(db, this.ADMIN_COLLECTION, this.REQUESTS_DOC_ID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const requests = data.requests || [];
        const request = requests.find((request: any) => request.id === id);
        
        if (request) {
          return {
            ...request,
            createdAt: request.createdAt?.toDate() || new Date(),
            updatedAt: request.updatedAt?.toDate() || new Date(),
          } as VehicleBrandRequest;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching request:', error);
      throw new Error('Failed to fetch request');
    }
  }

  async getRequestsByStatus(status: VehicleBrandRequest['status']): Promise<VehicleBrandRequest[]> {
    try {
      const requests = await this.getVehicleBrandRequests();
      return requests.filter(request => request.status === status);
    } catch (error) {
      console.error('Error fetching requests by status:', error);
      throw new Error('Failed to fetch requests by status');
    }
  }

  async getRequestsByUser(userEmail: string): Promise<VehicleBrandRequest[]> {
    try {
      const requests = await this.getVehicleBrandRequests();
      return requests.filter(request => request.userEmail === userEmail);
    } catch (error) {
      console.error('Error fetching requests by user:', error);
      throw new Error('Failed to fetch requests by user');
    }
  }
}

export const vehicleBrandRequestService = new VehicleBrandRequestService(); 