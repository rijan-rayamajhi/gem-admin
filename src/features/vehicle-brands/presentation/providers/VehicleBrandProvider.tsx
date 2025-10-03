'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { VehicleBrand, CreateVehicleBrandRequest, UpdateVehicleBrandRequest } from '../../domain/entities/VehicleBrand';
import { FirebaseVehicleBrandRepository } from '../../data/repositories/FirebaseVehicleBrandRepository';
import { GetAllVehicleBrandsUseCase } from '../../domain/usecases/GetAllVehicleBrandsUseCase';
import { GetVehicleBrandByIdUseCase } from '../../domain/usecases/GetVehicleBrandByIdUseCase';
import { CreateVehicleBrandUseCase } from '../../domain/usecases/CreateVehicleBrandUseCase';
import { UpdateVehicleBrandUseCase } from '../../domain/usecases/UpdateVehicleBrandUseCase';
import { DeleteVehicleBrandUseCase } from '../../domain/usecases/DeleteVehicleBrandUseCase';
import { GetVehicleBrandsByTypeUseCase } from '../../domain/usecases/GetVehicleBrandsByTypeUseCase';

interface VehicleBrandContextType {
  vehicleBrands: VehicleBrand[];
  loading: boolean;
  error: string | null;
  selectedVehicleBrand: VehicleBrand | null;
  getAllVehicleBrands: () => Promise<void>;
  getVehicleBrandById: (id: string) => Promise<VehicleBrand | null>;
  createVehicleBrand: (request: CreateVehicleBrandRequest) => Promise<void>;
  updateVehicleBrand: (request: UpdateVehicleBrandRequest) => Promise<void>;
  deleteVehicleBrand: (id: string) => Promise<void>;
  getVehicleBrandsByType: (vehicleType: string) => Promise<VehicleBrand[]>;
  setSelectedVehicleBrand: (vehicleBrand: VehicleBrand | null) => void;
  clearError: () => void;
}

const VehicleBrandContext = createContext<VehicleBrandContextType | undefined>(undefined);

interface VehicleBrandProviderProps {
  children: ReactNode;
}

export function VehicleBrandProvider({ children }: VehicleBrandProviderProps) {
  const [vehicleBrands, setVehicleBrands] = useState<VehicleBrand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVehicleBrand, setSelectedVehicleBrand] = useState<VehicleBrand | null>(null);

  // Initialize repository and use cases (memoized)
  const repository = useMemo(() => new FirebaseVehicleBrandRepository(), []);
  const getAllVehicleBrandsUseCase = useMemo(() => new GetAllVehicleBrandsUseCase(repository), [repository]);
  const getVehicleBrandByIdUseCase = useMemo(() => new GetVehicleBrandByIdUseCase(repository), [repository]);
  const createVehicleBrandUseCase = useMemo(() => new CreateVehicleBrandUseCase(repository), [repository]);
  const updateVehicleBrandUseCase = useMemo(() => new UpdateVehicleBrandUseCase(repository), [repository]);
  const deleteVehicleBrandUseCase = useMemo(() => new DeleteVehicleBrandUseCase(repository), [repository]);
  const getVehicleBrandsByTypeUseCase = useMemo(() => new GetVehicleBrandsByTypeUseCase(repository), [repository]);

  const getAllVehicleBrands = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const brands = await getAllVehicleBrandsUseCase.execute();
      setVehicleBrands(brands);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch vehicle brands';
      setError(errorMessage);
      console.error('Error fetching vehicle brands:', err);
    } finally {
      setLoading(false);
    }
  }, [getAllVehicleBrandsUseCase]);

  const getVehicleBrandById = useCallback(async (id: string): Promise<VehicleBrand | null> => {
    try {
      setLoading(true);
      setError(null);
      const brand = await getVehicleBrandByIdUseCase.execute(id);
      return brand;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch vehicle brand';
      setError(errorMessage);
      console.error('Error fetching vehicle brand:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getVehicleBrandByIdUseCase]);

  const createVehicleBrand = useCallback(async (request: CreateVehicleBrandRequest) => {
    try {
      setLoading(true);
      setError(null);
      const newBrand = await createVehicleBrandUseCase.execute(request);
      setVehicleBrands(prev => [...prev, newBrand]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create vehicle brand';
      setError(errorMessage);
      console.error('Error creating vehicle brand:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createVehicleBrandUseCase]);

  const updateVehicleBrand = useCallback(async (request: UpdateVehicleBrandRequest) => {
    try {
      setLoading(true);
      setError(null);
      const updatedBrand = await updateVehicleBrandUseCase.execute(request);
      setVehicleBrands(prev => 
        prev.map(brand => brand.id === updatedBrand.id ? updatedBrand : brand)
      );
      if (selectedVehicleBrand?.id === updatedBrand.id) {
        setSelectedVehicleBrand(updatedBrand);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update vehicle brand';
      setError(errorMessage);
      console.error('Error updating vehicle brand:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedVehicleBrand?.id, updateVehicleBrandUseCase]);

  const deleteVehicleBrand = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteVehicleBrandUseCase.execute(id);
      setVehicleBrands(prev => prev.filter(brand => brand.id !== id));
      if (selectedVehicleBrand?.id === id) {
        setSelectedVehicleBrand(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete vehicle brand';
      setError(errorMessage);
      console.error('Error deleting vehicle brand:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [deleteVehicleBrandUseCase, selectedVehicleBrand?.id]);

  const getVehicleBrandsByType = useCallback(async (vehicleType: string): Promise<VehicleBrand[]> => {
    try {
      setLoading(true);
      setError(null);
      const brands = await getVehicleBrandsByTypeUseCase.execute(vehicleType);
      return brands;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch vehicle brands by type';
      setError(errorMessage);
      console.error('Error fetching vehicle brands by type:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [getVehicleBrandsByTypeUseCase]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load vehicle brands on mount
  useEffect(() => {
    getAllVehicleBrands();
  }, [getAllVehicleBrands]);

  const value: VehicleBrandContextType = {
    vehicleBrands,
    loading,
    error,
    selectedVehicleBrand,
    getAllVehicleBrands,
    getVehicleBrandById,
    createVehicleBrand,
    updateVehicleBrand,
    deleteVehicleBrand,
    getVehicleBrandsByType,
    setSelectedVehicleBrand,
    clearError,
  };

  return (
    <VehicleBrandContext.Provider value={value}>
      {children}
    </VehicleBrandContext.Provider>
  );
}

export function useVehicleBrand() {
  const context = useContext(VehicleBrandContext);
  if (context === undefined) {
    throw new Error('useVehicleBrand must be used within a VehicleBrandProvider');
  }
  return context;
}
