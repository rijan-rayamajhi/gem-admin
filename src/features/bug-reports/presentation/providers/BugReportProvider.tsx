'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import { BugReport, BugReportComment } from '../../domain/entities/BugReport';
import { FirebaseBugReportRepository } from '../../data/repositories/FirebaseBugReportRepository';
import { GetAllBugReportsUseCase } from '../../domain/usecases/GetAllBugReportsUseCase';
import { GetBugReportsByStatusUseCase } from '../../domain/usecases/GetBugReportsByStatusUseCase';
import { GetBugReportByIdUseCase } from '../../domain/usecases/GetBugReportByIdUseCase';
import { CreateBugReportUseCase, CreateBugReportRequest } from '../../domain/usecases/CreateBugReportUseCase';
import { UpdateBugReportUseCase, UpdateBugReportRequest } from '../../domain/usecases/UpdateBugReportUseCase';
import { DeleteBugReportUseCase } from '../../domain/usecases/DeleteBugReportUseCase';
import { GetBugReportCommentsUseCase } from '../../domain/usecases/GetBugReportCommentsUseCase';
import { AddBugReportCommentUseCase, AddBugReportCommentRequest } from '../../domain/usecases/AddBugReportCommentUseCase';

interface BugReportContextType {
  bugReports: BugReport[];
  comments: BugReportComment[];
  selectedBugReport: BugReport | null;
  loading: boolean;
  error: string | null;
  
  // Bug Report operations
  getAllBugReports: () => Promise<void>;
  getBugReportsByStatus: (status: string) => Promise<void>;
  getBugReportById: (id: string) => Promise<void>;
  createBugReport: (request: CreateBugReportRequest) => Promise<BugReport>;
  updateBugReport: (request: UpdateBugReportRequest) => Promise<void>;
  deleteBugReport: (id: string) => Promise<void>;
  
  // Comment operations
  getBugReportComments: (bugReportId: string) => Promise<void>;
  addBugReportComment: (request: AddBugReportCommentRequest) => Promise<void>;
  
  clearError: () => void;
  clearSelectedBugReport: () => void;
}

const BugReportContext = createContext<BugReportContextType | undefined>(undefined);

interface BugReportProviderProps {
  children: ReactNode;
}

export function BugReportProvider({ children }: BugReportProviderProps) {
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [comments, setComments] = useState<BugReportComment[]>([]);
  const [selectedBugReport, setSelectedBugReport] = useState<BugReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize repository and use cases (memoized)
  const repository = useMemo(() => new FirebaseBugReportRepository(), []);
  const getAllBugReportsUseCase = useMemo(() => new GetAllBugReportsUseCase(repository), [repository]);
  const getBugReportsByStatusUseCase = useMemo(() => new GetBugReportsByStatusUseCase(repository), [repository]);
  const getBugReportByIdUseCase = useMemo(() => new GetBugReportByIdUseCase(repository), [repository]);
  const createBugReportUseCase = useMemo(() => new CreateBugReportUseCase(repository), [repository]);
  const updateBugReportUseCase = useMemo(() => new UpdateBugReportUseCase(repository), [repository]);
  const deleteBugReportUseCase = useMemo(() => new DeleteBugReportUseCase(repository), [repository]);
  const getBugReportCommentsUseCase = useMemo(() => new GetBugReportCommentsUseCase(repository), [repository]);
  const addBugReportCommentUseCase = useMemo(() => new AddBugReportCommentUseCase(repository), [repository]);

  const getAllBugReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const reports = await getAllBugReportsUseCase.execute();
      setBugReports(reports);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bug reports';
      setError(errorMessage);
      console.error('Error fetching bug reports:', err);
    } finally {
      setLoading(false);
    }
  }, [getAllBugReportsUseCase]);

  const getBugReportsByStatus = useCallback(async (status: string) => {
    try {
      setLoading(true);
      setError(null);
      const reports = await getBugReportsByStatusUseCase.execute(status);
      setBugReports(reports);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bug reports by status';
      setError(errorMessage);
      console.error('Error fetching bug reports by status:', err);
    } finally {
      setLoading(false);
    }
  }, [getBugReportsByStatusUseCase]);

  const getBugReportById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const report = await getBugReportByIdUseCase.execute(id);
      setSelectedBugReport(report);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bug report';
      setError(errorMessage);
      console.error('Error fetching bug report:', err);
    } finally {
      setLoading(false);
    }
  }, [getBugReportByIdUseCase]);

  const createBugReport = useCallback(async (request: CreateBugReportRequest): Promise<BugReport> => {
    try {
      setLoading(true);
      setError(null);
      const newReport = await createBugReportUseCase.execute(request);
      
      // Add to local state
      setBugReports(prevReports => [newReport, ...prevReports]);
      
      return newReport;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create bug report';
      setError(errorMessage);
      console.error('Error creating bug report:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createBugReportUseCase]);

  const updateBugReport = useCallback(async (request: UpdateBugReportRequest) => {
    try {
      setLoading(true);
      setError(null);
      const updatedReport = await updateBugReportUseCase.execute(request);
      
      // Update local state
      setBugReports(prevReports =>
        prevReports.map(report =>
          report.id === request.id ? updatedReport : report
        )
      );
      
      // Update selected bug report if it's the one being updated
      if (selectedBugReport?.id === request.id) {
        setSelectedBugReport(updatedReport);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update bug report';
      setError(errorMessage);
      console.error('Error updating bug report:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedBugReport?.id, updateBugReportUseCase]);

  const deleteBugReport = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteBugReportUseCase.execute(id);
      
      // Remove from local state
      setBugReports(prevReports => prevReports.filter(report => report.id !== id));
      
      // Clear selected bug report if it's the one being deleted
      if (selectedBugReport?.id === id) {
        setSelectedBugReport(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete bug report';
      setError(errorMessage);
      console.error('Error deleting bug report:', err);
    } finally {
      setLoading(false);
    }
  }, [deleteBugReportUseCase, selectedBugReport?.id]);

  const getBugReportComments = useCallback(async (bugReportId: string) => {
    try {
      setLoading(true);
      setError(null);
      const commentsList = await getBugReportCommentsUseCase.execute(bugReportId);
      setComments(commentsList);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch comments';
      setError(errorMessage);
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  }, [getBugReportCommentsUseCase]);

  const addBugReportComment = useCallback(async (request: AddBugReportCommentRequest) => {
    try {
      setLoading(true);
      setError(null);
      const newComment = await addBugReportCommentUseCase.execute(request);
      
      // Add to local state
      setComments(prevComments => [...prevComments, newComment]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add comment';
      setError(errorMessage);
      console.error('Error adding comment:', err);
    } finally {
      setLoading(false);
    }
  }, [addBugReportCommentUseCase]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearSelectedBugReport = useCallback(() => {
    setSelectedBugReport(null);
    setComments([]);
  }, []);

  const value: BugReportContextType = {
    bugReports,
    comments,
    selectedBugReport,
    loading,
    error,
    getAllBugReports,
    getBugReportsByStatus,
    getBugReportById,
    createBugReport,
    updateBugReport,
    deleteBugReport,
    getBugReportComments,
    addBugReportComment,
    clearError,
    clearSelectedBugReport,
  };

  return (
    <BugReportContext.Provider value={value}>
      {children}
    </BugReportContext.Provider>
  );
}

export function useBugReport() {
  const context = useContext(BugReportContext);
  if (context === undefined) {
    throw new Error('useBugReport must be used within a BugReportProvider');
  }
  return context;
}
