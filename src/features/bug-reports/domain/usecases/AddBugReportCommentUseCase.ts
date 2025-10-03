import { BugReportRepository } from '../repositories/BugReportRepository';
import { BugReportComment } from '../entities/BugReport';

export interface AddBugReportCommentRequest {
  bugReportId: string;
  userId: string;
  content: string;
  isAdmin: boolean;
}

export class AddBugReportCommentUseCase {
  constructor(private bugReportRepository: BugReportRepository) {}

  async execute(request: AddBugReportCommentRequest): Promise<BugReportComment> {
    return this.bugReportRepository.addBugReportComment(request);
  }
}
