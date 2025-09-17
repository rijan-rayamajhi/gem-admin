export interface Earnings {
  id: string;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  totalWithdrawn: number;
  performanceScore: number;
  lastUpdated: Date;
  createdAt: Date;
}

export interface EarningsUpdate {
  userId: string;
  amount: number;
  performanceScore?: number;
  reason?: string;
}
