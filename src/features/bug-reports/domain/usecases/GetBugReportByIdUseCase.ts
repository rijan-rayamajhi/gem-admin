import { BugReportRepository } from '../repositories/BugReportRepository';
import { BugReport } from '../entities/BugReport';

export class GetBugReportByIdUseCase {
  constructor(private bugReportRepository: BugReportRepository) {}

  async execute(id: string): Promise<BugReport | null> {
    return this.bugReportRepository.getBugReportById(id);
  }
}
