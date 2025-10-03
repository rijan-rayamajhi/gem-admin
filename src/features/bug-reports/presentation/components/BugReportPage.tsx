'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth/presentation/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import PullToRefresh from '@/components/PullToRefresh';
import { useBugReport } from '../providers/BugReportProvider';
import BugReportTable from './BugReportTable';
import BugReportDetailsModal from './BugReportDetailsModal';

function BugReportContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const {
    bugReports,
    loading,
    error,
    getAllBugReports,
    getBugReportsByStatus,
    clearError
  } = useBugReport();

  const [selectedStatus, setSelectedStatus] = useState<string | 'all'>('all');
  const [selectedBugReport, setSelectedBugReport] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const loadBugReports = useCallback(async () => {
    if (selectedStatus === 'all') {
      await getAllBugReports();
    } else {
      await getBugReportsByStatus(selectedStatus);
    }
  }, [selectedStatus, getAllBugReports, getBugReportsByStatus]);

  useEffect(() => {
    loadBugReports();
  }, [loadBugReports]);

  useEffect(() => {
    loadBugReports();
  }, [selectedStatus, loadBugReports]);

  const handleStatusFilter = (status: string | 'all') => {
    setSelectedStatus(status);
  };

  const handleViewDetails = (bugReportId: string) => {
    setSelectedBugReport(bugReportId);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedBugReport(null);
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

  const handleRefresh = async () => {
    await loadBugReports();
  };

  const getStatusCounts = () => {
    const counts = {
      all: bugReports.length,
      open: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
      rejected: 0,
    };

    bugReports.forEach(report => {
      counts[report.status as keyof typeof counts]++;
    });

    return counts;
  };

  const statusCounts = getStatusCounts();


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
              <h1 className="text-xl font-semibold text-card-foreground truncate">Bug Reports</h1>
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
          <h2 className="text-xl sm:text-2xl font-bold text-card-foreground mb-2">Bug Reports</h2>
          <p className="text-muted-foreground text-sm sm:text-base">Track and manage application bugs</p>
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
              onClick={() => handleStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-card-foreground border border-border hover:bg-muted'
              }`}
            >
              All ({statusCounts.all})
            </button>
            <button
              onClick={() => handleStatusFilter('open')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === 'open'
                  ? 'bg-blue-500 text-white'
                  : 'bg-card text-card-foreground border border-border hover:bg-muted'
              }`}
            >
              Open ({statusCounts.open})
            </button>
            <button
              onClick={() => handleStatusFilter('in_progress')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === 'in_progress'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-card text-card-foreground border border-border hover:bg-muted'
              }`}
            >
              In Progress ({statusCounts.in_progress})
            </button>
            <button
              onClick={() => handleStatusFilter('resolved')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === 'resolved'
                  ? 'bg-green-500 text-white'
                  : 'bg-card text-card-foreground border border-border hover:bg-muted'
              }`}
            >
              Resolved ({statusCounts.resolved})
            </button>
            <button
              onClick={() => handleStatusFilter('closed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === 'closed'
                  ? 'bg-gray-500 text-white'
                  : 'bg-card text-card-foreground border border-border hover:bg-muted'
              }`}
            >
              Closed ({statusCounts.closed})
            </button>
            <button
              onClick={() => handleStatusFilter('rejected')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === 'rejected'
                  ? 'bg-red-500 text-white'
                  : 'bg-card text-card-foreground border border-border hover:bg-muted'
              }`}
            >
              Rejected ({statusCounts.rejected})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-lg">
          <BugReportTable
            bugReports={bugReports}
            loading={loading}
            onViewDetails={handleViewDetails}
          />
        </div>
      </main>

      {/* Details Modal */}
      {showDetailsModal && selectedBugReport && (
        <BugReportDetailsModal
          bugReportId={selectedBugReport}
          isOpen={showDetailsModal}
          onClose={handleCloseModal}
        />
      )}


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

export default function BugReportPage() {
  return <BugReportContent />;
}
