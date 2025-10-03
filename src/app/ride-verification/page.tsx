'use client';

import { RideVerificationProvider } from '@/features/ride-verification/presentation/providers/RideVerificationProvider';
import RideVerificationPage from '@/features/ride-verification/presentation/components/RideVerificationPage';

export default function Page() {
  return (
    <RideVerificationProvider>
      <RideVerificationPage />
    </RideVerificationProvider>
  );
}
