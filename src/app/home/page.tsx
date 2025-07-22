'use client';

import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import HomeLayout from '@/components/HomeLayout';
import PermissionGuard from '@/components/PermissionGuard';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const {} = useAuth();

  return (
    <ProtectedRoute>
      <HomeLayout>
        <div className="min-h-screen bg-gray-50">
          {/* Main Content */}
          <div className="px-8 py-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                    <p className="text-2xl font-semibold text-gray-900">12.5k</p>
                  </div>
                </div>
              </div>



              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Active Ads</h3>
                    <p className="text-2xl font-semibold text-gray-900">15</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Data Section */}
            <div className="space-y-6">
              <PermissionGuard permissions={['app-settings', 'gem-coins', 'users', 'teams']}>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Admin Controls</h2>
                  <p className="text-sm text-gray-500 mb-4">Manage your application settings and configurations</p>
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* App Settings Card */}
                      <PermissionGuard permission="app-settings">
                        <Link href="/app-settings" className="block h-[120px]">
                          <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-all duration-200 border border-gray-200 cursor-pointer h-full hover:shadow-md">
                            <div className="flex items-center space-x-4">
                              <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                                <Image
                                  src="/window.svg"
                                  alt="Settings"
                                  width={24}
                                  height={24}
                                  className="text-blue-600"
                                />
                              </div>
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">App Settings</h3>
                                <p className="text-sm text-gray-600">Configure application settings and preferences</p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </PermissionGuard>

                      {/* Gem Coin Card */}
                      <PermissionGuard permission="gem-coins">
                        <Link href="/gem-coin" className="block h-[120px]">
                          <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-all duration-200 border border-gray-200 cursor-pointer h-full hover:shadow-md">
                            <div className="flex items-center space-x-4">
                              <div className="bg-purple-100 p-3 rounded-lg flex-shrink-0">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                              </div>
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">Gem Coin</h3>
                                <p className="text-sm text-gray-600">Manage coin values and reward actions</p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </PermissionGuard>

                      {/* User Card */}
                      <PermissionGuard permission="users">
                        <Link href="/user-app-users" className="block h-[120px]">
                          <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-all duration-200 border border-gray-200 cursor-pointer h-full hover:shadow-md">
                            <div className="flex items-center space-x-4">
                              <div className="bg-indigo-100 p-3 rounded-lg flex-shrink-0">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                              </div>
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">User</h3>
                                <p className="text-sm text-gray-600">Manage user accounts and profiles</p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </PermissionGuard>

                      {/* Teams Card */}
                      <PermissionGuard permission="teams">
                        <Link href="/team" className="block h-[120px]">
                          <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-all duration-200 border border-gray-200 cursor-pointer h-full hover:shadow-md">
                            <div className="flex items-center space-x-4">
                              <div className="bg-emerald-100 p-3 rounded-lg flex-shrink-0">
                                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                              </div>
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">Teams</h3>
                                <p className="text-sm text-gray-600">Manage team members and roles</p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </PermissionGuard>
                    </div>
                  </div>
                </div>
              </PermissionGuard>

              {/* Features Section */}
              <PermissionGuard permissions={['caroseal-ads']}>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Features</h2>
                  <p className="text-sm text-gray-500 mb-4">Manage application features and modules</p>
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Caroseal Ads Card */}
                      <PermissionGuard permission="caroseal-ads">
                        <Link href="/feature/caroseal-ads" className="block h-[120px]">
                          <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-all duration-200 border border-gray-200 cursor-pointer h-full hover:shadow-md">
                            <div className="flex items-center space-x-4">
                              <div className="bg-cyan-100 p-3 rounded-lg flex-shrink-0">
                                <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <rect x="3" y="7" width="18" height="10" rx="2" strokeWidth={2} stroke="currentColor" fill="none" />
                                  <path d="M7 7v10M17 7v10" strokeWidth={2} stroke="currentColor" fill="none" />
                                </svg>
                              </div>
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">Caroseal Ads</h3>
                                <p className="text-sm text-gray-600">Manage carousel advertisements</p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </PermissionGuard>
                    </div>
                  </div>
                </div>
              </PermissionGuard>

              {/* No Access Message */}
              <PermissionGuard 
                permissions={['app-settings', 'gem-coins', 'users', 'teams', 'caroseal-ads']} 
                fallback={
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-yellow-800">Limited Access</h3>
                        <p className="text-yellow-700">
                          You don't have permissions to access any admin features. Please contact your administrator to request access to specific modules.
                        </p>
                      </div>
                    </div>
                  </div>
                }
              >
                {/* This will be empty since we're using it just for the fallback */}
                <div></div>
              </PermissionGuard>

            </div>
          </div>
        </div>
      </HomeLayout>
    </ProtectedRoute>
  );
} 