'use client';

import { useAuth } from '@/lib/auth-context';
import { usePermissions } from '@/hooks/usePermissions';
import ProtectedRoute from '@/components/ProtectedRoute';
import HomeLayout from '@/components/HomeLayout';
import PermissionGuard, { AdminOnly, RoleGuard } from '@/components/PermissionGuard';

export default function PermissionsDemoPage() {
  const { user, teamMember, permissions, role } = useAuth();
  const { getPermissionSummary, getAccessiblePages, isSuperAdmin } = usePermissions();

  const summary = getPermissionSummary();
  const accessiblePages = getAccessiblePages();

  return (
    <ProtectedRoute>
      <HomeLayout>
        <div className="p-6 max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Control Demo</h1>
            <p className="text-gray-600">This page demonstrates the role-based access control system</p>
            
            {/* Super Admin Banner */}
            {isSuperAdmin() && (
              <div className="mt-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-red-800">Super Admin Mode</h3>
                    <p className="text-red-700 text-sm">
                      You have unlimited access because your account is not managed by the team system.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Firebase User</h3>
                <div className="bg-gray-50 rounded p-3 text-sm">
                  <p><strong>UID:</strong> {user?.uid}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Display Name:</strong> {user?.displayName || 'Not set'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Team Member Info</h3>
                <div className="bg-gray-50 rounded p-3 text-sm">
                  {teamMember ? (
                    <>
                      <p><strong>Name:</strong> {teamMember.firstName} {teamMember.lastName}</p>
                      <p><strong>Role:</strong> {teamMember.role}</p>
                      <p><strong>Department:</strong> {teamMember.department}</p>
                      <p><strong>Position:</strong> {teamMember.position}</p>
                      <p><strong>Status:</strong> {teamMember.status}</p>
                    </>
                  ) : isSuperAdmin() ? (
                    <div className="text-green-600">
                      <p><strong>Status:</strong> Super Admin</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Not found in team collection - granted full access
                      </p>
                    </div>
                  ) : (
                    <p className="text-red-600">Not found in team members</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Permissions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Role</h3>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  role === 'admin' ? 'bg-red-100 text-red-800' :
                  role === 'developer' ? 'bg-green-100 text-green-800' :
                  role === 'tester' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {isSuperAdmin() ? 'Super Admin' : 
                   role ? role.charAt(0).toUpperCase() + role.slice(1) : 'No Role'}
                </span>
                {isSuperAdmin() && (
                  <p className="text-xs text-gray-500 mt-1">
                    🔓 Unlimited access - not managed by team system
                  </p>
                )}
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Permissions</h3>
                <div className="space-y-1">
                  {permissions.length > 0 ? (
                    permissions.map(permission => (
                      <span key={permission} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded mr-2 mb-1">
                        {permission}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No permissions assigned</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Accessible Pages */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Accessible Pages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accessiblePages.map(page => (
                <div key={page.path} className="border border-gray-200 rounded-lg p-3">
                  <h3 className="font-medium text-gray-900">{page.name}</h3>
                  <p className="text-sm text-gray-600">{page.path}</p>
                </div>
              ))}
              {accessiblePages.length === 0 && (
                <p className="text-gray-500 col-span-full">No accessible pages found</p>
              )}
            </div>
          </div>

          {/* Permission-based Content Examples */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Permission-based Content Examples</h2>
            <div className="space-y-4">
              
              {/* Admin Only Content */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-2">Admin Only Content</h3>
                <AdminOnly fallback={<p className="text-red-600">❌ You need admin role to see this content</p>}>
                  <p className="text-green-600">✅ You are an admin! You can see this content.</p>
                </AdminOnly>
              </div>

              {/* Developer Only Content */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-2">Developer Only Content</h3>
                <RoleGuard roles="developer" fallback={<p className="text-red-600">❌ You need developer role to see this content</p>}>
                  <p className="text-green-600">✅ You are a developer! You can see this content.</p>
                </RoleGuard>
              </div>

              {/* Teams Permission Content */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-2">Teams Permission Content</h3>
                <PermissionGuard permission="teams" fallback={<p className="text-red-600">❌ You need 'teams' permission to see this content</p>}>
                  <p className="text-green-600">✅ You have teams permission! You can see this content.</p>
                </PermissionGuard>
              </div>

              {/* Multiple Permissions (Any) */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-2">Admin Controls Access (Any Permission)</h3>
                <PermissionGuard 
                  permissions={['app-settings', 'gem-coins', 'users', 'teams']} 
                  fallback={<p className="text-red-600">❌ You need at least one admin control permission</p>}
                >
                  <p className="text-green-600">✅ You have access to admin controls!</p>
                </PermissionGuard>
              </div>

              {/* Multiple Permissions (All) */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-2">Full Admin Access (All Permissions)</h3>
                <PermissionGuard 
                  permissions={['app-settings', 'gem-coins', 'users', 'teams', 'caroseal-ads']} 
                  requireAll={true}
                  fallback={<p className="text-red-600">❌ You need ALL permissions for full access</p>}
                >
                  <p className="text-green-600">✅ You have full access to all features!</p>
                </PermissionGuard>
              </div>

            </div>
          </div>

          {/* Debug Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Debug Information</h2>
            <pre className="text-sm bg-white p-4 rounded border overflow-auto">
              {JSON.stringify(summary, null, 2)}
            </pre>
          </div>

        </div>
      </HomeLayout>
    </ProtectedRoute>
  );
} 