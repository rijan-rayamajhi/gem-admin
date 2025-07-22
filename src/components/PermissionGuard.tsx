'use client';

import { useAuth } from '@/lib/auth-context';
import { ReactNode } from 'react';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  role?: string;
  roles?: string[];
  requireAll?: boolean; // If true, user must have ALL permissions/roles, if false (default), user needs ANY
  fallback?: ReactNode;
  adminOverride?: boolean; // If true, admin can access regardless of specific permissions
}

export default function PermissionGuard({
  children,
  permission,
  permissions = [],
  role,
  roles = [],
  requireAll = false,
  fallback = null,
  adminOverride = true
}: PermissionGuardProps) {
  const { hasPermission, hasRole, isAdmin, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
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

  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

// Additional utility components for common use cases
export function AdminOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard role="admin" fallback={fallback} adminOverride={false}>
      {children}
    </PermissionGuard>
  );
}

export function RoleGuard({ 
  children, 
  roles, 
  fallback = null 
}: { 
  children: ReactNode; 
  roles: string | string[]; 
  fallback?: ReactNode 
}) {
  const roleArray = Array.isArray(roles) ? roles : [roles];
  return (
    <PermissionGuard roles={roleArray} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
} 