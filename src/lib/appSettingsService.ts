import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface AppSettings {
  // Basic App Information
  appName: string;
  appVersion: string;
  appDescription: string;
  appTagline: string;
  totalGemCoins: string;
  totalDistance: string;
  totalRides: string;
  referAndEarnText: string;
  
  // Legal & Compliance
  termsAndConditions: string;
  privacyPolicy: string;
  
  // Contact Information
  contactEmail: string;
  contactPhone: string;
  website: string;
  supportEmail: string;
  
  // Social Media
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    whatsapp?: string;
  };

  // Branding
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string;
    faviconUrl: string;
    appIconUrl: string;
  };
  
  // Feature Flags
  features: {
    enableNotifications: boolean;
    enableLocationServices: boolean;
    enableAnalytics: boolean;
    enablePushNotifications: boolean;
    maintenanceMode: boolean;
    enableUserRegistration: boolean;
    enableEmailVerification: boolean;
  };
  
  // App Limits & Configuration
  limits: {
    maxFileSize: number;
    maxEventImages: number;
    maxEventDuration: number;
    maxAttendeesPerEvent: number;
    maxEventsPerUser: number;
    maxTeamMembers: number;
  };
  
  // Metadata
  lastUpdated: Date;
  createdBy: string;
  isActive: boolean;
}

class AppSettingsService {
  private readonly COLLECTION_NAME = 'admin_data';
  private readonly DOCUMENT_ID = 'app_settings';

  async getAppSettings(): Promise<AppSettings | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, this.DOCUMENT_ID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
        } as AppSettings;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching app settings:', error);
      throw new Error('Failed to fetch app settings');
    }
  }

  async initializeDefaultSettings(): Promise<void> {
    const defaultSettings: AppSettings = {
      // Basic App Information
      appName: 'GEM Admin',
      appVersion: '1.0.0',
      appDescription: 'Comprehensive admin dashboard for GEM platform management',
      appTagline: 'Empowering event management and business growth',
      totalGemCoins: '1,000,000',
      totalDistance: '50,000 km',
      totalRides: '10,000',
      referAndEarnText: 'Refer your friends and earn rewards! Share your referral code and both you and your friend will get bonus gem coins.',
      
      // Legal & Compliance
      termsAndConditions: 'By using this application, you agree to our terms and conditions...',
      privacyPolicy: 'We value your privacy and are committed to protecting your personal information...',
      
      // Contact Information
      contactEmail: 'support@gemadmin.com',
      contactPhone: '+1 (555) 123-4567',
      website: 'https://gemadmin.com',
      supportEmail: 'help@gemadmin.com',
      
      // Social Media
      socialMedia: {
        facebook: 'https://facebook.com/gemadmin',
        twitter: 'https://twitter.com/gemadmin',
        instagram: 'https://instagram.com/gemadmin',
        linkedin: 'https://linkedin.com/company/gemadmin',
      },
      
      // Branding
      branding: {
        primaryColor: '#3B82F6',
        secondaryColor: '#1F2937',
        logoUrl: '/app_logo.png',
        faviconUrl: '/favicon.ico',
        appIconUrl: '/app_logo.png',
      },
      
      // Feature Flags
      features: {
        enableNotifications: true,
        enableLocationServices: true,
        enableAnalytics: true,
        enablePushNotifications: true,
        maintenanceMode: false,
        enableUserRegistration: true,
        enableEmailVerification: true,
      },
      
      // App Limits & Configuration
      limits: {
        maxFileSize: 10,
        maxEventImages: 10,
        maxEventDuration: 30,
        maxAttendeesPerEvent: 1000,
        maxEventsPerUser: 50,
        maxTeamMembers: 20,
      },
      
      // Metadata
      lastUpdated: new Date(),
      createdBy: 'system',
      isActive: true,
    };

    try {
      await setDoc(doc(db, this.COLLECTION_NAME, this.DOCUMENT_ID), defaultSettings);
    } catch (error) {
      console.error('Error initializing default settings:', error);
      throw new Error('Failed to initialize default settings');
    }
  }

  async updateAppSettings(updates: Partial<AppSettings>): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, this.DOCUMENT_ID);
      const updateData = {
        ...updates,
        lastUpdated: new Date(),
      };
      await setDoc(docRef, updateData, { merge: true });
    } catch (error) {
      console.error('Error updating app settings:', error);
      throw new Error('Failed to update app settings');
    }
  }

  async updateSpecificSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, this.DOCUMENT_ID);
      await updateDoc(docRef, {
        [key]: value,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
      throw new Error(`Failed to update setting ${key}`);
    }
  }

  async toggleFeature(featureName: keyof AppSettings['features']): Promise<void> {
    try {
      const currentSettings = await this.getAppSettings();
      if (!currentSettings) {
        throw new Error('No settings found');
      }

      const newFeatures = {
        ...currentSettings.features,
        [featureName]: !currentSettings.features[featureName],
      };

      await this.updateSpecificSetting('features', newFeatures);
    } catch (error) {
      console.error(`Error toggling feature ${featureName}:`, error);
      throw new Error(`Failed to toggle feature ${featureName}`);
    }
  }

  async updateBranding(brandingUpdates: Partial<AppSettings['branding']>): Promise<void> {
    try {
      const currentSettings = await this.getAppSettings();
      if (!currentSettings) {
        throw new Error('No settings found');
      }

      const newBranding = {
        ...currentSettings.branding,
        ...brandingUpdates,
      };

      await this.updateSpecificSetting('branding', newBranding);
    } catch (error) {
      console.error('Error updating branding:', error);
      throw new Error('Failed to update branding');
    }
  }

  async updateLimits(limitsUpdates: Partial<AppSettings['limits']>): Promise<void> {
    try {
      const currentSettings = await this.getAppSettings();
      if (!currentSettings) {
        throw new Error('No settings found');
      }

      const newLimits = {
        ...currentSettings.limits,
        ...limitsUpdates,
      };

      await this.updateSpecificSetting('limits', newLimits);
    } catch (error) {
      console.error('Error updating limits:', error);
      throw new Error('Failed to update limits');
    }
  }

  async setMaintenanceMode(enabled: boolean): Promise<void> {
    try {
      await this.toggleFeature('maintenanceMode');
    } catch (error) {
      console.error('Error setting maintenance mode:', error);
      throw new Error('Failed to set maintenance mode');
    }
  }

  async getAppInfo(): Promise<{
    appName: string;
    appVersion: string;
    appDescription: string;
    appTagline: string;
    totalGemCoins: string;
    totalDistance: string;
    totalRides: string;
    referAndEarnText: string;
  }> {
    const settings = await this.getAppSettings();
    if (!settings) {
      throw new Error('No settings found');
    }

    return {
      appName: settings.appName,
      appVersion: settings.appVersion,
      appDescription: settings.appDescription,
      appTagline: settings.appTagline,
      totalGemCoins: settings.totalGemCoins,
      totalDistance: settings.totalDistance,
      totalRides: settings.totalRides,
      referAndEarnText: settings.referAndEarnText,
    };
  }
}

export const appSettingsService = new AppSettingsService(); 