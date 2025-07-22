'use client';

import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import HomeLayout from '@/components/HomeLayout';
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
                  <div className="bg-green-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Active Events</h3>
                    <p className="text-2xl font-semibold text-gray-900">24</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Total Rewards</h3>
                    <p className="text-2xl font-semibold text-gray-900">8.2k</p>
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
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Admin Controls</h2>
                <p className="text-sm text-gray-500 mb-4">Manage your application settings and configurations</p>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* App Settings Card */}
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

                    {/* Gem Coin Card */}
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

                    {/* User Card */}
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
                  </div>
                </div>
              </div>

              {/* Features Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Features</h2>
                <p className="text-sm text-gray-500 mb-4">Manage application features and modules</p>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Daily Rewards Card */}
                    <Link href="/feature/daily-rewards" className="block h-[120px]">
                      <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-all duration-200 border border-gray-200 cursor-pointer h-full hover:shadow-md">
                        <div className="flex items-center space-x-4">
                          <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">Daily Rewards</h3>
                            <p className="text-sm text-gray-600">Manage daily reward system</p>
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* Events Card */}
                    <Link href="/feature/events" className="block h-[120px]">
                      <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-all duration-200 border border-gray-200 cursor-pointer h-full hover:shadow-md">
                        <div className="flex items-center space-x-4">
                          <div className="bg-yellow-100 p-3 rounded-lg flex-shrink-0">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">Events</h3>
                            <p className="text-sm text-gray-600">Manage app events and schedules</p>
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* Flash Rewards Card */}
                    <Link href="/feature/flash-rewards" className="block h-[120px]">
                      <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-all duration-200 border border-gray-200 cursor-pointer h-full hover:shadow-md">
                        <div className="flex items-center space-x-4">
                          <div className="bg-red-100 p-3 rounded-lg flex-shrink-0">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">Flash Rewards</h3>
                            <p className="text-sm text-gray-600">Manage flash reward campaigns</p>
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* Caroseal Ads Card */}
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
                  </div>
                </div>
              </div>

              {/* Request and Verification Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Request and Verification</h2>
                <p className="text-sm text-gray-500 mb-4">Manage user verification requests and documents</p>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* License Verification Card */}
                    <Link href="/user-app-verification/license" className="block h-[120px]">
                      <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-all duration-200 border border-gray-200 cursor-pointer h-full hover:shadow-md">
                        <div className="flex items-center space-x-4">
                          <div className="bg-teal-100 p-3 rounded-lg flex-shrink-0">
                            <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">License Verification</h3>
                            <p className="text-sm text-gray-600">Verify user license documents</p>
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* Vehicle Verification Card */}
                    <Link href="/user-app-verification/vehicle" className="block h-[120px]">
                      <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-all duration-200 border border-gray-200 cursor-pointer h-full hover:shadow-md">
                        <div className="flex items-center space-x-4">
                          <div className="bg-orange-100 p-3 rounded-lg flex-shrink-0">
                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">Vehicle Verification</h3>
                            <p className="text-sm text-gray-600">Verify user vehicle documents</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </HomeLayout>
    </ProtectedRoute>
  );
} 