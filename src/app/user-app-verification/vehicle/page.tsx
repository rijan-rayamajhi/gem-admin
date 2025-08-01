'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/HomeLayout';
import Notification from '@/components/Notification';
import { vehicleVerificationService, VehicleVerification } from '@/lib/vehicleVerificationService';



export default function VehicleVerificationPage() {
  const { user } = useAuth();
  const [verifications, setVerifications] = useState<VehicleVerification[]>([]);
  const [filteredVerifications, setFilteredVerifications] = useState<VehicleVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    isVisible: boolean;
  } | null>(null);

  // Load vehicle verifications on component mount
  useEffect(() => {
    loadVehicleVerifications();
  }, []);

  // Filter verifications based on search and filters
  useEffect(() => {
    let filtered = verifications;

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((verification) => {
        const userName = (verification.userName || '').toLowerCase();
        const userEmail = (verification.userEmail || '').toLowerCase();
        const vehicleNumber = (verification.vehicleNumber || '').toLowerCase();
        const brand = (verification.brand || '').toLowerCase();
        const model = (verification.model || '').toLowerCase();
        
        return userName.includes(searchLower) ||
               userEmail.includes(searchLower) ||
               vehicleNumber.includes(searchLower) ||
               brand.includes(searchLower) ||
               model.includes(searchLower);
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((verification) => verification.status === statusFilter);
    }

    // Vehicle type filter
    if (vehicleTypeFilter !== 'all') {
      filtered = filtered.filter((verification) => {
        const vehicleType = verification.vehicleType || '';
        // Handle both formatted and raw vehicle types
        if (vehicleTypeFilter === 'Two Wheeler') {
          return vehicleType === 'two_wheeler' || vehicleType === 'Motorcycle';
        } else if (vehicleTypeFilter === 'Four Wheeler') {
          return vehicleType === 'four_wheeler' || vehicleType === 'Car';
        } else if (vehicleTypeFilter === 'Two Wheeler Electric') {
          return vehicleType === 'two_wheeler_electric';
        } else if (vehicleTypeFilter === 'Four Wheeler Electric') {
          return vehicleType === 'four_wheeler_electric';
        }
        return vehicleType === vehicleTypeFilter;
      });
    }

    // Brand filter
    if (brandFilter !== 'all') {
      filtered = filtered.filter((verification) => {
        const brand = verification.brand || '';
        return brand.toLowerCase() === brandFilter.toLowerCase();
      });
    }

    setFilteredVerifications(filtered);
  }, [searchTerm, statusFilter, vehicleTypeFilter, brandFilter, verifications]);

  const loadVehicleVerifications = async () => {
    try {
      setLoading(true);
      const data = await vehicleVerificationService.getVehicleVerifications();
      setVerifications(data);
    } catch (error) {
      console.error('Error loading vehicle verifications:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load vehicle verifications',
        isVisible: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      notVerified: 'bg-gray-100 text-gray-800',
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getVehicleTypeColor = (type: string) => {
    const colors = {
      Motorcycle: 'bg-blue-100 text-blue-800',
      Car: 'bg-green-100 text-green-800',
      two_wheeler: 'bg-blue-100 text-blue-800',
      four_wheeler: 'bg-green-100 text-green-800',
      two_wheeler_electric: 'bg-cyan-100 text-cyan-800',
      four_wheeler_electric: 'bg-emerald-100 text-emerald-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatVehicleType = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'two_wheeler': 'Two Wheeler',
      'four_wheeler': 'Four Wheeler',
      'two_wheeler_electric': 'Two Wheeler Electric',
      'four_wheeler_electric': 'Four Wheeler Electric',
      'Motorcycle': 'Motorcycle',
      'Car': 'Car',
    };
    return typeMap[type] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleStatusUpdate = async (verification: VehicleVerification, newStatus: 'approved' | 'rejected', notes?: string) => {
    try {
      setLoading(true);
      
      // Update the verification status in Firebase
      await vehicleVerificationService.updateVehicleStatus(
        verification.userId,
        verification.id,
        newStatus,
        user?.email || 'admin',
        notes
      );

      // Reload the data to get the updated information
      await loadVehicleVerifications();

      setNotification({
        type: 'success',
        message: `Vehicle verification ${newStatus} successfully!`,
        isVisible: true,
      });
    } catch (error) {
      console.error('Error updating verification status:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update verification status',
        isVisible: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    const total = verifications.length;
    const notVerified = verifications.filter(v => v.status === 'notVerified').length;
    const approved = verifications.filter(v => v.status === 'approved').length;
    const pending = verifications.filter(v => v.status === 'pending').length;
    const rejected = verifications.filter(v => v.status === 'rejected').length;

    return { total, notVerified, approved, pending, rejected };
  };

  const getUniqueBrands = () => {
    const brands = verifications
      .map(v => v.brand)
      .filter(brand => brand && brand.trim() !== '') // Filter out null, undefined, and empty strings
      .map(brand => brand.trim()); // Trim whitespace
    
    return [...new Set(brands)].sort(); // Remove duplicates and sort alphabetically
  };

  const getUniqueVehicleTypes = () => {
    const types = verifications
      .map(v => v.vehicleType)
      .filter(type => type && type.trim() !== '') // Filter out null, undefined, and empty strings
      .map(type => formatVehicleType(type)); // Format the vehicle type
    
    return [...new Set(types)].sort(); // Remove duplicates and sort alphabetically
  };

  const stats = getStats();
  const uniqueBrands = getUniqueBrands();

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vehicle Verification</h1>
              <p className="text-gray-600">Manage user vehicle verification requests</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-gray-100">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Not Verified</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.notVerified}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                </div>
              </div>
            </div>


          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Filters</h3>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setVehicleTypeFilter('all');
                  setBrandFilter('all');
                }}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear All Filters
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search by name, email, vehicle number, brand, or model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="notVerified">Not Verified</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                <select
                  value={vehicleTypeFilter}
                  onChange={(e) => setVehicleTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="Two Wheeler">Two Wheeler</option>
                  <option value="Four Wheeler">Four Wheeler</option>
                  <option value="Two Wheeler Electric">Two Wheeler Electric</option>
                  <option value="Four Wheeler Electric">Four Wheeler Electric</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Brands</option>
                  {uniqueBrands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Verifications Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Vehicle Verifications</h3>
                <div className="text-sm text-gray-500">
                  Showing {filteredVerifications.length} of {verifications.length} verifications
                  {(searchTerm || statusFilter !== 'all' || vehicleTypeFilter !== 'all' || brandFilter !== 'all') && (
                    <span className="ml-2 text-blue-600">
                      (filtered)
                    </span>
                  )}
                </div>
              </div>
            </div>
            {loading ? (
              <div className="px-6 py-12 text-center">
                <div className="flex flex-col items-center">
                  <svg className="w-16 h-16 text-gray-400 mb-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Loading vehicle verifications...</h3>
                  <p className="text-gray-500">Please wait while we fetch the data.</p>
                </div>
              </div>
            ) : filteredVerifications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="flex flex-col items-center">
                  <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicle verifications found</h3>
                  <p className="text-gray-500">
                    {verifications.length === 0 
                      ? "There are no vehicle verification requests at the moment."
                      : "No vehicle verifications match your current filters. Try adjusting your search criteria."
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vehicle Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
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
                    {filteredVerifications.map((verification) => (
                      <tr key={verification.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{verification.userName}</div>
                            <div className="text-sm text-gray-500">{verification.userEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{verification.vehicleNumber || 'N/A'}</div>
                            <div className="text-sm text-gray-500">
                              {[
                                verification.brand,
                                verification.model,
                                verification.year ? `(${verification.year})` : null
                              ].filter(Boolean).join(' ') || 'No vehicle details'}
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVehicleTypeColor(verification.vehicleType)}`}>
                              {formatVehicleType(verification.vehicleType)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(verification.status)}`}>
                            {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(verification.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {verification.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(verification, 'approved')}
                                  disabled={loading}
                                  className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(verification, 'rejected')}
                                  disabled={loading}
                                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {(verification.status === 'approved' || verification.status === 'rejected') && (
                              <span className="text-gray-500 text-sm">
                                {verification.status === 'approved' ? 'Approved' : 'Rejected'} by {verification.verifiedBy}
                              </span>
                            )}
                            {verification.status === 'notVerified' && (
                              <span className="text-gray-500 text-sm">
                                Not submitted for verification
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

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