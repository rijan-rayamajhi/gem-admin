'use client';

import { useState } from 'react';
import { useVehicleBrand } from '../providers/VehicleBrandProvider';
import VehicleBrandTable from './VehicleBrandTable';
import VehicleBrandForm from './VehicleBrandForm';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import PullToRefresh from '@/components/PullToRefresh';

export default function VehicleBrandPage() {
  const { 
    vehicleBrands, 
    loading, 
    error, 
    selectedVehicleBrand,
    getAllVehicleBrands,
    deleteVehicleBrand,
    setSelectedVehicleBrand,
    clearError 
  } = useVehicleBrand();

  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const handleRefresh = async () => {
    await getAllVehicleBrands();
  };

  const handleAddBrand = () => {
    setSelectedVehicleBrand(null);
    setShowForm(true);
  };

  const handleEditBrand = (brandId: string) => {
    const brand = vehicleBrands.find(b => b.id === brandId);
    if (brand) {
      setSelectedVehicleBrand(brand);
      setShowForm(true);
    }
  };

  const handleDeleteBrand = (brandId: string) => {
    setBrandToDelete(brandId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (brandToDelete) {
      try {
        await deleteVehicleBrand(brandToDelete);
        setShowDeleteConfirm(false);
        setBrandToDelete(null);
      } catch (error) {
        console.error('Failed to delete vehicle brand:', error);
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedVehicleBrand(null);
  };

  // Filter vehicle brands based on search and type
  const filteredBrands = vehicleBrands.filter(brand => {
    const matchesSearch = brand.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                         brand.models.some((model: string) => model.toLowerCase().includes(searchFilter.toLowerCase()));
    const matchesType = typeFilter === 'all' || brand.vehicleType === typeFilter;
    return matchesSearch && matchesType;
  });

  const vehicleTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'two_wheeler', label: 'Two Wheeler' },
    { value: 'four_wheeler', label: 'Four Wheeler' },
    { value: 'two_wheeler_electric', label: 'Two Wheeler Electric' },
    { value: 'four_wheeler_electric', label: 'Four Wheeler Electric' },
  ];

  return (
    <PullToRefresh onRefresh={handleRefresh} className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center min-w-0 flex-1">
              <button
                onClick={() => window.history.back()}
                className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3 flex-shrink-0 hover:bg-primary/90 transition-colors"
                aria-label="Go back"
              >
                <svg className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-card-foreground truncate">Vehicle Brands</h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <button
                onClick={handleAddBrand}
                className="bg-primary text-primary-foreground px-3 sm:px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                Add Brand
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex justify-between items-start">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600 transition-colors"
                aria-label="Dismiss error"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Filter */}
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search brands or models..."
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

          {/* Type Filter */}
          <div className="flex flex-wrap gap-2">
            {vehicleTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setTypeFilter(type.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  typeFilter === type.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Results Count */}
          {(searchFilter || typeFilter !== 'all') && (
            <div className="text-sm text-muted-foreground">
              {filteredBrands.length === 0 ? (
                <span>No brands found matching your criteria</span>
              ) : (
                <span>{filteredBrands.length} brand{filteredBrands.length !== 1 ? 's' : ''} found</span>
              )}
            </div>
          )}
        </div>

        {/* Vehicle Brands Table */}
        <VehicleBrandTable
          vehicleBrands={filteredBrands}
          loading={loading}
          onEdit={handleEditBrand}
          onDelete={handleDeleteBrand}
        />
      </main>

      {/* Vehicle Brand Form Modal */}
      {showForm && (
        <VehicleBrandForm
          vehicleBrand={selectedVehicleBrand}
          onClose={handleFormClose}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setBrandToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Vehicle Brand"
        message="Are you sure you want to delete this vehicle brand? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </PullToRefresh>
  );
}
