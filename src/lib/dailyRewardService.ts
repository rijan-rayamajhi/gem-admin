import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export interface DailyRewardConfig {
  id: string;
  gemCoinReward: {
    enabled: boolean;
    minAmount: number;
    maxAmount: number;
    cooldownHours: number; // 24 hours default
  };
  businessCatalogueReward: {
    enabled: boolean;
    enabledCategories: string[];
    cooldownHours: number; // 24 hours default
  };
  scratchCardConfig: {
    enabled: boolean;
    cardDesign: string; // URL to card image
    scratchArea: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
  updatedAt?: Date;
}

const DAILY_REWARD_CONFIG_ID = 'daily_reward_config';

export const dailyRewardService = {
  // Get daily reward configuration
  async getDailyRewardConfig(): Promise<DailyRewardConfig> {
    try {
      const configDoc = doc(db, 'admin_data', DAILY_REWARD_CONFIG_ID);
      const docSnapshot = await getDoc(configDoc);
      
      if (!docSnapshot.exists()) {
        // Initialize with default configuration
        const defaultConfig: DailyRewardConfig = {
          id: DAILY_REWARD_CONFIG_ID,
          gemCoinReward: {
            enabled: true,
            minAmount: 10,
            maxAmount: 100,
            cooldownHours: 24,
          },
          businessCatalogueReward: {
            enabled: false,
            enabledCategories: [],
            cooldownHours: 24,
          },
          scratchCardConfig: {
            enabled: true,
            cardDesign: '',
            scratchArea: {
              x: 50,
              y: 100,
              width: 200,
              height: 100,
            },
          },
          updatedAt: new Date(),
        };
        
        await setDoc(configDoc, defaultConfig);
        return defaultConfig;
      }
      
      const data = docSnapshot.data();
      return {
        id: data.id || DAILY_REWARD_CONFIG_ID,
        gemCoinReward: data.gemCoinReward || {
          enabled: true,
          minAmount: 10,
          maxAmount: 100,
          cooldownHours: 24,
        },
        businessCatalogueReward: data.businessCatalogueReward || {
          enabled: false,
          enabledCategories: [],
          cooldownHours: 24,
        },
        scratchCardConfig: data.scratchCardConfig || {
          enabled: true,
          cardDesign: '',
          scratchArea: {
            x: 50,
            y: 100,
            width: 200,
            height: 100,
          },
        },
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    } catch (error) {
      console.error('Error fetching daily reward config:', error);
      throw error;
    }
  },

  // Update daily reward configuration
  async updateDailyRewardConfig(updates: Partial<DailyRewardConfig>): Promise<void> {
    try {
      const configDoc = doc(db, 'admin_data', DAILY_REWARD_CONFIG_ID);
      await updateDoc(configDoc, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating daily reward config:', error);
      throw error;
    }
  },

  // Update gem coin reward settings
  async updateGemCoinReward(gemCoinReward: DailyRewardConfig['gemCoinReward']): Promise<void> {
    try {
      await this.updateDailyRewardConfig({ gemCoinReward });
    } catch (error) {
      console.error('Error updating gem coin reward:', error);
      throw error;
    }
  },

  // Update business catalogue reward settings
  async updateBusinessCatalogueReward(businessCatalogueReward: DailyRewardConfig['businessCatalogueReward']): Promise<void> {
    try {
      await this.updateDailyRewardConfig({ businessCatalogueReward });
    } catch (error) {
      console.error('Error updating business catalogue reward:', error);
      throw error;
    }
  },

  // Update scratch card configuration
  async updateScratchCardConfig(scratchCardConfig: DailyRewardConfig['scratchCardConfig']): Promise<void> {
    try {
      await this.updateDailyRewardConfig({ scratchCardConfig });
    } catch (error) {
      console.error('Error updating scratch card config:', error);
      throw error;
    }
  },
}; 