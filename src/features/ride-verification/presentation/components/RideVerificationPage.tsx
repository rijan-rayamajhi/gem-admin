'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/features/auth/presentation/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useRideVerification } from '../providers/RideVerificationProvider';
import { Ride } from '../../domain/entities/Ride';
import RideVerificationTable from './RideVerificationTable';
import RideVerificationDetailsModal from './RideVerificationDetailsModal';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import PullToRefresh from '@/components/PullToRefresh';

export default function RideVerificationPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { rides, loading, error, refreshRides, updateVerification } = useRideVerification();
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    rideId: string;
    userId: string;
    status: 'verified' | 'rejected';
    reasons?: string;
  } | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [searchFilter, setSearchFilter] = useState('');

  const filteredRides = useMemo(() => {
    let filtered = rides;

    // Filter by verification status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(ride => ride.odometer?.verificationStatus === filterStatus);
    }

    // Filter by search term
    if (searchFilter.trim()) {
      const search = searchFilter.toLowerCase();
      filtered = filtered.filter(ride => 
        ride.rideTitle?.toLowerCase().includes(search) ||
        ride.rideDescription?.toLowerCase().includes(search) ||
        ride.userId?.toLowerCase().includes(search) ||
        ride.vehicleId?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [rides, filterStatus, searchFilter]);

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

  const handleRideClick = (ride: Ride) => {
    setSelectedRide(ride);
    setShowDetailsModal(true);
  };

  const handleVerifyRide = (rideId: string, userId: string, reasons?: string) => {
    setPendingAction({ rideId, userId, status: 'verified', reasons });
    setShowConfirmDialog(true);
  };

  const handleRejectRide = (rideId: string, userId: string, reasons?: string) => {
    setPendingAction({ rideId, userId, status: 'rejected', reasons });
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    try {
      await updateVerification(
        pendingAction.rideId,
        pendingAction.userId,
        pendingAction.status,
        pendingAction.reasons
      );
      setShowConfirmDialog(false);
      setPendingAction(null);
    } catch (error) {
      console.error('Failed to update verification:', error);
    }
  };

  const getStatusCounts = () => {
    const counts = {
      all: rides.length,
      pending: rides.filter(ride => ride.odometer?.verificationStatus === 'pending').length,
      verified: rides.filter(ride => ride.odometer?.verificationStatus === 'verified').length,
      rejected: rides.filter(ride => ride.odometer?.verificationStatus === 'rejected').length,
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading rides...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-card-foreground mb-2">Error Loading Rides</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={refreshRides}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={refreshRides} className="min-h-screen bg-background">
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
              <h1 className="text-xl font-semibold text-card-foreground truncate">Ride Verification</h1>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
            <div className="text-2xl font-bold text-card-foreground">{statusCounts.all}</div>
            <div className="text-sm text-muted-foreground">Total Rides</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
            <div className="text-2xl font-bold text-green-600">{statusCounts.verified}</div>
            <div className="text-sm text-muted-foreground">Verified</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
            <div className="text-2xl font-bold text-red-600">{statusCounts.rejected}</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All', count: statusCounts.all },
              { key: 'pending', label: 'Pending', count: statusCounts.pending },
              { key: 'verified', label: 'Verified', count: statusCounts.verified },
              { key: 'rejected', label: 'Rejected', count: statusCounts.rejected },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilterStatus(key as 'all' | 'pending' | 'verified' | 'rejected')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-card-foreground border border-border hover:bg-muted'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          {/* Search Filter */}
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search rides..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-card text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Rides Table */}
        <RideVerificationTable
          rides={filteredRides}
          onRideClick={handleRideClick}
          onVerifyRide={handleVerifyRide}
          onRejectRide={handleRejectRide}
        />
      </main>

      {/* Details Modal */}
      {showDetailsModal && selectedRide && (
        <RideVerificationDetailsModal
          ride={selectedRide}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedRide(null);
          }}
          onVerifyRide={handleVerifyRide}
          onRejectRide={handleRejectRide}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false);
          setPendingAction(null);
        }}
        onConfirm={handleConfirmAction}
        title={`${pendingAction?.status === 'verified' ? 'Verify' : 'Reject'} Ride`}
        message={`Are you sure you want to ${pendingAction?.status === 'verified' ? 'verify' : 'reject'} this ride's odometer reading?`}
        confirmText={pendingAction?.status === 'verified' ? 'Verify' : 'Reject'}
        cancelText="Cancel"
        variant={pendingAction?.status === 'verified' ? 'default' : 'destructive'}
      />

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
