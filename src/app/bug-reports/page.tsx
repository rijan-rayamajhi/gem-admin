'use client';

import { BugReportProvider } from '@/features/bug-reports/presentation/providers/BugReportProvider';
import BugReportPage from '@/features/bug-reports/presentation/components/BugReportPage';

export default function BugReportsPage() {
  return (
    <BugReportProvider>
      <BugReportPage />
    </BugReportProvider>
  );
}
