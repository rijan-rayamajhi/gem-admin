export enum VehicleVerificationStatus {
  PENDING = 'pending',
  REJECTED = 'rejected',
  VERIFIED = 'verified',
  NOT_VERIFIED = 'notVerified'
}

export const VehicleVerificationStatusLabels = {
  [VehicleVerificationStatus.PENDING]: 'Pending',
  [VehicleVerificationStatus.REJECTED]: 'Rejected',
  [VehicleVerificationStatus.VERIFIED]: 'Verified',
  [VehicleVerificationStatus.NOT_VERIFIED]: 'Not Verified'
};

export const VehicleVerificationStatusColors = {
  [VehicleVerificationStatus.PENDING]: 'text-yellow-600 bg-yellow-100',
  [VehicleVerificationStatus.REJECTED]: 'text-red-600 bg-red-100',
  [VehicleVerificationStatus.VERIFIED]: 'text-green-600 bg-green-100',
  [VehicleVerificationStatus.NOT_VERIFIED]: 'text-gray-600 bg-gray-100'
};
