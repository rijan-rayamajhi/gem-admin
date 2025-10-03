import { BugReportRepository } from '../repositories/BugReportRepository';
import { BugReport } from '../entities/BugReport';

export interface UpdateBugReportRequest {
  id: string;
  status?: 'open' | 'in_progress' | 'resolved' | 'closed' | 'rejected';
  adminNotes?: string;
  rewardAmount?: number;
}

export class UpdateBugReportUseCase {
  constructor(private bugReportRepository: BugReportRepository) {}

  async execute(request: UpdateBugReportRequest): Promise<BugReport> {
    const updates: Partial<BugReport> = {};
    
    if (request.status) updates.status = request.status;
    if (request.adminNotes !== undefined) updates.adminNotes = request.adminNotes;
    if (request.rewardAmount !== undefined) updates.rewardAmount = request.rewardAmount;

    return this.bugReportRepository.updateBugReport(request.id, updates);
  }
}
