import { BugReportRepository } from '../repositories/BugReportRepository';
import { BugReport } from '../entities/BugReport';

export interface CreateBugReportRequest {
  userId: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  screenshots: string[];
  stepsToReproduce?: string;
  deviceInfo?: string;
  rewardAmount: number;
}

export class CreateBugReportUseCase {
  constructor(private bugReportRepository: BugReportRepository) {}

  async execute(request: CreateBugReportRequest): Promise<BugReport> {
    const bugReportData = {
      ...request,
      status: 'open' as const
    };

    return this.bugReportRepository.createBugReport(bugReportData);
  }
}
