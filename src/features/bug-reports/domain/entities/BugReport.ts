export interface BugReport {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'rejected';
  screenshots: string[];
  stepsToReproduce?: string;
  deviceInfo?: string;
  createdAt: Date;
  updatedAt?: Date;
  rewardAmount: number;
  adminNotes?: string;
}

export interface BugReportComment {
  id: string;
  bugReportId: string;
  userId: string;
  content: string;
  createdAt: Date;
  isAdmin: boolean;
}
