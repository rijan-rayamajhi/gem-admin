export interface MonetizationSettings {
  id: string;
  
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
