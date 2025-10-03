'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import { DrivingLicense, VerificationStatus, DrivingLicenseUpdate } from '../../domain/entities/DrivingLicense';
import { FirebaseDrivingLicenseRepository } from '../../data/repositories/FirebaseDrivingLicenseRepository';
import { GetAllDrivingLicensesUseCase } from '../../domain/usecases/GetAllDrivingLicensesUseCase';
import { GetDrivingLicensesByStatusUseCase } from '../../domain/usecases/GetDrivingLicensesByStatusUseCase';
import { UpdateDrivingLicenseUseCase } from '../../domain/usecases/UpdateDrivingLicenseUseCase';
import { DeleteDrivingLicenseUseCase } from '../../domain/usecases/DeleteDrivingLicenseUseCase';

interface DrivingLicenseContextType {
  drivingLicenses: DrivingLicense[];
  loading: boolean;
  error: string | null;
  getAllDrivingLicenses: () => Promise<void>;
  getDrivingLicensesByStatus: (status: VerificationStatus) => Promise<void>;
  updateDrivingLicense: (update: DrivingLicenseUpdate) => Promise<void>;
  deleteDrivingLicense: (id: string) => Promise<void>;
  clearError: () => void;
}

const DrivingLicenseContext = createContext<DrivingLicenseContextType | undefined>(undefined);

interface DrivingLicenseProviderProps {
  children: ReactNode;
}

export function DrivingLicenseProvider({ children }: DrivingLicenseProviderProps) {
  const [drivingLicenses, setDrivingLicenses] = useState<DrivingLicense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize repository and use cases (memoized)
  const repository = useMemo(() => new FirebaseDrivingLicenseRepository(), []);
  const getAllDrivingLicensesUseCase = useMemo(() => new GetAllDrivingLicensesUseCase(repository), [repository]);
  const getDrivingLicensesByStatusUseCase = useMemo(() => new GetDrivingLicensesByStatusUseCase(repository), [repository]);
  const updateDrivingLicenseUseCase = useMemo(() => new UpdateDrivingLicenseUseCase(repository), [repository]);
  const deleteDrivingLicenseUseCase = useMemo(() => new DeleteDrivingLicenseUseCase(repository), [repository]);

  const getAllDrivingLicenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const licenses = await getAllDrivingLicensesUseCase.execute();
      setDrivingLicenses(licenses);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch driving licenses';
      setError(errorMessage);
      console.error('Error fetching driving licenses:', err);
    } finally {
      setLoading(false);
    }
  }, [getAllDrivingLicensesUseCase]);

  const getDrivingLicensesByStatus = useCallback(async (status: VerificationStatus) => {
    try {
      setLoading(true);
      setError(null);
      const licenses = await getDrivingLicensesByStatusUseCase.execute(status);
      setDrivingLicenses(licenses);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch driving licenses by status';
      setError(errorMessage);
      console.error('Error fetching driving licenses by status:', err);
    } finally {
      setLoading(false);
    }
  }, [getDrivingLicensesByStatusUseCase]);

  const updateDrivingLicense = useCallback(async (update: DrivingLicenseUpdate) => {
    try {
      setLoading(true);
      setError(null);
      const updatedLicense = await updateDrivingLicenseUseCase.execute(update);
      
      // Update the local state
      setDrivingLicenses(prevLicenses =>
        prevLicenses.map(license =>
          license.id === update.id ? updatedLicense : license
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update driving license';
      setError(errorMessage);
      console.error('Error updating driving license:', err);
    } finally {
      setLoading(false);
    }
  }, [updateDrivingLicenseUseCase]);

  const deleteDrivingLicense = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteDrivingLicenseUseCase.execute(id);
      
      // Remove from local state
      setDrivingLicenses(prevLicenses =>
        prevLicenses.filter(license => license.id !== id)
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete driving license';
      setError(errorMessage);
      console.error('Error deleting driving license:', err);
    } finally {
      setLoading(false);
    }
  }, [deleteDrivingLicenseUseCase]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: DrivingLicenseContextType = {
    drivingLicenses,
    loading,
    error,
    getAllDrivingLicenses,
    getDrivingLicensesByStatus,
    updateDrivingLicense,
    deleteDrivingLicense,
    clearError,
  };

  return (
    <DrivingLicenseContext.Provider value={value}>
      {children}
    </DrivingLicenseContext.Provider>
  );
}

export function useDrivingLicense() {
  const context = useContext(DrivingLicenseContext);
  if (context === undefined) {
    throw new Error('useDrivingLicense must be used within a DrivingLicenseProvider');
  }
  return context;
}
