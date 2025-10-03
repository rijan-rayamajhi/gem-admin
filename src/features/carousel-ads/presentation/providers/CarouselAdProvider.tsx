'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { CarouselAd, CreateCarouselAdRequest, UpdateCarouselAdRequest, CarouselAdFilters } from '../../domain/entities/CarouselAd';
import { FirebaseCarouselAdRepository } from '../../data/repositories/FirebaseCarouselAdRepository';
import { CreateCarouselAdUseCase } from '../../domain/usecases/CreateCarouselAdUseCase';
import { GetAllCarouselAdsUseCase } from '../../domain/usecases/GetAllCarouselAdsUseCase';
import { UpdateCarouselAdUseCase } from '../../domain/usecases/UpdateCarouselAdUseCase';
import { DeleteCarouselAdUseCase } from '../../domain/usecases/DeleteCarouselAdUseCase';
import { UploadImageUseCase } from '../../domain/usecases/UploadImageUseCase';

interface CarouselAdContextType {
  carouselAds: CarouselAd[];
  loading: boolean;
  error: string | null;
  createCarouselAd: (carouselAdData: CreateCarouselAdRequest) => Promise<void>;
  updateCarouselAd: (updateData: UpdateCarouselAdRequest) => Promise<void>;
  deleteCarouselAd: (id: string) => Promise<void>;
  uploadImage: (file: File) => Promise<string>;
  refreshCarouselAds: () => Promise<void>;
  getCarouselAdsByFilters: (filters: CarouselAdFilters) => Promise<void>;
  toggleAdStatus: (id: string) => Promise<void>;
  clearError: () => void;
}

const CarouselAdContext = createContext<CarouselAdContextType | undefined>(undefined);

interface CarouselAdProviderProps {
  children: ReactNode;
}

export function CarouselAdProvider({ children }: CarouselAdProviderProps) {
  const [carouselAds, setCarouselAds] = useState<CarouselAd[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize repository and use cases (memoized to avoid re-creation per render)
  const repository = useMemo(() => new FirebaseCarouselAdRepository(), []);
  const createCarouselAdUseCase = useMemo(() => new CreateCarouselAdUseCase(repository), [repository]);
  const getAllCarouselAdsUseCase = useMemo(() => new GetAllCarouselAdsUseCase(repository), [repository]);
  const updateCarouselAdUseCase = useMemo(() => new UpdateCarouselAdUseCase(repository), [repository]);
  const deleteCarouselAdUseCase = useMemo(() => new DeleteCarouselAdUseCase(repository), [repository]);
  const uploadImageUseCase = useMemo(() => new UploadImageUseCase(repository), [repository]);

  const clearError = useCallback(() => setError(null), []);

  const createCarouselAd = useCallback(async (carouselAdData: CreateCarouselAdRequest) => {
    try {
      setLoading(true);
      setError(null);
      const newCarouselAd = await createCarouselAdUseCase.execute(carouselAdData);
      setCarouselAds(prev => [newCarouselAd, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create carousel ad');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createCarouselAdUseCase]);

  const updateCarouselAd = useCallback(async (updateData: UpdateCarouselAdRequest) => {
    try {
      setLoading(true);
      setError(null);
      const updatedCarouselAd = await updateCarouselAdUseCase.execute(updateData);
      setCarouselAds(prev => 
        prev.map(ad => ad.id === updatedCarouselAd.id ? updatedCarouselAd : ad)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update carousel ad');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateCarouselAdUseCase]);

  const deleteCarouselAd = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteCarouselAdUseCase.execute(id);
      setCarouselAds(prev => prev.filter(ad => ad.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete carousel ad');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [deleteCarouselAdUseCase]);

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      const imageUrl = await uploadImageUseCase.execute(file);
      return imageUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [uploadImageUseCase]);

  const refreshCarouselAds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const ads = await getAllCarouselAdsUseCase.execute();
      setCarouselAds(ads);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load carousel ads');
    } finally {
      setLoading(false);
    }
  }, [getAllCarouselAdsUseCase]);

  const getCarouselAdsByFilters = useCallback(async (filters: CarouselAdFilters) => {
    try {
      setLoading(true);
      setError(null);
      const ads = await getAllCarouselAdsUseCase.execute(filters);
      setCarouselAds(ads);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load filtered carousel ads');
    } finally {
      setLoading(false);
    }
  }, [getAllCarouselAdsUseCase]);

  const toggleAdStatus = useCallback(async (id: string) => {
    try {
      console.log('ToggleAdStatus called for ID:', id);
      setLoading(true);
      setError(null);
      
      // Find the ad to toggle
      const ad = carouselAds.find(ad => ad.id === id);
      if (!ad) {
        console.error('Ad not found with ID:', id);
        throw new Error('Ad not found');
      }

      console.log('Found ad:', ad.title, 'Current isActive:', ad.isActive);
      console.log('Toggling to:', !ad.isActive);

      // Toggle the isActive status
      const updatedAd = await updateCarouselAdUseCase.execute({
        id,
        isActive: !ad.isActive
      });

      console.log('Update successful, new ad:', updatedAd.title, 'isActive:', updatedAd.isActive);

      // Update the local state
      setCarouselAds(prev => 
        prev.map(ad => ad.id === id ? updatedAd : ad)
      );
    } catch (err) {
      console.error('Toggle error:', err);
      setError(err instanceof Error ? err.message : 'Failed to toggle ad status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [carouselAds, updateCarouselAdUseCase]);

  // Load carousel ads on mount
  useEffect(() => {
    refreshCarouselAds();
  }, [refreshCarouselAds]);

  const value: CarouselAdContextType = {
    carouselAds,
    loading,
    error,
    createCarouselAd,
    updateCarouselAd,
    deleteCarouselAd,
    uploadImage,
    refreshCarouselAds,
    getCarouselAdsByFilters,
    toggleAdStatus,
    clearError,
  };

  return (
    <CarouselAdContext.Provider value={value}>
      {children}
    </CarouselAdContext.Provider>
  );
}

export function useCarouselAds() {
  const context = useContext(CarouselAdContext);
  if (context === undefined) {
    throw new Error('useCarouselAds must be used within a CarouselAdProvider');
  }
  return context;
}
