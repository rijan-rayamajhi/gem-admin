export interface DrivingLicense {
  id: string;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  licenseType: string;
  frontImagePath: string;
  backImagePath: string;
  dob: Date;
  verificationStatus: VerificationStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
  notes?: string;
}

export enum VerificationStatus {
  PENDING = 'pending',
  REJECTED = 'rejected',
  VERIFIED = 'verified'
}

export interface DrivingLicenseUpdate {
  id: string;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  notes?: string;
  reviewedBy: string;
}
