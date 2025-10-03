import { BugReportRepository } from '../repositories/BugReportRepository';
import { BugReport } from '../entities/BugReport';

export class GetBugReportsByStatusUseCase {
  constructor(private bugReportRepository: BugReportRepository) {}

  async execute(status: string): Promise<BugReport[]> {
    return this.bugReportRepository.getBugReportsByStatus(status);
  }
}
