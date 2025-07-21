import { collection, addDoc, getDocs, doc, updateDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface BrandRequest {
  id?: string;
  brandName: string;
  imageUrl?: string;
  vehicleType: 'Two Wheeler' | 'Four Wheeler' | 'Two Wheeler Electric' | 'Four Wheeler Electric';
  vehicleModels: string[];
  userId: string;
  timestamp: Date;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

class BrandRequestService {
  private readonly COLLECTION_NAME = 'brand_requests';

  async submitBrandRequest(requestData: Omit<BrandRequest, 'id' | 'timestamp' | 'status'>): Promise<string> {
    try {
      const requestWithTimestamp = {
        ...requestData,
        timestamp: Timestamp.now(),
        status: 'pending' as const,
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), requestWithTimestamp);
      return docRef.id;
    } catch (error) {
      console.error('Error submitting brand request:', error);
      throw new Error('Failed to submit brand request');
    }
  }

  async getBrandRequests(): Promise<BrandRequest[]> {
    try {
      console.log('Fetching all brand requests...');
      const q = query(collection(db, this.COLLECTION_NAME));
      const querySnapshot = await getDocs(q);
      
      console.log('Total brand requests found:', querySnapshot.docs.length);
      
      const requests = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('All requests - Document data:', data);
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
          reviewedAt: data.reviewedAt?.toDate() || undefined,
        } as BrandRequest;
      });
      
      // Sort by timestamp in descending order (newest first)
      const sortedRequests = requests.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      console.log('Returning all sorted requests:', sortedRequests.length);
      
      return sortedRequests;
    } catch (error) {
      console.error('Error fetching brand requests:', error);
      throw new Error('Failed to fetch brand requests');
    }
  }

  async getBrandRequestsByUser(userId: string): Promise<BrandRequest[]> {
    try {
      console.log('Fetching brand requests for user:', userId);
      
      if (!userId) {
        console.error('No userId provided');
        return [];
      }

      // First, let's test if we can access the collection at all
      try {
        const testQuery = query(collection(db, this.COLLECTION_NAME));
        const testSnapshot = await getDocs(testQuery);
        console.log('Collection access test successful, total documents:', testSnapshot.docs.length);
        
        // Log all documents to see their structure
        testSnapshot.docs.forEach((doc, index) => {
          console.log(`Document ${index + 1}:`, {
            id: doc.id,
            data: doc.data()
          });
        });
      } catch (testError) {
        console.error('Collection access test failed:', testError);
        throw new Error('Cannot access brand_requests collection. Check Firebase security rules.');
      }

      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId)
      );
      
      console.log('Query created, executing with userId filter:', userId);
      const querySnapshot = await getDocs(q);
      console.log('Query executed, found documents for user:', querySnapshot.docs.length);
      
      const requests = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Document data for user query:', data);
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
          reviewedAt: data.reviewedAt?.toDate() || undefined,
        } as BrandRequest;
      });
      
      // Sort by timestamp in descending order (newest first)
      const sortedRequests = requests.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      console.log('Returning sorted requests:', sortedRequests.length);
      
      return sortedRequests;
    } catch (error) {
      console.error('Error fetching user brand requests:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw new Error('Failed to fetch user brand requests');
    }
  }

  async getPendingBrandRequests(): Promise<BrandRequest[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('status', '==', 'pending')
      );
      const querySnapshot = await getDocs(q);
      
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
        reviewedAt: doc.data().reviewedAt?.toDate() || undefined,
      })) as BrandRequest[];
      
      // Sort by timestamp in descending order (newest first)
      return requests.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('Error fetching pending brand requests:', error);
      throw new Error('Failed to fetch pending brand requests');
    }
  }

  async updateRequestStatus(
    requestId: string, 
    status: 'approved' | 'rejected', 
    notes?: string,
    reviewedBy?: string
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, requestId);
      await updateDoc(docRef, {
        status,
        notes: notes || '',
        reviewedBy: reviewedBy || 'admin',
        reviewedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating request status:', error);
      throw new Error('Failed to update request status');
    }
  }

  async getBrandRequestById(requestId: string): Promise<BrandRequest | null> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('__name__', '==', requestId)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
        reviewedAt: doc.data().reviewedAt?.toDate() || undefined,
      } as BrandRequest;
    } catch (error) {
      console.error('Error fetching brand request by ID:', error);
      throw new Error('Failed to fetch brand request');
    }
  }
}

export const brandRequestService = new BrandRequestService(); 