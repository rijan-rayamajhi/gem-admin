'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import Notification from '@/components/Notification';
import { userAppService, UserAppUser } from '@/lib/userAppService';

export default function UserAppUsersPage() {
  const {} = useAuth();
  const [userAppUsers, setUserAppUsers] = useState<UserAppUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserAppUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    distanceRange: 'all',
    rideRange: 'all',
    coinRange: 'all',
  });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    isVisible: boolean;
  } | null>(null);

  // Fetch user app users from Firebase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        console.log('Fetching users from Firebase...');
        const users = await userAppService.getAllUserAppUsers();
        console.log('Users fetched:', users);
        setUserAppUsers(users);
        setFilteredUsers(users);
      } catch (error) {
        console.error('Error fetching users:', error);
        setNotification({
          type: 'error',
          message: 'Failed to load users. Please try again.',
          isVisible: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term and filters
  useEffect(() => {
    let filtered = userAppUsers;

    // Apply search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(user => 
        user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply distance filter
    if (filters.distanceRange !== 'all') {
      filtered = filtered.filter(user => {
        const distance = user.totalDistance;
        switch (filters.distanceRange) {
          case 'low': return distance < 500;
          case 'medium': return distance >= 500 && distance < 1500;
          case 'high': return distance >= 1500;
          default: return true;
        }
      });
    }

    // Apply ride filter
    if (filters.rideRange !== 'all') {
      filtered = filtered.filter(user => {
        const rides = user.totalRides;
        switch (filters.rideRange) {
          case 'low': return rides < 20;
          case 'medium': return rides >= 20 && rides < 50;
          case 'high': return rides >= 50;
          default: return true;
        }
      });
    }

    // Apply coin filter
    if (filters.coinRange !== 'all') {
      filtered = filtered.filter(user => {
        const coins = user.totalGemCoins;
        switch (filters.coinRange) {
          case 'low': return coins < 500;
          case 'medium': return coins >= 500 && coins < 1000;
          case 'high': return coins >= 1000;
          default: return true;
        }
      });
    }

    setFilteredUsers(filtered);
  }, [searchTerm, filters, userAppUsers]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilters({
      distanceRange: 'all',
      rideRange: 'all',
      coinRange: 'all',
    });
  };





  const stats = {
    total: filteredUsers.length,
    totalDistance: filteredUsers.reduce((sum, user) => sum + user.totalDistance, 0),
    totalRides: filteredUsers.reduce((sum, user) => sum + user.totalRides, 0),
    totalGemCoins: filteredUsers.reduce((sum, user) => sum + user.totalGemCoins, 0),
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User App Users</h1>
                <p className="text-gray-600">Manage individual app users and their activities</p>
              </div>
            </div>
            
            {/* Search and Filter Bar */}
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by User ID, name, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Filter Controls */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Distance Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Distance</label>
                    <select
                      value={filters.distanceRange}
                      onChange={(e) => setFilters({...filters, distanceRange: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Distances</option>
                      <option value="low">Low (&lt; 500 km)</option>
                      <option value="medium">Medium (500-1500 km)</option>
                      <option value="high">High (&gt; 1500 km)</option>
                    </select>
                  </div>

                  {/* Rides Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rides</label>
                    <select
                      value={filters.rideRange}
                      onChange={(e) => setFilters({...filters, rideRange: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Rides</option>
                      <option value="low">Low (&lt; 20)</option>
                      <option value="medium">Medium (20-50)</option>
                      <option value="high">High (&gt; 50)</option>
                    </select>
                  </div>

                  {/* Gem Coins Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gem Coins</label>
                    <select
                      value={filters.coinRange}
                      onChange={(e) => setFilters({...filters, coinRange: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Coins</option>
                      <option value="low">Low (&lt; 500)</option>
                      <option value="medium">Medium (500-1000)</option>
                      <option value="high">High (&gt; 1000)</option>
                    </select>
                  </div>

                  {/* Clear Filters Button */}
                  <div className="flex items-end">
                    <button
                      onClick={clearAllFilters}
                      className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Distance</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDistance.toFixed(1)} km</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Rides</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRides}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-100">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Gem Coins</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalGemCoins}</p>
                </div>
              </div>
            </div>
          </div>

          {/* User App Users Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">User App Users</h3>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-6 text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-gray-600">
                    {searchTerm ? `No users found matching "${searchTerm}"` : 'No users found'}
                  </p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Profile
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Distance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Rides
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Gem Coins
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {user.profileImage ? (
                                <img 
                                  className="h-10 w-10 rounded-full object-cover" 
                                  src={user.profileImage} 
                                  alt={user.displayName}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700">
                                    {user.displayName.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.displayName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.totalDistance.toFixed(1)} km
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.totalRides}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {user.totalGemCoins}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 