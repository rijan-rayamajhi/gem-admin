import { Earnings, EarningsUpdate } from '../entities/Earnings';
import { CashoutRequest, CashoutRequestUpdate, CashoutStatus } from '../entities/CashoutRequest';
import { MonetizationSettings, MonetizationSettingsUpdate } from '../entities/MonetizationSettings';

export interface MonetizationRepository {
  // Earnings Management
  getEarnings(userId: string): Promise<Earnings | null>;
  getAllEarnings(): Promise<Earnings[]>;
  updateEarnings(update: EarningsUpdate): Promise<void>;
  createEarnings(earnings: Earnings): Promise<void>;

  // Cashout Request Management
  getCashoutRequest(requestId: string): Promise<CashoutRequest | null>;
  getAllCashoutRequests(): Promise<CashoutRequest[]>;
  getCashoutRequestsByStatus(status: CashoutStatus): Promise<CashoutRequest[]>;
  getCashoutRequestsByUser(userId: string): Promise<CashoutRequest[]>;
  createCashoutRequest(request: CashoutRequest): Promise<void>;
  updateCashoutRequest(requestId: string, update: CashoutRequestUpdate): Promise<void>;

  // Monetization Settings
  getMonetizationSettings(): Promise<MonetizationSettings | null>;
  updateMonetizationSettings(update: MonetizationSettingsUpdate): Promise<void>;
  createMonetizationSettings(settings: MonetizationSettings): Promise<void>;
}
