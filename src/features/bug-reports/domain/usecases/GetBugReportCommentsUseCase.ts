import { BugReportRepository } from '../repositories/BugReportRepository';
import { BugReportComment } from '../entities/BugReport';

export class GetBugReportCommentsUseCase {
  constructor(private bugReportRepository: BugReportRepository) {}

  async execute(bugReportId: string): Promise<BugReportComment[]> {
    return this.bugReportRepository.getBugReportComments(bugReportId);
  }
}
