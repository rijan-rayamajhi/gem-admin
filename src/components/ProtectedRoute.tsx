'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  role?: string;
  roles?: string[];
  requireAll?: boolean;
  adminOverride?: boolean;
  redirectTo?: string;
  fallback?: ReactNode;
}

export default function ProtectedRoute({ 
  children,
  permission,
  permissions = [],
  role,
  roles = [],
  requireAll = false,
  adminOverride = true,
  redirectTo = '/home',
  fallback
}: ProtectedRouteProps) {
  const { user, loading, hasPermission, hasRole, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null; // Will redirect to login
  }

  // If no permission/role requirements, just return children (basic auth check)
  if (!permission && permissions.length === 0 && !role && roles.length === 0) {
    return <>{children}</>;
  }

  // Admin override - admins can access everything
  if (adminOverride && isAdmin()) {
    return <>{children}</>;
  }

  // Build permission array
  const permissionsToCheck = [...permissions];
  if (permission) {
    permissionsToCheck.push(permission);
  }

  // Build role array
  const rolesToCheck = [...roles];
  if (role) {
    rolesToCheck.push(role);
  }

  // Check permissions
  let hasRequiredPermissions = true;
  if (permissionsToCheck.length > 0) {
    if (requireAll) {
      hasRequiredPermissions = permissionsToCheck.every(perm => hasPermission(perm));
    } else {
      hasRequiredPermissions = permissionsToCheck.some(perm => hasPermission(perm));
    }
  }

  // Check roles
  let hasRequiredRoles = true;
  if (rolesToCheck.length > 0) {
    if (requireAll) {
      hasRequiredRoles = rolesToCheck.every(r => hasRole(r));
    } else {
      hasRequiredRoles = rolesToCheck.some(r => hasRole(r));
    }
  }

  // Determine access
  const hasAccess = hasRequiredPermissions && hasRequiredRoles;

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Show access denied page
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page.
            </p>
            <button
              onClick={() => router.push(redirectTo)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 