'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/HomeLayout';
import Notification from '@/components/Notification';
import { vehicleVerificationService, VehicleVerification } from '@/lib/vehicleVerificationService';



interface ViewVehicleModalProps {
  verification: VehicleVerification | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatDate = (dateValue: any) => {
  if (!dateValue) return 'N/A';
  
  let date: Date;
  if (typeof dateValue === 'string') {
    date = new Date(dateValue);
  } else if (dateValue && dateValue.toDate) {
    // Firebase Timestamp
    date = dateValue.toDate();
  } else {
    date = new Date(dateValue);
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

function ViewVehicleModal({ verification, isOpen, onClose }: ViewVehicleModalProps) {
  if (!isOpen || !verification) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Vehicle Verification Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* User Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">User Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="text-sm text-gray-900">{verification.userName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900">{verification.userEmail}</p>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Vehicle Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                <p className="text-sm text-gray-900 font-mono">{verification.registrationNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
                <p className="text-sm text-gray-900">{verification.vehicleType}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Brand</label>
                <p className="text-sm text-gray-900">{verification.brandName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Model</label>
                <p className="text-sm text-gray-900">{verification.modelName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tyre Type</label>
                <p className="text-sm text-gray-900">{verification.tyreType}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  verification.status === 'approved' ? 'bg-green-100 text-green-800' :
                  verification.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  verification.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Brand Image */}
          {verification.brandImage && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Brand Image</h3>
              <div className="flex justify-center">
                <img
                  src={verification.brandImage}
                  alt={`${verification.brandName} logo`}
                  className="max-w-32 max-h-32 object-contain rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          {/* RC Documents */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">RC Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {verification.rcFrontView && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">RC Front View</label>
                  <img
                    src={verification.rcFrontView}
                    alt="RC Front View"
                    className="w-full h-48 object-cover rounded-lg border border-gray-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              {verification.rcBackView && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">RC Back View</label>
                  <img
                    src={verification.rcBackView}
                    alt="RC Back View"
                    className="w-full h-48 object-cover rounded-lg border border-gray-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Images */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Vehicle Images</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {verification.vehicleFrontView && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Front View</label>
                  <img
                    src={verification.vehicleFrontView}
                    alt="Vehicle Front View"
                    className="w-full h-48 object-cover rounded-lg border border-gray-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              {verification.vehicleBackView && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Back View</label>
                  <img
                    src={verification.vehicleBackView}
                    alt="Vehicle Back View"
                    className="w-full h-48 object-cover rounded-lg border border-gray-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            
            {/* Additional Vehicle Images */}
            {verification.vehicleImages && verification.vehicleImages.length > 0 && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Images</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {verification.vehicleImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Vehicle Image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Verification Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Verification Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Created At</label>
                <p className="text-sm text-gray-900">
                  {formatDate(verification.createdAt)}
                </p>
              </div>
              {verification.verificationSubmittedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Submitted For Verification</label>
                  <p className="text-sm text-gray-900">
                    {formatDate(verification.verificationSubmittedAt)}
                  </p>
                </div>
              )}
              {verification.verifiedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Verified At</label>
                  <p className="text-sm text-gray-900">
                    {formatDate(verification.verifiedAt)}
                  </p>
                </div>
              )}
              {verification.verifiedBy && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Verified By</label>
                  <p className="text-sm text-gray-900">{verification.verifiedBy}</p>
                </div>
              )}
            </div>
            {verification.notes && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <p className="text-sm text-gray-900 bg-white p-2 rounded border">{verification.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VehicleVerificationPage() {
  const { user } = useAuth();
  const [verifications, setVerifications] = useState<VehicleVerification[]>([]);
  const [filteredVerifications, setFilteredVerifications] = useState<VehicleVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [selectedVerification, setSelectedVerification] = useState<VehicleVerification | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
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
        const registrationNumber = (verification.registrationNumber || '').toLowerCase();
        const brandName = (verification.brandName || '').toLowerCase();
        const modelName = (verification.modelName || '').toLowerCase();
        
        return userName.includes(searchLower) ||
               userEmail.includes(searchLower) ||
               registrationNumber.includes(searchLower) ||
               brandName.includes(searchLower) ||
               modelName.includes(searchLower);
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
        return vehicleType.toLowerCase() === vehicleTypeFilter.toLowerCase();
      });
    }

    // Brand filter
    if (brandFilter !== 'all') {
      filtered = filtered.filter((verification) => {
        const brandName = verification.brandName || '';
        return brandName.toLowerCase() === brandFilter.toLowerCase();
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
      'two_wheeler': 'bg-blue-100 text-blue-800',
      'four_wheeler': 'bg-green-100 text-green-800',
      'two_wheeler_electric': 'bg-cyan-100 text-cyan-800',
      'four_wheeler_electric': 'bg-emerald-100 text-emerald-800',
      'Motorcycle': 'bg-blue-100 text-blue-800',
      'Car': 'bg-green-100 text-green-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateValue: any) => {
    if (!dateValue) return 'N/A';
    
    let date: Date;
    if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else if (dateValue && dateValue.toDate) {
      // Firebase Timestamp
      date = dateValue.toDate();
    } else {
      date = new Date(dateValue);
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleStatusUpdate = async (verification: VehicleVerification, newStatus: 'approved' | 'rejected', notes?: string) => {
    try {
      setLoading(true);
      
      // Update the verification status in Firebase
      if (newStatus === 'approved') {
        await vehicleVerificationService.approveVehicle(
          verification.userId,
          verification.id,
          user?.email || 'admin',
          notes
        );
      } else {
        await vehicleVerificationService.rejectVehicle(
          verification.userId,
          verification.id,
          user?.email || 'admin',
          notes
        );
      }

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

  const handleViewVerification = (verification: VehicleVerification) => {
    setSelectedVerification(verification);
    setShowViewModal(true);
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
      .map(v => v.brandName)
      .filter(brand => brand && brand.trim() !== '')
      .map(brand => brand.trim());
    
    return [...new Set(brands)].sort();
  };

  const getUniqueVehicleTypes = () => {
    const types = verifications
      .map(v => v.vehicleType)
      .filter(type => type && type.trim() !== '');
    
    return [...new Set(types)].sort();
  };

  const stats = getStats();
  const uniqueBrands = getUniqueBrands();
  const uniqueVehicleTypes = getUniqueVehicleTypes();

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
                  placeholder="Search by name, email, registration number, brand, or model..."
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
                  {uniqueVehicleTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
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
                            <div className="text-sm font-medium text-gray-900 font-mono">
                              {verification.registrationNumber || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {[
                                verification.brandName,
                                verification.modelName,
                                verification.tyreType
                              ].filter(Boolean).join(' • ') || 'No vehicle details'}
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVehicleTypeColor(verification.vehicleType)}`}>
                              {verification.vehicleType}
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
                            <button
                              onClick={() => handleViewVerification(verification)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </button>
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

        {/* View Vehicle Modal */}
        <ViewVehicleModal
          verification={selectedVerification}
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedVerification(null);
          }}
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