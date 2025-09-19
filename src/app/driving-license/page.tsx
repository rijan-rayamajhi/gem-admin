'use client';

import { DrivingLicenseProvider } from '@/features/driving-license/presentation/providers/DrivingLicenseProvider';
import DrivingLicensePage from '@/features/driving-license/presentation/components/DrivingLicensePage';
import { AuthGuard } from '@/features/auth/presentation/components/AuthGuard';

export default function Page() {
  return (
    <AuthGuard>
      <DrivingLicenseProvider>
        <DrivingLicensePage />
      </DrivingLicenseProvider>
    </AuthGuard>
  );
}
