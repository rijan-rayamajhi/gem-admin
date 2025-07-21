'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { vehicleBrandRequestService, VehicleBrandRequest } from '@/lib/vehicleBrandRequestService';
import { vehicleBrandService } from '@/lib/vehicleBrandService';
import Notification from '@/components/Notification';

export default function VehicleBrandRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<VehicleBrandRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<VehicleBrandRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    isVisible: boolean;
  } | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const allRequests = await vehicleBrandRequestService.getVehicleBrandRequests();
      setRequests(allRequests);
      setFilteredRequests(allRequests);
    } catch (error) {
      console.error('Error loading requests:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load requests',
        isVisible: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter requests based on search and filters
  useEffect(() => {
    let filtered = requests;

    // Search filter with debouncing
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((request) =>
        request.brandName?.toLowerCase().includes(searchLower) ||
        request.modelName?.toLowerCase().includes(searchLower) ||
        request.userName.toLowerCase().includes(searchLower) ||
        request.userEmail.toLowerCase().includes(searchLower) ||
        request.description.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((request) => request.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((request) => request.type === typeFilter);
    }

    setFilteredRequests(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter, typeFilter, requests]);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      brand: 'bg-blue-100 text-blue-800',
      model: 'bg-purple-100 text-purple-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatVehicleType = (vehicleType: string) => {
    const displayNames: { [key: string]: string } = {
      'two_wheeler': 'Two Wheeler',
      'four_wheeler': 'Four Wheeler',
      'two_wheeler_electric': 'Two Wheeler Electric',
      'four_wheeler_electric': 'Four Wheeler Electric',
    };
    return displayNames[vehicleType] || vehicleType;
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleApproveRequest = async (request: VehicleBrandRequest) => {
    try {
      setActionLoading(request.id);

      if (request.type === 'brand') {
        // Add new brand to vehicle brands
        await vehicleBrandService.addVehicleBrand({
          name: request.brandName!,
          status: 'Active',
          models: [],
          vehicleType: request.vehicleType,
          logoUrl: '',
        });
      } else if (request.type === 'model') {
        // Find existing brand and add model to it
        const brands = await vehicleBrandService.getVehicleBrands();
        const existingBrand = brands.find(brand => 
          brand.name.toLowerCase() === request.brandName?.toLowerCase()
        );

        if (existingBrand) {
          const newModel = {
            id: Date.now().toString(),
            name: request.modelName!,
            description: request.modelDescription!,
          };

          await vehicleBrandService.updateVehicleBrand(existingBrand.id!, {
            models: [...existingBrand.models, newModel]
          });
        } else {
          throw new Error('Brand not found');
        }
      }

      // Update request status to approved
      await vehicleBrandRequestService.updateRequestStatus(
        request.id, 
        'approved', 
        `Approved by ${user?.email || 'admin'}`
      );

      setNotification({
        type: 'success',
        message: `${request.type === 'brand' ? 'Brand' : 'Model'} request approved and added successfully!`,
        isVisible: true,
      });

      // Reload requests
      await loadRequests();

    } catch (error) {
      console.error('Error approving request:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to approve request',
        isVisible: true,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (request: VehicleBrandRequest, notes?: string) => {
    try {
      setActionLoading(request.id);

      const rejectionNotes = notes || `Rejected by ${user?.email || 'admin'}`;
      await vehicleBrandRequestService.updateRequestStatus(
        request.id, 
        'rejected', 
        rejectionNotes
      );

      setNotification({
        type: 'success',
        message: 'Request rejected successfully!',
        isVisible: true,
      });

      // Reload requests
      await loadRequests();

    } catch (error) {
      console.error('Error rejecting request:', error);
      setNotification({
        type: 'error',
        message: 'Failed to reject request',
        isVisible: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'pending').length;
    const approved = requests.filter(r => r.status === 'approved').length;
    const rejected = requests.filter(r => r.status === 'rejected').length;
    const brandRequests = requests.filter(r => r.type === 'brand').length;
    const modelRequests = requests.filter(r => r.type === 'model').length;

    return { total, pending, approved, rejected, brandRequests, modelRequests };
  };

  const stats = getStats();

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vehicle Brand Requests</h1>
              <p className="text-gray-600">Review and manage user requests for new brands and models</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            {[{
              label: 'Total',
              value: stats.total,
              icon: (
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
              bg: 'bg-blue-100'
            }, {
              label: 'Pending',
              value: stats.pending,
              icon: (
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              bg: 'bg-yellow-100'
            }, {
              label: 'Approved',
              value: stats.approved,
              icon: (
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              bg: 'bg-green-100'
            }, {
              label: 'Rejected',
              value: stats.rejected,
              icon: (
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ),
              bg: 'bg-red-100'
            }, {
              label: 'Brand Requests',
              value: stats.brandRequests,
              icon: (
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              ),
              bg: 'bg-blue-100'
            }, {
              label: 'Model Requests',
              value: stats.modelRequests,
              icon: (
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              ),
              bg: 'bg-purple-100'
            }].map((card) => (
              <div key={card.label} className={`bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center min-h-[120px] text-center`}>
                <div className={`p-3 rounded-full ${card.bg} flex items-center justify-center mb-2`}>
                  {card.icon}
                </div>
                <p className="text-sm font-medium text-gray-600">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search by brand, model, user, or description..."
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
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="brand">Brand</option>
                  <option value="model">Model</option>
                </select>
              </div>
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Vehicle Brand Requests</h3>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="flex flex-col items-center">
                  <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                  <p className="text-gray-500">
                    {requests.length === 0 
                      ? "There are no vehicle brand requests at the moment."
                      : "No requests match your current filters. Try adjusting your search criteria."
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
                        Request Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
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
                    {filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.type === 'brand' ? request.brandName : `${request.brandName} - ${request.modelName}`}
                            </div>
                            <div className="text-sm text-gray-500">{request.description}</div>
                            {request.type === 'model' && (
                              <div className="text-sm text-gray-500 mt-1">
                                Model: {request.modelName} - {request.modelDescription}
                              </div>
                            )}
                            <div className="text-sm text-gray-500 mt-1">
                              Vehicle Type: {formatVehicleType(request.vehicleType)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.userName}</div>
                            <div className="text-sm text-gray-500">{request.userEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(request.type)}`}>
                            {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(request.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {request.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleApproveRequest(request)}
                                disabled={!!actionLoading}
                                className={`text-green-600 hover:text-green-900 disabled:opacity-50 flex items-center`}
                              >
                                {actionLoading === request.id ? (
                                  <svg className="animate-spin h-4 w-4 mr-1 text-green-600" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                  </svg>
                                ) : null}
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request)}
                                disabled={!!actionLoading}
                                className={`text-red-600 hover:text-red-900 disabled:opacity-50 flex items-center`}
                              >
                                {actionLoading === request.id ? (
                                  <svg className="animate-spin h-4 w-4 mr-1 text-red-600" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                  </svg>
                                ) : null}
                                Reject
                              </button>
                            </div>
                          )}
                          {request.status !== 'pending' && request.notes && (
                            <div className="text-xs text-gray-500">
                              {request.notes}
                            </div>
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
          {filteredRequests.length > itemsPerPage && (
            <div className="flex justify-end items-center mt-4 space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {Math.ceil(filteredRequests.length / itemsPerPage)}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(Math.ceil(filteredRequests.length / itemsPerPage), p + 1))}
                disabled={currentPage === Math.ceil(filteredRequests.length / itemsPerPage)}
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                Next
              </button>
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