export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface MonetizationSettings {
  id: string;
  
  // Monetization Message
  monetizationMessage: string;
  
  // FAQs
  faqs: FAQ[];
  
  // For All Users
  allowCashout: boolean;
  predefinedAmounts: number[];
  bankBalance: number;
  conversionRate: number; // Gem coins to cash conversion rate
  cashoutParams: {
    minimumRides: number;
    minimumDistance: number;
    minimumReferrals: number;
  };
  gstPercentage: number;
  platformCharge: number;
  otherCharge: number;
  
  // For Monetized Users
  // No conditions - they can cashout freely
  
  // For Unmonetized Users
  limitBasedCashout: boolean;
  timeLimit: number; // in days
  maxLimitCashout: number;
  minCashout: number;
  
  lastUpdated: Date;
  updatedBy: string;
}

export interface MonetizationSettingsUpdate {
  monetizationMessage?: string;
  faqs?: FAQ[];
  allowCashout?: boolean;
  predefinedAmounts?: number[];
  bankBalance?: number;
  conversionRate?: number;
  cashoutParams?: {
    minimumRides?: number;
    minimumDistance?: number;
    minimumReferrals?: number;
  };
  gstPercentage?: number;
  platformCharge?: number;
  otherCharge?: number;
  limitBasedCashout?: boolean;
  timeLimit?: number;
  maxLimitCashout?: number;
  minCashout?: number;
  lastUpdated?: Date;
  updatedBy?: string;
}
