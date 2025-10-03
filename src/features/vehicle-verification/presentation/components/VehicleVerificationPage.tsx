'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/features/auth/presentation/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { VehicleVerificationProvider, useVehicleVerification } from '../providers/VehicleVerificationProvider';
import { VehicleVerificationStatus, VehicleVerificationStatusLabels } from '../../domain/entities/VehicleVerificationStatus';
import VehicleVerificationTable from './VehicleVerificationTable';
import VehicleVerificationDetailsModal from './VehicleVerificationDetailsModal';
import PullToRefresh from '@/components/PullToRefresh';

function VehicleVerificationPageContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const {
    vehicleVerifications,
    selectedVehicleVerification,
    loading,
    error,
    statusFilter,
    loadVehicleVerifications,
    loadVehicleVerificationsByStatus,
    setSelectedVehicleVerification,
    setStatusFilter,
    clearError,
  } = useVehicleVerification();

  const [searchFilter, setSearchFilter] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleRefresh = async () => {
    if (statusFilter === 'all') {
      await loadVehicleVerifications();
    } else {
      await loadVehicleVerificationsByStatus(statusFilter);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleStatusFilterChange = async (status: VehicleVerificationStatus | 'all') => {
    setStatusFilter(status);
    if (status === 'all') {
      await loadVehicleVerifications();
    } else {
      await loadVehicleVerificationsByStatus(status);
    }
  };

  // Filter and search vehicle verifications
  const filteredVehicleVerifications = useMemo(() => {
    let filtered = vehicleVerifications;

    if (searchFilter.trim()) {
      const filter = searchFilter.toLowerCase();
      filtered = vehicleVerifications.filter(vehicle =>
        vehicle.vehicleBrandName.toLowerCase().includes(filter) ||
        vehicle.vehicleModelName.toLowerCase().includes(filter) ||
        vehicle.vehicleRegistrationNumber.toLowerCase().includes(filter) ||
        vehicle.vehicleType.toLowerCase().includes(filter) ||
        (vehicle.userDisplayName && vehicle.userDisplayName.toLowerCase().includes(filter)) ||
        (vehicle.userEmail && vehicle.userEmail.toLowerCase().includes(filter))
      );
    }

    return filtered.sort((a, b) => {
      // Sort by verification status priority, then by creation date
      const statusPriority = {
        [VehicleVerificationStatus.PENDING]: 0,        // Highest priority - needs admin action
        [VehicleVerificationStatus.NOT_VERIFIED]: 1,    // User hasn't submitted for verification
        [VehicleVerificationStatus.REJECTED]: 2,        // Admin rejected
        [VehicleVerificationStatus.VERIFIED]: 3,        // Admin verified
      };

      const aPriority = statusPriority[a.verificationStatus];
      const bPriority = statusPriority[b.verificationStatus];

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
    });
  }, [vehicleVerifications, searchFilter]);

  const statusCounts = useMemo(() => {
    const counts = {
      all: vehicleVerifications.length,
      [VehicleVerificationStatus.PENDING]: 0,
      [VehicleVerificationStatus.NOT_VERIFIED]: 0,
      [VehicleVerificationStatus.REJECTED]: 0,
      [VehicleVerificationStatus.VERIFIED]: 0,
    };

    vehicleVerifications.forEach(vehicle => {
      counts[vehicle.verificationStatus]++;
    });

    return counts;
  }, [vehicleVerifications]);

  return (
    <PullToRefresh onRefresh={handleRefresh} className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center min-w-0 flex-1">
              <button
                onClick={() => router.push('/')}
                className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3 flex-shrink-0 hover:bg-primary/90 transition-colors"
              >
                <svg className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-card-foreground truncate">Vehicle Verification Management</h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <div className="text-sm text-muted-foreground hidden sm:block truncate max-w-32">
                Welcome, {user?.displayName || user?.email}
              </div>
              <button
                onClick={handleLogoutClick}
                className="bg-primary text-primary-foreground px-3 sm:px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-card-foreground mb-2">Vehicle Verification Management</h2>
          <p className="text-muted-foreground text-sm sm:text-base">Review and manage vehicle verification submissions</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-destructive mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-destructive font-medium">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="text-destructive hover:text-destructive/80 transition-colors"
                aria-label="Dismiss error"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Status Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStatusFilterChange('all')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-card-foreground border border-border hover:bg-muted'
              }`}
            >
              All ({statusCounts.all})
            </button>
            {Object.values(VehicleVerificationStatus).map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilterChange(status)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-card-foreground border border-border hover:bg-muted'
                }`}
              >
                {VehicleVerificationStatusLabels[status]} ({statusCounts[status]})
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 border border-border rounded-lg bg-card text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                aria-label="Clear search"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground hover:text-card-foreground transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchFilter && (
            <div className="mt-2 text-xs sm:text-sm text-muted-foreground">
              {filteredVehicleVerifications.length === 0 ? (
                <span>No vehicles found matching &quot;{searchFilter}&quot;</span>
              ) : (
                <span>{filteredVehicleVerifications.length} vehicle{filteredVehicleVerifications.length !== 1 ? 's' : ''} found</span>
              )}
            </div>
          )}
        </div>

        {/* Vehicle Verification Table */}
        <VehicleVerificationTable
          vehicleVerifications={filteredVehicleVerifications}
          loading={loading}
          onVehicleVerificationSelect={setSelectedVehicleVerification}
        />

        {/* Vehicle Verification Details Modal */}
        {selectedVehicleVerification && (
          <VehicleVerificationDetailsModal
            vehicleVerification={selectedVehicleVerification}
            onClose={() => setSelectedVehicleVerification(null)}
          />
        )}
      </main>

      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to sign in again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        variant="destructive"
      />
    </PullToRefresh>
  );
}

export default function VehicleVerificationPage() {
  return (
    <VehicleVerificationProvider>
      <VehicleVerificationPageContent />
    </VehicleVerificationProvider>
  );
}
