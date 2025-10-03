import VehicleVerificationPage from '@/features/vehicle-verification/presentation/components/VehicleVerificationPage';
import { AuthGuard } from '@/features/auth/presentation/components/AuthGuard';

export default function Page() {
  return (
    <AuthGuard>
      <VehicleVerificationPage />
    </AuthGuard>
  );
}
