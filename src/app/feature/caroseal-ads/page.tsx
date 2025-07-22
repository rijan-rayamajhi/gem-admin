'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/HomeLayout';
import Notification from '@/components/Notification';
import AddCarosealAdModal from '@/components/AddCarosealAdModal';
import { carosealAdService, CarosealAd } from '@/lib/carosealAdService';

// Type for form data when creating/editing ads
interface CarosealAdFormData {
  title: string;
  description: string;
  adImage?: File | string;
  existingImageUrl?: string;
  actionType: {
    type: 'website' | 'app_screen' | 'location';
    value: string;
    latitude?: number;  // For location type
    longitude?: number; // For location type
  };
  location: {
    type: 'specific' | 'pan_india';
    latitude?: number;
    longitude?: number;
    radius?: number;
  };
  startDate: any; // Timestamp or compatible type
  endDate: any; // Timestamp or compatible type
}
import ViewCarosealAdModal from '@/components/ViewCarosealAdModal';
import GenericDeleteModal from '@/components/GenericDeleteModal';
import { TimestampUtils } from '@/lib/timestampUtils';

export default function CarosealAdsPage() {
  const {} = useAuth();
  const [ads, setAds] = useState<CarosealAd[]>([]);
  const [filteredAds, setFilteredAds] = useState<CarosealAd[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    isVisible: boolean;
  } | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<CarosealAd | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusChangeLoading, setStatusChangeLoading] = useState<string | null>(null);

  // Load ads from Firebase
  useEffect(() => {
    const loadAds = async () => {
      setLoading(true);
      try {
        const fetchedAds = await carosealAdService.getAds();
        setAds(fetchedAds);
        setFilteredAds(fetchedAds);
      } catch (error) {
        console.error('Error loading ads:', error);
        setNotification({
          type: 'error',
          message: 'Failed to load ads',
          isVisible: true,
        });
      } finally {
        setLoading(false);
      }
    };

    loadAds();
  }, []);

  // Filter ads based on search and filters
  useEffect(() => {
    let filtered = ads;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(ad =>
        ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ad => ad.status === statusFilter);
    }

    setFilteredAds(filtered);
  }, [ads, searchTerm, statusFilter]);

  /**
   * Handle creating a new ad - now works directly with Timestamps
   */
  const handleAddAd = async (adData: CarosealAdFormData) => {
    setActionLoading(true);
    try {
      console.log('Starting ad creation process with timestamp data...', adData);
      
      // Upload image first if provided
      let adImageUrl = '';
      if (adData.adImage && adData.adImage instanceof File) {
        console.log('Uploading image...', adData.adImage.name);
        adImageUrl = await carosealAdService.uploadFile(
          adData.adImage,
          `carosealAds/images/${Date.now()}_${adData.adImage.name}`
        );
        console.log('Image uploaded successfully:', adImageUrl);
      }

      // Prepare ad data for Firebase - Timestamps are already in the correct format
      const adDataForFirebase = {
        title: adData.title,
        description: adData.description,
        adImage: adImageUrl,
        actionType: adData.actionType,
        location: adData.location,
        startDate: adData.startDate, // Already a Timestamp
        endDate: adData.endDate,     // Already a Timestamp
      };

      console.log('Creating ad in Firebase with timestamp data:', adDataForFirebase);
      const adId = await carosealAdService.createAd(adDataForFirebase);
      console.log('Ad created successfully with ID:', adId);
      
      // Reload ads
      console.log('Reloading ads...');
      const fetchedAds = await carosealAdService.getAds();
      console.log('Fetched ads:', fetchedAds);
      setAds(fetchedAds);
      
      setNotification({
        type: 'success',
        message: 'Ad created successfully!',
        isVisible: true,
      });
      setAddModalOpen(false);
    } catch (error) {
      console.error('Error creating ad:', error);
      setNotification({
        type: 'error',
        message: `Failed to create ad: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isVisible: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Handle editing an ad - simplified with direct Timestamp usage
   */
  const handleEditAd = async (adData: CarosealAdFormData) => {
    setActionLoading(true);
    try {
      let adImageUrl = selectedAd?.adImage || '';
      
      // If a new file is uploaded, use that
      if (adData.adImage && adData.adImage instanceof File) {
        adImageUrl = await carosealAdService.uploadFile(
          adData.adImage,
          `carosealAds/images/${Date.now()}_${adData.adImage.name}`
        );
      } else if (adData.existingImageUrl) {
        // If no new file but existing image URL is provided, use that
        adImageUrl = adData.existingImageUrl;
      }
      
      // Prepare update data - Timestamps are already in correct format
      const adDataForFirebase = {
        title: adData.title,
        description: adData.description,
        adImage: adImageUrl,
        actionType: adData.actionType,
        location: adData.location,
        startDate: adData.startDate, // Already a Timestamp
        endDate: adData.endDate,     // Already a Timestamp
      };

      await carosealAdService.updateAd(selectedAd!.id!, adDataForFirebase);
      const fetchedAds = await carosealAdService.getAds();
      setAds(fetchedAds);
      
      setNotification({
        type: 'success',
        message: 'Ad updated successfully!',
        isVisible: true,
      });
      setEditModalOpen(false);
      setSelectedAd(null);
    } catch (error) {
      console.error('Error updating ad:', error);
      setNotification({
        type: 'error',
        message: `Failed to update ad: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isVisible: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Delete handler
  const handleDeleteAd = async () => {
    setActionLoading(true);
    try {
      await carosealAdService.deleteAd(selectedAd!.id!);
      const fetchedAds = await carosealAdService.getAds();
      setAds(fetchedAds);
      
      setNotification({
        type: 'success',
        message: 'Ad deleted successfully!',
        isVisible: true,
      });
      setDeleteModalOpen(false);
      setSelectedAd(null);
    } catch (error) {
      console.error('Error deleting ad:', error);
      setNotification({
        type: 'error',
        message: 'Failed to delete ad',
        isVisible: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Status change handler
  const handleStatusChange = async (adId: string, newStatus: CarosealAd['status']) => {
    setStatusChangeLoading(adId);
    try {
      await carosealAdService.updateAdStatus(adId, newStatus);
      const fetchedAds = await carosealAdService.getAds();
      setAds(fetchedAds);
      
      setNotification({
        type: 'success',
        message: `Ad status updated to ${newStatus}!`,
        isVisible: true,
      });
    } catch (error) {
      console.error('Error updating ad status:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update ad status',
        isVisible: true,
      });
    } finally {
      setStatusChangeLoading(null);
    }
  };

  // Sync status handler - updates database status to match computed status
  const handleSyncStatus = async (ad: CarosealAd) => {
    const computedStatus = getComputedAdStatus(ad);
    if (computedStatus === ad.status) {
      setNotification({
        type: 'error',
        message: 'Status is already synchronized',
        isVisible: true,
      });
      return;
    }
    
    // Map computed status to database status
    let newDatabaseStatus: CarosealAd['status'];
    if (computedStatus === 'upcoming') {
      newDatabaseStatus = 'active'; // Keep as active for upcoming ads
    } else {
      newDatabaseStatus = computedStatus as CarosealAd['status']; // active -> active, expired -> expired
    }
    
    await handleStatusChange(ad.id!, newDatabaseStatus);
  };

  // Bulk sync all out-of-sync ads
  const handleBulkSyncStatus = async () => {
    setActionLoading(true);
    try {
      const outOfSyncAds = ads.filter(ad => {
        const computedStatus = getComputedAdStatus(ad);
        return computedStatus !== ad.status;
      });

      if (outOfSyncAds.length === 0) {
        setNotification({
          type: 'error',
          message: 'All ads are already synchronized',
          isVisible: true,
        });
        return;
      }

      // Update all out-of-sync ads
      const updatePromises = outOfSyncAds.map(async (ad) => {
        const computedStatus = getComputedAdStatus(ad);
        let newDatabaseStatus: CarosealAd['status'];
        if (computedStatus === 'upcoming') {
          newDatabaseStatus = 'active';
        } else {
          newDatabaseStatus = computedStatus as CarosealAd['status'];
        }
        return carosealAdService.updateAdStatus(ad.id!, newDatabaseStatus);
      });

      await Promise.all(updatePromises);
      
      // Reload ads
      const fetchedAds = await carosealAdService.getAds();
      setAds(fetchedAds);
      
      setNotification({
        type: 'success',
        message: `Successfully synchronized ${outOfSyncAds.length} ads!`,
        isVisible: true,
      });
    } catch (error) {
      console.error('Error bulk syncing ad statuses:', error);
      setNotification({
        type: 'error',
        message: 'Failed to sync ad statuses',
        isVisible: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Get computed ad status based on current time and Timestamps
   */
  const getComputedAdStatus = (ad: CarosealAd): 'upcoming' | 'active' | 'expired' => {
    return TimestampUtils.getAdStatus(ad.startDate, ad.endDate);
  };

  /**
   * Get status badge styling
   */
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute permission="caroseal-ads">
      <DashboardLayout>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Caroseal Ads</h1>
              <p className="text-gray-600">Manage and monitor all carousel ads</p>
            </div>
            {/* Search and Filter Section */}
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search ads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                {/* Status Filter */}
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                {/* Add Button */}
                <div>
                  <button
                    onClick={() => setAddModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add New Ad
                  </button>
                </div>
                {/* Bulk Sync Button */}
                <div>
                  <button
                    onClick={handleBulkSyncStatus}
                    disabled={actionLoading || ads.filter(ad => getComputedAdStatus(ad) !== ad.status).length === 0}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Sync all out-of-sync ad statuses"
                  >
                    {actionLoading ? 'Syncing...' : `Sync Status (${ads.filter(ad => getComputedAdStatus(ad) !== ad.status).length})`}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Ads Table */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Ads ({filteredAds.length})
              </h2>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading ads...</p>
              </div>
            ) : filteredAds.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7l2 5v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9l2-5h14z" />
                </svg>
                <p className="text-gray-500">No ads found</p>
                <button
                  onClick={() => setAddModalOpen(true)}
                  className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Create your first ad
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Schedule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAds.map((ad) => {
                      const computedStatus = getComputedAdStatus(ad);
                      return (
                        <tr key={ad.id} className="hover:bg-gray-50">
                          {/* Image Column */}
                          <td className="px-6 py-4">
                            <div className="flex-shrink-0 h-16 w-16">
                              {ad.adImage ? (
                                <div className="h-16 w-16 rounded-lg overflow-hidden border border-gray-200">
                                  <img
                                    src={ad.adImage}
                                    alt="Ad"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zNSAzNUg2NVY2NUgzNVYzNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTQwIDQwSDYwVjYwSDQwVjQwWiIgZmlsbD0iI0QxRDVEMyIvPgo8L3N2Zz4K';
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </td>
                          
                          {/* Name Column */}
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {ad.title}
                            </div>
                          </td>
                          
                          {/* Description Column */}
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500 max-w-xs">
                              {ad.description && ad.description.length > 100
                                ? `${ad.description.substring(0, 100)}...`
                                : ad.description}
                            </div>
                          </td>
                          
                          {/* Status Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col space-y-2">
                              {/* Database Status with Dropdown */}
                              <div className="flex items-center space-x-2">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(ad.status)}`}>
                                  {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                                </span>
                                <select
                                  value={ad.status}
                                  onChange={(e) => handleStatusChange(ad.id!, e.target.value as CarosealAd['status'])}
                                  disabled={statusChangeLoading === ad.id}
                                  className="text-xs border border-gray-300 rounded px-1 py-0.5 bg-white focus:ring-1 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                                >
                                  <option value="active">Active</option>
                                  <option value="inactive">Inactive</option>
                                  <option value="expired">Expired</option>
                                </select>
                              </div>
                              
                              {/* Computed Status (if different) */}
                              {computedStatus !== ad.status && (
                                <div className="flex items-center space-x-1">
                                  <span className="text-xs text-gray-500">Real-time:</span>
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(computedStatus)}`}>
                                    {computedStatus.charAt(0).toUpperCase() + computedStatus.slice(1)}
                                  </span>
                                  <button
                                    onClick={() => handleSyncStatus(ad)}
                                    disabled={statusChangeLoading === ad.id}
                                    className="ml-1 px-1 py-0.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 transition-colors"
                                    title="Sync database status with real-time status"
                                  >
                                    Sync
                                  </button>
                                </div>
                              )}
                              
                              {/* Loading indicator */}
                              {statusChangeLoading === ad.id && (
                                <div className="text-xs text-blue-600 flex items-center space-x-1">
                                  <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent"></div>
                                  <span>Updating...</span>
                                </div>
                              )}
                            </div>
                          </td>
                          
                          {/* Schedule Column */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="space-y-1">
                              <div>Start: {TimestampUtils.toDisplayString(ad.startDate, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                              <div>End: {TimestampUtils.toDisplayString(ad.endDate, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                              <div className="text-xs text-gray-400">
                                Duration: {TimestampUtils.daysBetween(ad.startDate, ad.endDate)} days
                              </div>
                            </div>
                          </td>
                          
                          {/* Created Column */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {TimestampUtils.toDisplayString(ad.createdAt, { month: 'short', day: 'numeric' })}
                          </td>
                          
                          {/* Actions Column */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedAd(ad);
                                  setViewModalOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Details"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedAd(ad);
                                  setEditModalOpen(true);
                                }}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedAd(ad);
                                  setDeleteModalOpen(true);
                                }}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Add Ad Modal */}
        <AddCarosealAdModal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSave={handleAddAd}
        />

        {/* Edit Ad Modal */}
        {selectedAd && (
          <AddCarosealAdModal
            isOpen={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setSelectedAd(null);
            }}
            onSave={handleEditAd}
            ad={selectedAd}
            isEditing={true}
          />
        )}

        {/* View Ad Modal */}
        <ViewCarosealAdModal
          isOpen={viewModalOpen && !!selectedAd}
          onClose={() => { setViewModalOpen(false); setSelectedAd(null); }}
          ad={selectedAd as CarosealAd}
          onStatusChange={handleStatusChange}
        />

        {/* Delete Confirmation Modal */}
        <GenericDeleteModal
          isOpen={deleteModalOpen && !!selectedAd}
          onClose={() => { setDeleteModalOpen(false); setSelectedAd(null); }}
          onConfirm={handleDeleteAd}
          title="Delete Ad"
          message="Are you sure you want to delete this ad? This action cannot be undone."
          itemName={selectedAd?.title}
        />

        {/* Notification */}
        {notification && (
          <Notification
            type={notification.type}
            message={notification.message}
            isVisible={notification.isVisible}
            onClose={() => setNotification(null)}
          />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
} 