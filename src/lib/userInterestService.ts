import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface UserInterest {
  id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
}

export interface UserInterestSettings {
  interests: UserInterest[];
  lastUpdated: Date;
}

export const userInterestService = {
  async getSettings(): Promise<UserInterestSettings> {
    try {
      const docRef = doc(db, 'admin_data', 'user_interests');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const interests = data.interests || [];
        
        // Clean up any existing interests that have icon field
        const cleanedInterests = interests.map((interest: any) => {
          const { icon, ...cleanInterest } = interest;
          return cleanInterest;
        });
        
        return {
          interests: cleanedInterests,
          lastUpdated: data.lastUpdated?.toDate() || new Date()
        };
      } else {
        // Initialize with empty settings
        const emptySettings: UserInterestSettings = {
          interests: [],
          lastUpdated: new Date()
        };
        await this.updateSettings(emptySettings);
        return emptySettings;
      }
    } catch (error) {
      console.error('Error fetching user interest settings:', error);
      throw error;
    }
  },

  async updateSettings(settings: UserInterestSettings): Promise<void> {
    try {
      const docRef = doc(db, 'admin_data', 'user_interests');
      await setDoc(docRef, {
        ...settings,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error updating user interest settings:', error);
      throw error;
    }
  },

  async updateInterest(interestId: string, updates: Partial<UserInterest>): Promise<void> {
    try {
      const settings = await this.getSettings();
      const updatedInterests = settings.interests.map(interest => 
        interest.id === interestId ? { ...interest, ...updates } : interest
      );
      
      await this.updateSettings({
        ...settings,
        interests: updatedInterests
      });
    } catch (error) {
      console.error('Error updating user interest:', error);
      throw error;
    }
  },

  async addInterest(interest: Omit<UserInterest, 'id'>): Promise<void> {
    try {
      const settings = await this.getSettings();
      const newInterest: UserInterest = {
        ...interest,
        id: `interest-${Date.now()}`
      };
      
      await this.updateSettings({
        ...settings,
        interests: [...settings.interests, newInterest]
      });
    } catch (error) {
      console.error('Error adding user interest:', error);
      throw error;
    }
  },

  async deleteInterest(interestId: string): Promise<void> {
    try {
      const settings = await this.getSettings();
      const updatedInterests = settings.interests.filter(interest => interest.id !== interestId);
      
      await this.updateSettings({
        ...settings,
        interests: updatedInterests
      });
    } catch (error) {
      console.error('Error deleting user interest:', error);
      throw error;
    }
  },

  // Migration function to clean up icon fields from existing data
  async migrateRemoveIconField(): Promise<void> {
    try {
      const settings = await this.getSettings();
      const cleanedInterests = settings.interests.map((interest: any) => {
        const { icon, ...cleanInterest } = interest;
        return cleanInterest;
      });
      
      await this.updateSettings({
        ...settings,
        interests: cleanedInterests
      });
      
      console.log('Successfully migrated and removed icon fields from user interests');
    } catch (error) {
      console.error('Error during migration:', error);
      throw error;
    }
  }
}; 