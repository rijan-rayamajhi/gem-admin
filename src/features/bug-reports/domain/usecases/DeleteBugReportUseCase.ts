import { BugReportRepository } from '../repositories/BugReportRepository';

export class DeleteBugReportUseCase {
  constructor(private bugReportRepository: BugReportRepository) {}

  async execute(id: string): Promise<void> {
    return this.bugReportRepository.deleteBugReport(id);
  }
}
