export enum CashoutStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PROCESSED = 'processed'
}

export interface CashoutRequest {
  id: string;
  userId: string;
  userName: string;
  phoneNumber: string;
  whatsappNumber: string;
  upiId: string;
  amount: number;
  status: CashoutStatus;
  requestedAt: Date;
  processedAt?: Date;
  processedBy?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface CashoutRequestUpdate {
  status: CashoutStatus;
  processedBy: string;
  rejectionReason?: string;
  notes?: string;
}
