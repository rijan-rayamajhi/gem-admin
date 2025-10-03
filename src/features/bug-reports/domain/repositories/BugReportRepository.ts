import { BugReport, BugReportComment } from '../entities/BugReport';

export interface BugReportRepository {
  // Bug Report operations
  getAllBugReports(): Promise<BugReport[]>;
  getBugReportsByStatus(status: string): Promise<BugReport[]>;
  getBugReportById(id: string): Promise<BugReport | null>;
  createBugReport(bugReport: Omit<BugReport, 'id' | 'createdAt'>): Promise<BugReport>;
  updateBugReport(id: string, updates: Partial<BugReport>): Promise<BugReport>;
  deleteBugReport(id: string): Promise<void>;
  
  // Comment operations
  getBugReportComments(bugReportId: string): Promise<BugReportComment[]>;
  addBugReportComment(comment: Omit<BugReportComment, 'id' | 'createdAt'>): Promise<BugReportComment>;
  updateBugReportComment(id: string, content: string): Promise<BugReportComment>;
  deleteBugReportComment(id: string): Promise<void>;
}
