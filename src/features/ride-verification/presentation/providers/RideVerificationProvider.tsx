'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { Ride } from '../../domain/entities/Ride';
import { FirebaseRideRepository } from '../../data/repositories/FirebaseRideRepository';
import { GetAllRidesUseCase } from '../../domain/usecases/GetAllRidesUseCase';
import { GetRidesByVerificationStatusUseCase } from '../../domain/usecases/GetRidesByVerificationStatusUseCase';
import { UpdateRideOdometerVerificationUseCase } from '../../domain/usecases/UpdateRideOdometerVerificationUseCase';

interface RideVerificationContextType {
  rides: Ride[];
  loading: boolean;
  error: string | null;
  refreshRides: () => Promise<void>;
  getRidesByStatus: (status: 'pending' | 'verified' | 'rejected') => Promise<Ride[]>;
  updateVerification: (rideId: string, userId: string, status: 'verified' | 'rejected', reasons?: string) => Promise<void>;
}

const RideVerificationContext = createContext<RideVerificationContextType | undefined>(undefined);

export const useRideVerification = () => {
  const context = useContext(RideVerificationContext);
  if (!context) {
    throw new Error('useRideVerification must be used within a RideVerificationProvider');
  }
  return context;
};

interface RideVerificationProviderProps {
  children: ReactNode;
}

export const RideVerificationProvider: React.FC<RideVerificationProviderProps> = ({ children }) => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize repository and use cases (memoized)
  const rideRepository = useMemo(() => new FirebaseRideRepository(), []);
  const getAllRidesUseCase = useMemo(() => new GetAllRidesUseCase(rideRepository), [rideRepository]);
  const getRidesByStatusUseCase = useMemo(() => new GetRidesByVerificationStatusUseCase(rideRepository), [rideRepository]);
  const updateVerificationUseCase = useMemo(() => new UpdateRideOdometerVerificationUseCase(rideRepository), [rideRepository]);

  const refreshRides = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allRides = await getAllRidesUseCase.execute();
      setRides(allRides);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rides');
    } finally {
      setLoading(false);
    }
  }, [getAllRidesUseCase]);

  const getRidesByStatus = useCallback(async (status: 'pending' | 'verified' | 'rejected'): Promise<Ride[]> => {
    try {
      return await getRidesByStatusUseCase.execute(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rides by status');
      return [];
    }
  }, [getRidesByStatusUseCase]);

  const updateVerification = useCallback(async (
    rideId: string, 
    userId: string, 
    status: 'verified' | 'rejected', 
    reasons?: string
  ) => {
    try {
      await updateVerificationUseCase.execute(rideId, userId, { verificationStatus: status, reasons });
      // Refresh rides after update
      await refreshRides();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update verification');
      throw err;
    }
  }, [refreshRides, updateVerificationUseCase]);

  useEffect(() => {
    refreshRides();
  }, [refreshRides]);

  const value: RideVerificationContextType = {
    rides,
    loading,
    error,
    refreshRides,
    getRidesByStatus,
    updateVerification,
  };

  return (
    <RideVerificationContext.Provider value={value}>
      {children}
    </RideVerificationContext.Provider>
  );
};
