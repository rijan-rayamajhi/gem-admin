'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { FirebaseMonetizationRepository } from '../../data/repositories/FirebaseMonetizationRepository';
import { GetMonetizationSettingsUseCase } from '../../domain/usecases/GetMonetizationSettingsUseCase';
import { UpdateMonetizationSettingsUseCase } from '../../domain/usecases/UpdateMonetizationSettingsUseCase';
import { GetCashoutRequestsUseCase } from '../../domain/usecases/GetCashoutRequestsUseCase';
import { ProcessCashoutRequestUseCase } from '../../domain/usecases/ProcessCashoutRequestUseCase';
import { GetAllEarningsUseCase } from '../../domain/usecases/GetAllEarningsUseCase';
import { MonetizationSettings } from '../../domain/entities/MonetizationSettings';
import { CashoutRequest, CashoutStatus } from '../../domain/entities/CashoutRequest';
import { Earnings } from '../../domain/entities/Earnings';

interface MonetizationContextType {
  // Settings
  settings: MonetizationSettings | null;
  loadingSettings: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (update: Partial<MonetizationSettings>, updatedBy: string) => Promise<void>;

  // Cashout Requests
  cashoutRequests: CashoutRequest[];
  loadingCashoutRequests: boolean;
  loadCashoutRequests: (status?: CashoutStatus) => Promise<void>;
  processCashoutRequest: (
    requestId: string, 
    status: CashoutStatus, 
    processedBy: string, 
    rejectionReason?: string,
    notes?: string
  ) => Promise<void>;

  // Earnings
  earnings: Earnings[];
  loadingEarnings: boolean;
  loadEarnings: () => Promise<void>;
}

const MonetizationContext = createContext<MonetizationContextType | undefined>(undefined);

export const useMonetization = () => {
  const context = useContext(MonetizationContext);
  if (!context) {
    throw new Error('useMonetization must be used within a MonetizationProvider');
  }
  return context;
};

interface MonetizationProviderProps {
  children: ReactNode;
}

export const MonetizationProvider: React.FC<MonetizationProviderProps> = ({ children }) => {
  const repository = useMemo(() => new FirebaseMonetizationRepository(), []);
  const getSettingsUseCase = useMemo(() => new GetMonetizationSettingsUseCase(repository), [repository]);
  const updateSettingsUseCase = useMemo(() => new UpdateMonetizationSettingsUseCase(repository), [repository]);
  const getCashoutRequestsUseCase = useMemo(() => new GetCashoutRequestsUseCase(repository), [repository]);
  const processCashoutRequestUseCase = useMemo(() => new ProcessCashoutRequestUseCase(repository), [repository]);
  const getAllEarningsUseCase = useMemo(() => new GetAllEarningsUseCase(repository), [repository]);

  // Settings state
  const [settings, setSettings] = useState<MonetizationSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(false);

  // Cashout requests state
  const [cashoutRequests, setCashoutRequests] = useState<CashoutRequest[]>([]);
  const [loadingCashoutRequests, setLoadingCashoutRequests] = useState(false);

  // Earnings state
  const [earnings, setEarnings] = useState<Earnings[]>([]);
  const [loadingEarnings, setLoadingEarnings] = useState(false);

  // Settings functions
  const loadSettings = useCallback(async () => {
    setLoadingSettings(true);
    try {
      const settingsData = await getSettingsUseCase.execute();
      setSettings(settingsData);
    } catch (error) {
      console.error('Failed to load monetization settings:', error);
    } finally {
      setLoadingSettings(false);
    }
  }, [getSettingsUseCase]);

  const updateSettings = async (update: Partial<MonetizationSettings>, updatedBy: string) => {
    try {
      await updateSettingsUseCase.execute(update, updatedBy);
      await loadSettings(); // Reload settings after update
    } catch (error) {
      console.error('Failed to update monetization settings:', error);
      throw error;
    }
  };

  // Cashout requests functions
  const loadCashoutRequests = useCallback(async (status?: CashoutStatus) => {
    setLoadingCashoutRequests(true);
    try {
      const requests = await getCashoutRequestsUseCase.execute(status);
      setCashoutRequests(requests);
    } catch (error) {
      console.error('Failed to load cashout requests:', error);
    } finally {
      setLoadingCashoutRequests(false);
    }
  }, [getCashoutRequestsUseCase]);

  const processCashoutRequest = async (
    requestId: string, 
    status: CashoutStatus, 
    processedBy: string, 
    rejectionReason?: string,
    notes?: string
  ) => {
    try {
      await processCashoutRequestUseCase.execute(requestId, status, processedBy, rejectionReason, notes);
      await loadCashoutRequests(); // Reload requests after processing
      await loadEarnings(); // Reload earnings after processing
    } catch (error) {
      console.error('Failed to process cashout request:', error);
      throw error;
    }
  };

  // Earnings functions
  const loadEarnings = useCallback(async () => {
    setLoadingEarnings(true);
    try {
      const earningsData = await getAllEarningsUseCase.execute();
      setEarnings(earningsData);
    } catch (error) {
      console.error('Failed to load earnings:', error);
    } finally {
      setLoadingEarnings(false);
    }
  }, [getAllEarningsUseCase]);

  // Load initial data
  useEffect(() => {
    loadSettings();
    loadCashoutRequests();
    loadEarnings();
  }, [loadSettings, loadCashoutRequests, loadEarnings]);

  const value: MonetizationContextType = {
    // Settings
    settings,
    loadingSettings,
    loadSettings,
    updateSettings,

    // Cashout Requests
    cashoutRequests,
    loadingCashoutRequests,
    loadCashoutRequests,
    processCashoutRequest,

    // Earnings
    earnings,
    loadingEarnings,
    loadEarnings,
  };

  return (
    <MonetizationContext.Provider value={value}>
      {children}
    </MonetizationContext.Provider>
  );
};
