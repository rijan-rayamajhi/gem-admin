'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/HomeLayout';
import Notification from '@/components/Notification';
import EditBusinessUserModal from '@/components/EditBusinessUserModal';
import DeleteBusinessUserModal from '@/components/DeleteBusinessUserModal';
import { businessUserService, BusinessUser } from '@/lib/businessUserService';

export default function BusinessAppUsersPage() {
  const {} = useAuth();
  const [businessUsers, setBusinessUsers] = useState<BusinessUser[]>([]);
  const [filteredBusinessUsers, setFilteredBusinessUsers] = useState<BusinessUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilter, setSearchFilter] = useState('all'); // all, name, email, type, status
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    isVisible: boolean;
  } | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBusinessUser, setSelectedBusinessUser] = useState<BusinessUser | null>(null);

  // Fetch real data from Firebase
  useEffect(() => {
    const fetchBusinessUsers = async () => {
      try {
        setLoading(true);
        const users = await businessUserService.getAllBusinessUsers();
        setBusinessUsers(users);
        setFilteredBusinessUsers(users);
      } catch (error) {
        console.error('Error fetching business users:', error);
        setNotification({
          type: 'error',
          message: 'Failed to fetch business users',
          isVisible: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessUsers();
  }, []);

  // Search and filter functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBusinessUsers(businessUsers);
      return;
    }

    const filtered = businessUsers.filter((business) => {
      const term = searchTerm.toLowerCase();
      
      switch (searchFilter) {
        case 'name':
          return business.businessName.toLowerCase().includes(term);
        case 'email':
          return business.personalInfo.email.toLowerCase().includes(term);
        case 'type':
          const categoryName = business.isOtherCategory 
            ? business.selectedOtherCategoryName 
            : business.selectedCategoryName;
          return categoryName?.toLowerCase().includes(term) || false;
        case 'status':
          return business.isActive ? 'active'.includes(term) : 'inactive'.includes(term);
        default:
          return (
            business.businessName.toLowerCase().includes(term) ||
            business.personalInfo.email.toLowerCase().includes(term) ||
            business.personalInfo.phoneNumber.includes(term) ||
            (business.isOtherCategory 
              ? business.selectedOtherCategoryName?.toLowerCase().includes(term)
              : business.selectedCategoryName?.toLowerCase().includes(term)) ||
            (business.isActive ? 'active'.includes(term) : 'inactive'.includes(term))
          );
      }
    });

    setFilteredBusinessUsers(filtered);
  }, [searchTerm, searchFilter, businessUsers]);

  // Helper function to get business category name
  const getBusinessCategory = (business: BusinessUser) => {
    if (business.isOtherCategory) {
      return business.selectedOtherCategoryName || 'Other';
    }
    return business.selectedCategoryName || 'Unknown';
  };

  // Helper function to get business address
  const getBusinessAddress = (business: BusinessUser) => {
    if (business.businessType === 'Offline' && business.businessInfo.offline?.[0]) {
      const location = business.businessInfo.offline[0].shopLocation;
      return `${location.address}, ${location.city}${location.state ? `, ${location.state}` : ''}${location.zipCode ? ` ${location.zipCode}` : ''}`;
    } else if (business.businessType === 'Online' && business.businessInfo.online) {
      return business.businessInfo.online.website;
    } else if (business.businessType === 'Both') {
      if (business.businessInfo.offline?.[0]) {
        const location = business.businessInfo.offline[0].shopLocation;
        return `${location.address}, ${location.city}${location.state ? `, ${location.state}` : ''}${location.zipCode ? ` ${location.zipCode}` : ''}`;
      } else if (business.businessInfo.online) {
        return business.businessInfo.online.website;
      }
    }
    return 'Address not available';
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getVerificationStatusColor = (status: string) => {
    const colors = {
      verified: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      notVerified: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleEdit = (businessUser: BusinessUser) => {
    setSelectedBusinessUser(businessUser);
    setEditModalOpen(true);
  };

  const handleDelete = (businessUser: BusinessUser) => {
    setSelectedBusinessUser(businessUser);
    setDeleteModalOpen(true);
  };

  const handleSaveEdit = async (updatedData: Partial<BusinessUser>) => {
    if (!selectedBusinessUser) return;

    try {
      await businessUserService.updateBusinessUser(selectedBusinessUser.id, updatedData);
      
      // Update local state
      setBusinessUsers(prev => prev.map(business => 
        business.id === selectedBusinessUser.id 
          ? { ...business, ...updatedData }
          : business
      ));
      
      setNotification({
        type: 'success',
        message: 'Business user updated successfully',
        isVisible: true,
      });
    } catch (error) {
      console.error('Error updating business user:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update business user',
        isVisible: true,
      });
      throw error;
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedBusinessUser) return;

    try {
      await businessUserService.deleteBusinessUser(selectedBusinessUser.id);
      
      // Update local state
      setBusinessUsers(prev => prev.filter(business => business.id !== selectedBusinessUser.id));
      
      setNotification({
        type: 'success',
        message: 'Business user deleted successfully',
        isVisible: true,
      });
    } catch (error) {
      console.error('Error deleting business user:', error);
      setNotification({
        type: 'error',
        message: 'Failed to delete business user',
        isVisible: true,
      });
      throw error;
    }
  };

  const stats = {
    total: filteredBusinessUsers.length,
    active: filteredBusinessUsers.filter(user => user.isActive).length,
    inactive: filteredBusinessUsers.filter(user => !user.isActive).length,
    verified: filteredBusinessUsers.filter(user => user.verificationStatus === 'verified').length,
    pending: filteredBusinessUsers.filter(user => user.verificationStatus === 'pending').length,
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Business App Users</h1>
              <p className="text-gray-600">Manage business users and their subscriptions</p>
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
                      placeholder="Search businesses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Filter Dropdown */}
                <div className="md:w-48">
                  <select
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Fields</option>
                    <option value="name">Business Name</option>
                    <option value="email">Email</option>
                    <option value="type">Business Type</option>
                    <option value="status">Status</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Businesses</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Inactive</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
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

            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
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
          </div>

          {/* Business Users Table */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-500 hover:bg-blue-400 transition ease-in-out duration-150 cursor-not-allowed">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading business users...
                </div>
              </div>
            ) : filteredBusinessUsers.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No business users found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Try adjusting your search criteria.' : 'No business users have been registered yet.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Business
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Verification
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBusinessUsers.map((business) => (
                      <tr key={business.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {business.businessName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {getBusinessCategory(business)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {getBusinessAddress(business)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">
                              {business.personalInfo.email}
                            </div>
                            <div className="text-sm text-gray-500">
                              {business.personalInfo.phoneNumber}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(business.isActive)}`}>
                            {business.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVerificationStatusColor(business.verificationStatus)}`}>
                            {business.verificationStatus.charAt(0).toUpperCase() + business.verificationStatus.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(business)}
                              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(business)}
                              className="text-red-600 hover:text-red-900 text-sm font-medium"
                            >
                              Delete
                            </button>
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

        {/* Edit Modal */}
        <EditBusinessUserModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedBusinessUser(null);
          }}
          businessUser={selectedBusinessUser}
          onSave={handleSaveEdit}
        />

        {/* Delete Modal */}
        <DeleteBusinessUserModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedBusinessUser(null);
          }}
          businessUser={selectedBusinessUser}
          onDelete={handleConfirmDelete}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
} 