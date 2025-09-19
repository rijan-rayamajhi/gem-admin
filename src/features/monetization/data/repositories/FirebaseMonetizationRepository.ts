import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  setDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MonetizationRepository } from '../../domain/repositories/MonetizationRepository';
import { Earnings, EarningsUpdate } from '../../domain/entities/Earnings';
import { CashoutRequest, CashoutRequestUpdate, CashoutStatus } from '../../domain/entities/CashoutRequest';
import { MonetizationSettings, MonetizationSettingsUpdate } from '../../domain/entities/MonetizationSettings';

export class FirebaseMonetizationRepository implements MonetizationRepository {
  private earningsCollection = collection(db, 'earnings');
  private cashoutRequestsCollection = collection(db, 'cashout_requests');
  private settingsDocRef = doc(db, 'admin_data', 'monetization_settings');

  private parseDate(dateValue: unknown): Date | undefined {
    if (!dateValue) return undefined;
    
    // If it's a Firestore Timestamp
    if (dateValue instanceof Timestamp) {
      return dateValue.toDate();
    }
    
    // If it's already a Date object
    if (dateValue instanceof Date) {
      return dateValue;
    }
    
    // If it's a string (ISO format)
    if (typeof dateValue === 'string') {
      return new Date(dateValue);
    }
    
    // Fallback to current date
    return new Date();
  }

  // Earnings Management
  async getEarnings(userId: string): Promise<Earnings | null> {
    const q = query(this.earningsCollection, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      ...data,
      lastUpdated: data.lastUpdated?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Earnings;
  }

  async getAllEarnings(): Promise<Earnings[]> {
    const querySnapshot = await getDocs(this.earningsCollection);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        lastUpdated: data.lastUpdated?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Earnings;
    });
  }

  async updateEarnings(update: EarningsUpdate): Promise<void> {
    const q = query(this.earningsCollection, where('userId', '==', update.userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Earnings record not found');
    }
    
    const docRef = doc(this.earningsCollection, querySnapshot.docs[0].id);
    await updateDoc(docRef, {
      ...update,
      lastUpdated: serverTimestamp(),
    });
  }

  async createEarnings(earnings: Earnings): Promise<void> {
    await addDoc(this.earningsCollection, {
      ...earnings,
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp(),
    });
  }

  // Cashout Request Management
  async getCashoutRequest(requestId: string): Promise<CashoutRequest | null> {
    const docRef = doc(this.cashoutRequestsCollection, requestId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      requestedAt: this.parseDate(data.requestedAt) || new Date(),
      processedAt: this.parseDate(data.processedAt),
    } as CashoutRequest;
  }

  async getAllCashoutRequests(): Promise<CashoutRequest[]> {
    const q = query(this.cashoutRequestsCollection, orderBy('requestedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        requestedAt: this.parseDate(data.requestedAt),
        processedAt: this.parseDate(data.processedAt),
      } as CashoutRequest;
    });
  }

  async getCashoutRequestsByStatus(status: CashoutStatus): Promise<CashoutRequest[]> {
    const q = query(
      this.cashoutRequestsCollection, 
      where('status', '==', status),
      orderBy('requestedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        requestedAt: this.parseDate(data.requestedAt) || new Date(),
        processedAt: this.parseDate(data.processedAt),
      } as CashoutRequest;
    });
  }

  async getCashoutRequestsByUser(userId: string): Promise<CashoutRequest[]> {
    const q = query(
      this.cashoutRequestsCollection, 
      where('userId', '==', userId),
      orderBy('requestedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        requestedAt: this.parseDate(data.requestedAt) || new Date(),
        processedAt: this.parseDate(data.processedAt),
      } as CashoutRequest;
    });
  }

  async createCashoutRequest(request: CashoutRequest): Promise<void> {
    await addDoc(this.cashoutRequestsCollection, {
      ...request,
      requestedAt: serverTimestamp(),
    });
  }

  async updateCashoutRequest(requestId: string, update: CashoutRequestUpdate): Promise<void> {
    const docRef = doc(this.cashoutRequestsCollection, requestId);
    await updateDoc(docRef, {
      ...update,
      processedAt: serverTimestamp(),
    });
  }

  // Monetization Settings
  async getMonetizationSettings(): Promise<MonetizationSettings | null> {
    const docSnap = await getDoc(this.settingsDocRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data();
    
    return {
      id: docSnap.id,
      ...data,
      lastUpdated: data.lastUpdated?.toDate() || new Date(),
    } as MonetizationSettings;
  }

  async updateMonetizationSettings(update: MonetizationSettingsUpdate): Promise<void> {
    await updateDoc(this.settingsDocRef, {
      ...update,
      lastUpdated: serverTimestamp(),
    });
  }

  async createMonetizationSettings(settings: MonetizationSettings): Promise<void> {
    await setDoc(this.settingsDocRef, {
      ...settings,
      lastUpdated: serverTimestamp(),
    });
  }
}
