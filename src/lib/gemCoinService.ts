import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface GemCoinAction {
  id: string;
  name: string;
  description: string;
  coinValue: number;
  isActive: boolean;
}

export interface GemCoinSettings {
  actions: GemCoinAction[];
  lastUpdated: Date;
}

export const gemCoinService = {
  async getSettings(): Promise<GemCoinSettings> {
    try {
      const docRef = doc(db, 'admin_data', 'gem_coin');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          actions: data.actions || [],
          lastUpdated: data.lastUpdated?.toDate() || new Date()
        };
      } else {
        // Initialize with empty settings
        const emptySettings: GemCoinSettings = {
          actions: [],
          lastUpdated: new Date()
        };
        await this.updateSettings(emptySettings);
        return emptySettings;
      }
    } catch (error) {
      console.error('Error fetching gem coin settings:', error);
      throw error;
    }
  },

  async updateSettings(settings: GemCoinSettings): Promise<void> {
    try {
      const docRef = doc(db, 'admin_data', 'gem_coin');
      await setDoc(docRef, {
        ...settings,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error updating gem coin settings:', error);
      throw error;
    }
  },

  async updateAction(actionId: string, updates: Partial<GemCoinAction>): Promise<void> {
    try {
      const settings = await this.getSettings();
      const updatedActions = settings.actions.map(action => 
        action.id === actionId ? { ...action, ...updates } : action
      );
      
      await this.updateSettings({
        ...settings,
        actions: updatedActions
      });
    } catch (error) {
      console.error('Error updating gem coin action:', error);
      throw error;
    }
  },

  async addAction(action: Omit<GemCoinAction, 'id'>): Promise<void> {
    try {
      const settings = await this.getSettings();
      const newAction: GemCoinAction = {
        ...action,
        id: `action-${Date.now()}`
      };
      
      await this.updateSettings({
        ...settings,
        actions: [...settings.actions, newAction]
      });
    } catch (error) {
      console.error('Error adding gem coin action:', error);
      throw error;
    }
  },

  async deleteAction(actionId: string): Promise<void> {
    try {
      const settings = await this.getSettings();
      const updatedActions = settings.actions.filter(action => action.id !== actionId);
      
      await this.updateSettings({
        ...settings,
        actions: updatedActions
      });
    } catch (error) {
      console.error('Error deleting gem coin action:', error);
      throw error;
    }
  }
}; 