'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth/presentation/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useCarouselAds } from '../providers/CarouselAdProvider';
import { CarouselAd } from '../../domain/entities/CarouselAd';
import CarouselAdForm from './CarouselAdForm';
import CarouselAdTable from './CarouselAdTable';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import PullToRefresh from '@/components/PullToRefresh';

function CarouselAdContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { carouselAds, loading, error, deleteCarouselAd, refreshCarouselAds, clearError } = useCarouselAds();
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<CarouselAd | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | 'all'>('all');

  const loadCarouselAds = useCallback(async () => {
    // Always load all ads, filtering will be done client-side
    await refreshCarouselAds();
  }, [refreshCarouselAds]);

  useEffect(() => {
    loadCarouselAds();
  }, [loadCarouselAds]);


  const handleFilterChange = (filter: string | 'all') => {
    setSelectedFilter(filter);
  };

  const handleAddNew = () => {
    setEditingAd(null);
    setShowForm(true);
  };

  const handleEdit = (ad: CarouselAd) => {
    setEditingAd(ad);
    setShowForm(true);
  };

  const handleDelete = (ad: CarouselAd) => {
    setDeleteConfirm({ id: ad.id, title: ad.title });
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      try {
        await deleteCarouselAd(deleteConfirm.id);
        setDeleteConfirm(null);
      } catch (error) {
        console.error('Failed to delete carousel ad:', error);
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingAd(null);
  };

  const handleRefresh = async () => {
    await loadCarouselAds();
  };

  const getFilterCounts = () => {
    const counts = {
      all: carouselAds.length,
      active: 0,
      inactive: 0,
      expired: 0,
    };

    carouselAds.forEach(ad => {
      // Active/Inactive counts
      if (ad.isActive) counts.active++;
      else counts.inactive++;

      // Expired ads (endDate is in the past)
      if (ad.scheduling.enabled && ad.scheduling.endDate) {
        try {
          const endDate = new Date(ad.scheduling.endDate);
          if (!isNaN(endDate.getTime()) && endDate < new Date()) {
            counts.expired++;
          }
        } catch {
          // Invalid date, skip
        }
      }
    });

    return counts;
  };

  const getFilteredAds = () => {
    if (selectedFilter === 'all') {
      return carouselAds;
    }

    return carouselAds.filter(ad => {
      switch (selectedFilter) {
        case 'active':
          return ad.isActive;
        case 'inactive':
          return !ad.isActive;
        case 'expired':
          if (!ad.scheduling.enabled || !ad.scheduling.endDate) return false;
          try {
            const endDate = new Date(ad.scheduling.endDate);
            return !isNaN(endDate.getTime()) && endDate < new Date();
          } catch {
            return false;
          }
        default:
          return true;
      }
    });
  };

  const statusCounts = getFilterCounts();
  const filteredAds = getFilteredAds();

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
              <h1 className="text-xl font-semibold text-card-foreground truncate">Carousel Ads</h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <button
                onClick={handleAddNew}
                className="bg-primary text-primary-foreground px-3 sm:px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                Add New Ad
              </button>
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
          <h2 className="text-xl sm:text-2xl font-bold text-card-foreground mb-2">Carousel Ads</h2>
          <p className="text-muted-foreground text-sm sm:text-base">Create and manage carousel advertisements with location targeting and scheduling</p>
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

        {/* Filter Buttons */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-card-foreground border border-border hover:bg-muted'
              }`}
            >
              All ({statusCounts.all})
            </button>
            <button
              onClick={() => handleFilterChange('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === 'active'
                  ? 'bg-green-500 text-white'
                  : 'bg-card text-card-foreground border border-border hover:bg-muted'
              }`}
            >
              Active ({statusCounts.active})
            </button>
            <button
              onClick={() => handleFilterChange('inactive')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === 'inactive'
                  ? 'bg-gray-500 text-white'
                  : 'bg-card text-card-foreground border border-border hover:bg-muted'
              }`}
            >
              Inactive ({statusCounts.inactive})
            </button>
            <button
              onClick={() => handleFilterChange('expired')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === 'expired'
                  ? 'bg-red-500 text-white'
                  : 'bg-card text-card-foreground border border-border hover:bg-muted'
              }`}
            >
              Expired ({statusCounts.expired})
            </button>
          </div>
        </div>

        {/* Table */}
        <CarouselAdTable 
          carouselAds={filteredAds}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CarouselAdForm 
              carouselAd={editingAd}
              onClose={handleFormClose}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Carousel Ad"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
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

export default function CarouselAdPage() {
  return <CarouselAdContent />;
}
