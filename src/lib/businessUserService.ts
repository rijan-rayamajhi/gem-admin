import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface BusinessUser {
  id: string;
  businessName: string;
  selectedCategoryName?: string;
  selectedOtherCategoryName?: string;
  isOtherCategory?: boolean;
  businessType: 'Offline' | 'Online' | 'Both';
  businessInfo: {
    offline?: Array<{
      shopLocation: {
        address: string;
        city: string;
        state?: string;
        zipCode?: string;
      };
    }>;
    online?: {
      website: string;
    };
  };
  personalInfo: {
    email: string;
    phoneNumber: string;
  };
  isActive: boolean;
  verificationStatus: 'pending' | 'notVerified' | 'verified' | 'rejected';
  createdAt?: any;
  updatedAt?: any;
}

export const businessUserService = {
  // Get all business users
  async getAllBusinessUsers(): Promise<BusinessUser[]> {
    try {
      const businessUsersRef = collection(db, 'business_users');
      const q = query(businessUsersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const businessUsers: BusinessUser[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        businessUsers.push({
          id: doc.id,
          ...data,
        } as BusinessUser);
      });
      
      return businessUsers;
    } catch (error) {
      console.error('Error fetching business users:', error);
      throw error;
    }
  },

  // Get business user by ID
  async getBusinessUserById(id: string): Promise<BusinessUser | null> {
    try {
      const businessUserRef = doc(db, 'business_users', id);
      const businessUserSnap = await getDoc(businessUserRef);
      
      if (businessUserSnap.exists()) {
        return {
          id: businessUserSnap.id,
          ...businessUserSnap.data(),
        } as BusinessUser;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching business user:', error);
      throw error;
    }
  },

  // Update business user
  async updateBusinessUser(id: string, data: Partial<BusinessUser>): Promise<void> {
    try {
      const businessUserRef = doc(db, 'business_users', id);
      await updateDoc(businessUserRef, {
        ...data,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating business user:', error);
      throw error;
    }
  },

  // Update business user status
  async updateBusinessUserStatus(id: string, isActive: boolean): Promise<void> {
    try {
      const businessUserRef = doc(db, 'business_users', id);
      await updateDoc(businessUserRef, {
        isActive,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating business user status:', error);
      throw error;
    }
  },

  // Update verification status
  async updateVerificationStatus(id: string, verificationStatus: BusinessUser['verificationStatus']): Promise<void> {
    try {
      const businessUserRef = doc(db, 'business_users', id);
      await updateDoc(businessUserRef, {
        verificationStatus,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating verification status:', error);
      throw error;
    }
  },

  // Delete business user
  async deleteBusinessUser(id: string): Promise<void> {
    try {
      const businessUserRef = doc(db, 'business_users', id);
      await deleteDoc(businessUserRef);
    } catch (error) {
      console.error('Error deleting business user:', error);
      throw error;
    }
  },
}; 