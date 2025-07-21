'use client';

import { useState, useEffect } from 'react';
import { UserInterest, userInterestService } from '@/lib/userInterestService';
import AddUserInterestModal from '@/components/AddUserInterestModal';
import GenericDeleteModal from '@/components/GenericDeleteModal';
import Notification from '@/components/Notification';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';

export default function UserInterestsPage() {
  const [interests, setInterests] = useState<UserInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInterest, setEditingInterest] = useState<UserInterest | null>(null);
  const [deleteInterest, setDeleteInterest] = useState<UserInterest | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    loadInterests();
  }, []);

  const loadInterests = async () => {
    try {
      setLoading(true);
      const settings = await userInterestService.getSettings();
      setInterests(settings.interests);
    } catch (error) {
      console.error('Error loading interests:', error);
      showNotification('error', 'Failed to load interests');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInterest = async (interestData: Omit<UserInterest, 'id'>) => {
    try {
      if (editingInterest) {
        await userInterestService.updateInterest(editingInterest.id, interestData);
        showNotification('success', 'Interest updated successfully');
      } else {
        await userInterestService.addInterest(interestData);
        showNotification('success', 'Interest added successfully');
      }
      await loadInterests();
    } catch (error) {
      console.error('Error saving interest:', error);
      showNotification('error', 'Failed to save interest');
    }
  };

  const handleDeleteInterest = async () => {
    if (!deleteInterest) return;

    try {
      await userInterestService.deleteInterest(deleteInterest.id);
      showNotification('success', 'Interest deleted successfully');
      await loadInterests();
    } catch (error) {
      console.error('Error deleting interest:', error);
      showNotification('error', 'Failed to delete interest');
    } finally {
      setDeleteInterest(null);
    }
  };

  const handleEditInterest = (interest: UserInterest) => {
    setEditingInterest(interest);
    setIsModalOpen(true);
  };

  const handleAddInterest = () => {
    setEditingInterest(null);
    setIsModalOpen(true);
  };



  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const totalInterests = interests.length;
  const activeInterests = interests.filter(interest => interest.isActive).length;
  const inactiveInterests = interests.filter(interest => !interest.isActive).length;
  
  // Get unique categories
  const categories = [...new Set(interests.map(interest => interest.category))];
  const totalCategories = categories.length;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Interests</h1>
              <p className="text-gray-600">Manage user interests and categories for personalization</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Interests</p>
                  <p className="text-2xl font-semibold text-gray-900">{totalInterests}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Interests</p>
                  <p className="text-2xl font-semibold text-gray-900">{activeInterests}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Inactive Interests</p>
                  <p className="text-2xl font-semibold text-gray-900">{inactiveInterests}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Categories</p>
                  <p className="text-2xl font-semibold text-gray-900">{totalCategories}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
                          <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">User Interests</h2>
              <button
                onClick={handleAddInterest}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add Interest
              </button>
            </div>
            </div>

            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading interests...</p>
              </div>
            ) : interests.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <svg className="mx-auto mb-4 w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-lg font-semibold mb-2">No user interests found</p>
                <p className="mb-4">Get started by adding your first user interest.</p>
                <button
                  onClick={handleAddInterest}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Interest
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Interest
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {interests.map((interest) => (
                      <tr key={interest.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">{interest.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{interest.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {interest.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">{interest.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            interest.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {interest.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEditInterest(interest)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteInterest(interest)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modals */}
          <AddUserInterestModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveInterest}
            editingInterest={editingInterest}
          />

          <GenericDeleteModal
            isOpen={!!deleteInterest}
            onClose={() => setDeleteInterest(null)}
            onConfirm={handleDeleteInterest}
            title="Delete Interest"
            message={`Are you sure you want to delete "${deleteInterest?.name}"? This action cannot be undone.`}
            itemName={deleteInterest?.name}
          />

          {notification && (
            <Notification
              type={notification.type}
              message={notification.message}
              isVisible={true}
              onClose={() => setNotification(null)}
            />
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 