import { BugReportRepository } from '../repositories/BugReportRepository';
import { BugReport } from '../entities/BugReport';

export class GetAllBugReportsUseCase {
  constructor(private bugReportRepository: BugReportRepository) {}

  async execute(): Promise<BugReport[]> {
    return this.bugReportRepository.getAllBugReports();
  }
}
