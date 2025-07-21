import { db } from './firebase';
import { collection, doc, getDocs, updateDoc, addDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';

export interface ModelRequest {
  id: string;
  brandName: string;
  modelName: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  userId: string;
  vehicleType: string;
  brandID: string;
  user_name?: string;
  user_email?: string;
  notes?: string;
}

export const modelRequestService = {
  // Get all model requests
  async getModelRequests(): Promise<ModelRequest[]> {
    try {
      const modelRequestsCollection = collection(db, 'model_requests');
      const querySnapshot = await getDocs(modelRequestsCollection);
      
      const modelRequests: ModelRequest[] = [];
      
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        
        // Debug logging for model request data
        console.log('Model request data for doc', doc.id, ':', {
          brandName: data.brandName,
          modelName: data.modelName,
          brandID: data.brandID,
          brandId: data.brandId, // Check for alternative field name
          vehicleType: data.vehicleType,
          status: data.status,
          timestamp: data.timestamp,
          userId: data.userId,
          allFields: Object.keys(data)
        });
        
        modelRequests.push({
          id: doc.id,
          brandName: data.brandName || '',
          modelName: data.modelName || '',
          status: data.status || 'pending',
          timestamp: data.timestamp || '',
          userId: data.userId || '',
          vehicleType: data.vehicleType || '',
          brandID: data.brandID || data.brandId || '', // Try both field names
          notes: data.notes || '',
        });
      }
      
      return modelRequests;
    } catch (error) {
      console.error('Error fetching model requests:', error);
      throw error;
    }
  },

  // Get model requests by status
  async getModelRequestsByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<ModelRequest[]> {
    try {
      const modelRequestsCollection = collection(db, 'model_requests');
      const q = query(modelRequestsCollection, where('status', '==', status));
      const querySnapshot = await getDocs(q);
      
      const modelRequests: ModelRequest[] = [];
      
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        modelRequests.push({
          id: doc.id,
          brandName: data.brandName || '',
          modelName: data.modelName || '',
          status: data.status || 'pending',
          timestamp: data.timestamp || '',
          userId: data.userId || '',
          vehicleType: data.vehicleType || '',
          brandID: data.brandID || '',
          notes: data.notes || '',
        });
      }
      
      return modelRequests;
    } catch (error) {
      console.error('Error fetching model requests by status:', error);
      throw error;
    }
  },

  // Update model request status
  async updateModelRequestStatus(
    requestId: string,
    status: 'pending' | 'approved' | 'rejected',
    notes?: string
  ): Promise<void> {
    try {
      const requestRef = doc(db, 'model_requests', requestId);
      await updateDoc(requestRef, {
        status: status,
        notes: notes || '',
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating model request status:', error);
      throw error;
    }
  },

  // Delete model request
  async deleteModelRequest(requestId: string): Promise<void> {
    try {
      const requestRef = doc(db, 'model_requests', requestId);
      await deleteDoc(requestRef);
    } catch (error) {
      console.error('Error deleting model request:', error);
      throw error;
    }
  },

  // Add new model request
  async addModelRequest(request: Omit<ModelRequest, 'id'>): Promise<string> {
    try {
      const modelRequestsCollection = collection(db, 'model_requests');
      const docRef = await addDoc(modelRequestsCollection, {
        ...request,
        timestamp: new Date().toISOString(),
        status: 'pending',
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding model request:', error);
      throw error;
    }
  },
}; 