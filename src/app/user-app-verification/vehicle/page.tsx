'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import Notification from '@/components/Notification';

interface VehicleVerification {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  vehicleNumber: string;
  vehicleType: string;
  brand: string;
  model: string;
  year: string;
  registrationAuthority: string;
  registrationDate: string;
  expiryDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  documentUrl: string;
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
}

const mockVehicleVerifications: VehicleVerification[] = [
  {
    id: '1',
    userId: 'user123',
    userName: 'John Doe',
    userEmail: 'john.doe@example.com',
    vehicleNumber: 'ABC123456',
    vehicleType: 'Motorcycle',
    brand: 'Honda',
    model: 'CBR 600RR',
    year: '2022',
    registrationAuthority: 'Department of Motor Vehicles',
    registrationDate: '2022-03-15',
    expiryDate: '2027-03-15',
    status: 'pending',
    documentUrl: '/sample-vehicle.jpg',
    submittedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    userId: 'user456',
    userName: 'Jane Smith',
    userEmail: 'jane.smith@example.com',
    vehicleNumber: 'XYZ789012',
    vehicleType: 'Car',
    brand: 'Toyota',
    model: 'Camry',
    year: '2021',
    registrationAuthority: 'Department of Motor Vehicles',
    registrationDate: '2021-08-20',
    expiryDate: '2026-08-20',
    status: 'approved',
    documentUrl: '/sample-vehicle.jpg',
    submittedAt: '2024-01-10T14:20:00Z',
    verifiedAt: '2024-01-12T09:15:00Z',
    verifiedBy: 'admin@gem.com',
  },
  {
    id: '3',
    userId: 'user789',
    userName: 'Mike Johnson',
    userEmail: 'mike.johnson@example.com',
    vehicleNumber: 'DEF345678',
    vehicleType: 'Motorcycle',
    brand: 'Yamaha',
    model: 'YZF R1',
    year: '2023',
    registrationAuthority: 'Department of Motor Vehicles',
    registrationDate: '2023-01-10',
    expiryDate: '2028-01-10',
    status: 'rejected',
    documentUrl: '/sample-vehicle.jpg',
    submittedAt: '2024-01-08T16:45:00Z',
    verifiedAt: '2024-01-09T11:30:00Z',
    verifiedBy: 'admin@gem.com',
    notes: 'Registration document is not clearly visible, please resubmit',
  },
  {
    id: '4',
    userId: 'user101',
    userName: 'Sarah Wilson',
    userEmail: 'sarah.wilson@example.com',
    vehicleNumber: 'GHI901234',
    vehicleType: 'Car',
    brand: 'BMW',
    model: 'X5',
    year: '2020',
    registrationAuthority: 'Department of Motor Vehicles',
    registrationDate: '2020-05-05',
    expiryDate: '2025-05-05',
    status: 'expired',
    documentUrl: '/sample-vehicle.jpg',
    submittedAt: '2024-01-05T12:00:00Z',
  },
];

export default function VehicleVerificationPage() {
  const { user } = useAuth();
  const [verifications, setVerifications] = useState<VehicleVerification[]>(mockVehicleVerifications);
  const [filteredVerifications, setFilteredVerifications] = useState<VehicleVerification[]>(mockVehicleVerifications);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    isVisible: boolean;
  } | null>(null);

  // Filter verifications based on search and filters
  useEffect(() => {
    let filtered = verifications;

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter((verification) =>
        verification.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        verification.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        verification.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        verification.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        verification.model.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((verification) => verification.status === statusFilter);
    }

    // Vehicle type filter
    if (vehicleTypeFilter !== 'all') {
      filtered = filtered.filter((verification) => verification.vehicleType === vehicleTypeFilter);
    }

    // Brand filter
    if (brandFilter !== 'all') {
      filtered = filtered.filter((verification) => verification.brand === brandFilter);
    }

    setFilteredVerifications(filtered);
  }, [searchTerm, statusFilter, vehicleTypeFilter, brandFilter, verifications]);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getVehicleTypeColor = (type: string) => {
    const colors = {
      Motorcycle: 'bg-blue-100 text-blue-800',
      Car: 'bg-green-100 text-green-800',
      Truck: 'bg-purple-100 text-purple-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleStatusUpdate = async (verificationId: string, newStatus: 'approved' | 'rejected', notes?: string) => {
    try {
      setLoading(true);
      
      // Update the verification status
      setVerifications(prev => prev.map(verification => 
        verification.id === verificationId 
          ? {
              ...verification,
              status: newStatus,
              verifiedAt: new Date().toISOString(),
              verifiedBy: user?.email || 'admin',
              notes: notes || verification.notes
            }
          : verification
      ));

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
    const pending = verifications.filter(v => v.status === 'pending').length;
    const approved = verifications.filter(v => v.status === 'approved').length;
    const rejected = verifications.filter(v => v.status === 'rejected').length;
    const expired = verifications.filter(v => v.status === 'expired').length;

    return { total, pending, approved, rejected, expired };
  };

  const getUniqueBrands = () => {
    return [...new Set(verifications.map(v => v.brand))];
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

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-gray-100">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Expired</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6">
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
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="expired">Expired</option>
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
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Car">Car</option>
                  <option value="Truck">Truck</option>
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
              <h3 className="text-lg font-medium text-gray-900">Vehicle Verifications</h3>
            </div>
            {filteredVerifications.length === 0 ? (
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
                        Submitted
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
                            <div className="text-sm font-medium text-gray-900">{verification.vehicleNumber}</div>
                            <div className="text-sm text-gray-500">{verification.brand} {verification.model} ({verification.year})</div>
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
                          {formatDate(verification.submittedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {/* View document */}}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </button>
                            {verification.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(verification.id, 'approved')}
                                  disabled={loading}
                                  className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(verification.id, 'rejected')}
                                  disabled={loading}
                                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </>
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