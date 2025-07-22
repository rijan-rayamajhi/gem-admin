import { useAuth } from '@/lib/auth-context';

export const usePermissions = () => {
  const { hasPermission, hasRole, isAdmin, permissions, role, teamMember } = useAuth();

  // Check if user can access admin controls
  const canAccessAdminControls = () => {
    return hasPermission('app-settings') || 
           hasPermission('gem-coins') || 
           hasPermission('users') || 
           hasPermission('teams') ||
           isAdmin();
  };

  // Check if user can access features
  const canAccessFeatures = () => {
    return hasPermission('caroseal-ads') || isAdmin();
  };

  // Check if user can manage users
  const canManageUsers = () => {
    return hasPermission('users') || isAdmin();
  };

  // Check if user can manage teams
  const canManageTeams = () => {
    return hasPermission('teams') || isAdmin();
  };

  // Check if user can manage app settings
  const canManageAppSettings = () => {
    return hasPermission('app-settings') || isAdmin();
  };

  // Check if user can manage gem coins
  const canManageGemCoins = () => {
    return hasPermission('gem-coins') || isAdmin();
  };

  // Check if user can manage caroseal ads
  const canManageCarosealAds = () => {
    return hasPermission('caroseal-ads') || isAdmin();
  };

  // Check if user is super admin (not in team collection)
  const isSuperAdmin = () => {
    return isAdmin() && !teamMember;
  };

  // Check if user is developer
  const isDeveloper = () => {
    return hasRole('developer');
  };

  // Check if user is tester
  const isTester = () => {
    return hasRole('tester');
  };

  // Get user's accessible pages
  const getAccessiblePages = () => {
    const pages = [];
    
    if (canManageAppSettings()) pages.push({ name: 'App Settings', path: '/app-settings' });
    if (canManageGemCoins()) pages.push({ name: 'Gem Coins', path: '/gem-coin' });
    if (canManageUsers()) pages.push({ name: 'Users', path: '/user-app-users' });
    if (canManageTeams()) pages.push({ name: 'Teams', path: '/team' });
    if (canManageCarosealAds()) pages.push({ name: 'Caroseal Ads', path: '/feature/caroseal-ads' });
    
    return pages;
  };

  // Get permission summary for debugging
  const getPermissionSummary = () => {
    return {
      role,
      permissions,
      isAdmin: isAdmin(),
      isSuperAdmin: isSuperAdmin(),
      isDeveloper: isDeveloper(),
      isTester: isTester(),
      teamMember: teamMember ? {
        name: `${teamMember.firstName} ${teamMember.lastName}`,
        email: teamMember.email,
        department: teamMember.department,
        position: teamMember.position,
        status: teamMember.status
      } : null,
      accessiblePages: getAccessiblePages()
    };
  };

  return {
    // Permission checks
    hasPermission,
    hasRole,
    isAdmin,
    isSuperAdmin,
    
    // Feature-specific checks
    canAccessAdminControls,
    canAccessFeatures,
    canManageUsers,
    canManageTeams,
    canManageAppSettings,
    canManageGemCoins,
    canManageCarosealAds,
    
    // Role checks
    isDeveloper,
    isTester,
    
    // Utility functions
    getAccessiblePages,
    getPermissionSummary,
    
    // Data
    permissions,
    role,
    teamMember
  };
}; 