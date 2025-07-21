'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { licenseVerificationService, DrivingLicense } from '@/lib/licenseVerificationService';
import Notification from '@/components/Notification';

export default function LicenseVerificationPage() {
  const {} = useAuth();
  const [verifications, setVerifications] = useState<DrivingLicense[]>([]);
  const [filteredVerifications, setFilteredVerifications] = useState<DrivingLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [licenseTypeFilter, setLicenseTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    isVisible: boolean;
  } | null>(null);

  // Load license verifications
  useEffect(() => {
    loadLicenseVerifications();
  }, []);

  const loadLicenseVerifications = async () => {
    try {
      setLoading(true);
      const data = await licenseVerificationService.getAllLicenseVerifications();
      setVerifications(data);
      setFilteredVerifications(data);
    } catch (error) {
      console.error('Error loading license verifications:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load license verifications',
        isVisible: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter verifications based on search and filters
  useEffect(() => {
    let filtered = verifications;

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((verification) =>
        verification.user_name?.toLowerCase().includes(searchLower) ||
        verification.user_email?.toLowerCase().includes(searchLower) ||
        verification.license_type.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((verification) => verification.verification_status === statusFilter);
    }

    // License type filter
    if (licenseTypeFilter !== 'all') {
      filtered = filtered.filter((verification) => verification.license_type === licenseTypeFilter);
    }

    setFilteredVerifications(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter, licenseTypeFilter, verifications]);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getLicenseTypeColor = (type: string) => {
    const colors = {
      'Motorcycle': 'bg-blue-100 text-blue-800',
      'Car': 'bg-green-100 text-green-800',
      'Commercial': 'bg-purple-100 text-purple-800',
      'Heavy Vehicle': 'bg-orange-100 text-orange-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string | any) => {
    if (!dateString) return 'N/A';
    
    try {
      let date: Date;
      
      // Handle Firestore Timestamp objects
      if (dateString && typeof dateString === 'object' && dateString.toDate) {
        date = dateString.toDate();
      }
      // Handle timestamp numbers
      else if (typeof dateString === 'number') {
        date = new Date(dateString);
      }
      // Handle string dates
      else if (typeof dateString === 'string') {
        date = new Date(dateString);
      }
      // Handle Date objects
      else if (dateString instanceof Date) {
        date = dateString;
      }
      else {
        console.warn('Unknown date format:', dateString);
        return 'Invalid Date';
      }
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString);
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Invalid Date';
    }
  };

  const handleStatusUpdate = async (verification: DrivingLicense, newStatus: 'verified' | 'rejected', notes?: string) => {
    try {
      setActionLoading(verification.id);
      
      await licenseVerificationService.updateLicenseVerificationStatus(
        verification.userId,
        newStatus,
        notes
      );

      // Reload the data to get updated information
      await loadLicenseVerifications();

      setNotification({
        type: 'success',
        message: `License verification ${newStatus} successfully!`,
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
      setActionLoading(null);
    }
  };

  const getStats = () => {
    const total = verifications.length;
    const pending = verifications.filter(v => v.verification_status === 'pending').length;
    const verified = verifications.filter(v => v.verification_status === 'verified').length;
    const rejected = verifications.filter(v => v.verification_status === 'rejected').length;

    return { total, pending, verified, rejected };
  };

  const stats = getStats();

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">License Verification</h1>
              <p className="text-gray-600">Review and manage driving license verifications</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Licenses</p>
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
                  <p className="text-sm font-medium text-gray-600">Verified</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search by user name, email, or license type..."
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
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">License Type</label>
                <select
                  value={licenseTypeFilter}
                  onChange={(e) => setLicenseTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Car">Car</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Heavy Vehicle">Heavy Vehicle</option>
                </select>
              </div>
            </div>
          </div>

          {/* License Verifications Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">License Verifications</h3>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredVerifications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="flex flex-col items-center">
                  <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No license verifications found</h3>
                  <p className="text-gray-500">
                    {verifications.length === 0 
                      ? "There are no license verifications submitted yet."
                      : "No verifications match your current filters. Try adjusting your search criteria."
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
                        User & License
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        License Images
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
                    {filteredVerifications
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((verification) => (
                      <tr key={verification.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLicenseTypeColor(verification.license_type)}`}>
                                {verification.license_type}
                              </span>
                            </div>
                            <div className="text-sm font-medium text-gray-900">{verification.user_name}</div>
                            <div className="text-sm text-gray-500">{verification.user_email}</div>
                            <div className="text-sm text-gray-500">User ID: {verification.userId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            {verification.front_image_url && (
                              <div className="relative">
                                <img
                                  src={verification.front_image_url}
                                  alt="Front of license"
                                  className="w-16 h-12 object-cover rounded border border-gray-300 cursor-pointer hover:opacity-75"
                                  onClick={() => window.open(verification.front_image_url, '_blank')}
                                />
                                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1 rounded">F</span>
                              </div>
                            )}
                            {verification.back_image_url && (
                              <div className="relative">
                                <img
                                  src={verification.back_image_url}
                                  alt="Back of license"
                                  className="w-16 h-12 object-cover rounded border border-gray-300 cursor-pointer hover:opacity-75"
                                  onClick={() => window.open(verification.back_image_url, '_blank')}
                                />
                                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 rounded">B</span>
                              </div>
                            )}
                            {!verification.front_image_url && !verification.back_image_url && (
                              <span className="text-sm text-gray-500">No images</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(verification.verification_status)}`}>
                            {verification.verification_status.charAt(0).toUpperCase() + verification.verification_status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(verification.submitted_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {verification.verification_status === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleStatusUpdate(verification, 'verified')}
                                disabled={actionLoading === verification.id}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              >
                                {actionLoading === verification.id ? 'Verifying...' : 'Verify'}
                              </button>
                              <button
                                onClick={() => {
                                  const notes = prompt('Enter rejection reason (optional):');
                                  if (notes !== null) {
                                    handleStatusUpdate(verification, 'rejected', notes);
                                  }
                                }}
                                disabled={actionLoading === verification.id}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              >
                                {actionLoading === verification.id ? 'Rejecting...' : 'Reject'}
                              </button>
                            </div>
                          )}
                          {verification.verification_status === 'rejected' && (
                            <button
                              onClick={() => handleStatusUpdate(verification, 'verified')}
                              disabled={actionLoading === verification.id}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            >
                              {actionLoading === verification.id ? 'Verifying...' : 'Verify'}
                            </button>
                          )}
                          {verification.verification_status === 'verified' && (
                            <button
                              onClick={() => {
                                const notes = prompt('Enter rejection reason (optional):');
                                if (notes !== null) {
                                  handleStatusUpdate(verification, 'rejected', notes);
                                }
                              }}
                              disabled={actionLoading === verification.id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              {actionLoading === verification.id ? 'Rejecting...' : 'Reject'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredVerifications.length > itemsPerPage && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(Math.ceil(filteredVerifications.length / itemsPerPage), currentPage + 1))}
                  disabled={currentPage >= Math.ceil(filteredVerifications.length / itemsPerPage)}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                    {' '}to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, filteredVerifications.length)}
                    </span>
                    {' '}of{' '}
                    <span className="font-medium">{filteredVerifications.length}</span>
                    {' '}results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(Math.ceil(filteredVerifications.length / itemsPerPage), currentPage + 1))}
                      disabled={currentPage >= Math.ceil(filteredVerifications.length / itemsPerPage)}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
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