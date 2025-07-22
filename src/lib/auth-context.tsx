'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { getTeamMembers, TeamMember } from './teamService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  teamMember: TeamMember | null;
  permissions: string[];
  role: string | null;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  teamMember: null,
  permissions: [],
  role: null,
  hasPermission: () => false,
  hasRole: () => false,
  isAdmin: () => false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [role, setRole] = useState<string | null>(null);

  // Helper functions
  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const hasRole = (targetRole: string): boolean => {
    return role === targetRole;
  };

  const isAdmin = (): boolean => {
    return role === 'admin';
  };

  // Load team member data and permissions
  const loadTeamMemberData = async (userId: string) => {
    try {
      const teamMembers = await getTeamMembers();
      const userTeamMember = teamMembers.find(member => member.uid === userId);
      
      if (userTeamMember) {
        // User found in team collection - use their assigned permissions
        setTeamMember(userTeamMember);
        setPermissions(userTeamMember.permissions || []);
        setRole(userTeamMember.role);
      } else {
        // User NOT found in team collection - treat as super admin
        setTeamMember(null);
        setPermissions(['app-settings', 'gem-coins', 'users', 'teams', 'caroseal-ads']); // All permissions
        setRole('admin'); // Super admin role
      }
    } catch (error) {
      console.error('Error loading team member data:', error);
      // On error, also treat as super admin (fallback for connectivity issues)
      setTeamMember(null);
      setPermissions(['app-settings', 'gem-coins', 'users', 'teams', 'caroseal-ads']);
      setRole('admin');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        await loadTeamMemberData(user.uid);
      } else {
        setTeamMember(null);
        setPermissions([]);
        setRole(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      teamMember, 
      permissions, 
      role,
      hasPermission,
      hasRole,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 