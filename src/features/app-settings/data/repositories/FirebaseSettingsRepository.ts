import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SettingsRepository } from '../../domain/repositories/SettingsRepository';
import { AppSettings, defaultAppSettings, FAQ } from '../../domain/entities/AppSettings';

const SETTINGS_COLLECTION = 'admin_data';
const SETTINGS_DOC_ID = 'app_settings';

export class FirebaseSettingsRepository implements SettingsRepository {
  private getSettingsDoc() {
    return doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
  }

  async getSettings(): Promise<AppSettings> {
    try {
      const settingsDoc = this.getSettingsDoc();
      const docSnap = await getDoc(settingsDoc);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Map Firestore data to AppSettings interface
        return {
          appName: data.appName || '',
          appTagline: data.appTagline || '',
          termsAndConditionLink: data.termsAndConditionLink || '',
          email: data.email || '',
          whatsappNumber: data.whatsappNumber || '',
          phoneNumber: data.phoneNumber || '',
          appVersion: data.appVersion || '',
          faqs: data.faqs || [],
        };
      }
      
      return defaultAppSettings;
    } catch (error) {
      console.error('Failed to load settings from Firebase:', error);
      return defaultAppSettings;
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      const settingsDoc = this.getSettingsDoc();
      await setDoc(settingsDoc, {
        ...settings,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }, { merge: true });
    } catch (error) {
      console.error('Failed to save settings to Firebase:', error);
      throw new Error('Failed to save settings');
    }
  }

  async resetSettings(): Promise<void> {
    try {
      const settingsDoc = this.getSettingsDoc();
      await deleteDoc(settingsDoc);
    } catch (error) {
      console.error('Failed to reset settings in Firebase:', error);
      throw new Error('Failed to reset settings');
    }
  }
}
