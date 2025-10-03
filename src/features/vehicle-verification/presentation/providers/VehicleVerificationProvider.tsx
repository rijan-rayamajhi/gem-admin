'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { VehicleVerification, VehicleVerificationStatus } from '../../domain/entities/VehicleVerification';
import { FirebaseVehicleVerificationRepository } from '../../data/repositories/FirebaseVehicleVerificationRepository';
import { GetAllVehicleVerificationsUseCase } from '../../domain/usecases/GetAllVehicleVerificationsUseCase';
import { GetVehicleVerificationsByStatusUseCase } from '../../domain/usecases/GetVehicleVerificationsByStatusUseCase';
import { GetVehicleVerificationByIdUseCase } from '../../domain/usecases/GetVehicleVerificationByIdUseCase';
import { UpdateVehicleVerificationStatusUseCase } from '../../domain/usecases/UpdateVehicleVerificationStatusUseCase';
import { DeleteVehicleVerificationUseCase } from '../../domain/usecases/DeleteVehicleVerificationUseCase';

interface VehicleVerificationContextType {
  vehicleVerifications: VehicleVerification[];
  selectedVehicleVerification: VehicleVerification | null;
  loading: boolean;
  error: string | null;
  statusFilter: VehicleVerificationStatus | 'all';
  
  // Actions
  loadVehicleVerifications: () => Promise<void>;
  loadVehicleVerificationsByStatus: (status: VehicleVerificationStatus) => Promise<void>;
  loadVehicleVerificationById: (id: string) => Promise<void>;
  updateVehicleVerificationStatus: (id: string, status: VehicleVerificationStatus) => Promise<void>;
  deleteVehicleVerification: (id: string) => Promise<void>;
  setSelectedVehicleVerification: (vehicleVerification: VehicleVerification | null) => void;
  setStatusFilter: (status: VehicleVerificationStatus | 'all') => void;
  clearError: () => void;
}

const VehicleVerificationContext = createContext<VehicleVerificationContextType | undefined>(undefined);

interface VehicleVerificationProviderProps {
  children: ReactNode;
}

export function VehicleVerificationProvider({ children }: VehicleVerificationProviderProps) {
  const [vehicleVerifications, setVehicleVerifications] = useState<VehicleVerification[]>([]);
  const [selectedVehicleVerification, setSelectedVehicleVerification] = useState<VehicleVerification | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<VehicleVerificationStatus | 'all'>('all');

  // Initialize repository and use cases (memoized)
  const repository = useMemo(() => new FirebaseVehicleVerificationRepository(), []);
  const getAllVehicleVerificationsUseCase = useMemo(() => new GetAllVehicleVerificationsUseCase(repository), [repository]);
  const getVehicleVerificationsByStatusUseCase = useMemo(() => new GetVehicleVerificationsByStatusUseCase(repository), [repository]);
  const getVehicleVerificationByIdUseCase = useMemo(() => new GetVehicleVerificationByIdUseCase(repository), [repository]);
  const updateVehicleVerificationStatusUseCase = useMemo(() => new UpdateVehicleVerificationStatusUseCase(repository), [repository]);
  const deleteVehicleVerificationUseCase = useMemo(() => new DeleteVehicleVerificationUseCase(repository), [repository]);

  const loadVehicleVerifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllVehicleVerificationsUseCase.execute();
      setVehicleVerifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vehicle verifications');
    } finally {
      setLoading(false);
    }
  }, [getAllVehicleVerificationsUseCase]);

  const loadVehicleVerificationsByStatus = useCallback(async (status: VehicleVerificationStatus) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getVehicleVerificationsByStatusUseCase.execute(status);
      setVehicleVerifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vehicle verifications by status');
    } finally {
      setLoading(false);
    }
  }, [getVehicleVerificationsByStatusUseCase]);

  const loadVehicleVerificationById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getVehicleVerificationByIdUseCase.execute(id);
      setSelectedVehicleVerification(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vehicle verification');
    } finally {
      setLoading(false);
    }
  }, [getVehicleVerificationByIdUseCase]);

  const updateVehicleVerificationStatus = useCallback(async (id: string, status: VehicleVerificationStatus) => {
    try {
      setLoading(true);
      setError(null);
      await updateVehicleVerificationStatusUseCase.execute(id, status);
      
      // Update the local state
      setVehicleVerifications(prev => 
        prev.map(vehicle => 
          vehicle.id === id 
            ? { ...vehicle, verificationStatus: status, updatedAt: new Date() }
            : vehicle
        )
      );
      
      // Update selected vehicle if it's the same
      if (selectedVehicleVerification?.id === id) {
        setSelectedVehicleVerification(prev => 
          prev ? { ...prev, verificationStatus: status, updatedAt: new Date() } : null
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vehicle verification status');
    } finally {
      setLoading(false);
    }
  }, [selectedVehicleVerification?.id, updateVehicleVerificationStatusUseCase]);

  const deleteVehicleVerification = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteVehicleVerificationUseCase.execute(id);
      
      // Update the local state
      setVehicleVerifications(prev => prev.filter(vehicle => vehicle.id !== id));
      
      // Clear selected vehicle if it's the same
      if (selectedVehicleVerification?.id === id) {
        setSelectedVehicleVerification(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete vehicle verification');
    } finally {
      setLoading(false);
    }
  }, [deleteVehicleVerificationUseCase, selectedVehicleVerification?.id]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load vehicle verifications on mount
  useEffect(() => {
    loadVehicleVerifications();
  }, [loadVehicleVerifications]);

  const value: VehicleVerificationContextType = {
    vehicleVerifications,
    selectedVehicleVerification,
    loading,
    error,
    statusFilter,
    loadVehicleVerifications,
    loadVehicleVerificationsByStatus,
    loadVehicleVerificationById,
    updateVehicleVerificationStatus,
    deleteVehicleVerification,
    setSelectedVehicleVerification,
    setStatusFilter,
    clearError,
  };

  return (
    <VehicleVerificationContext.Provider value={value}>
      {children}
    </VehicleVerificationContext.Provider>
  );
}

export function useVehicleVerification() {
  const context = useContext(VehicleVerificationContext);
  if (context === undefined) {
    throw new Error('useVehicleVerification must be used within a VehicleVerificationProvider');
  }
  return context;
}
