'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/lib/auth-context';
import { usePermissions } from '@/hooks/usePermissions';

interface HomeLayoutProps {
  children: ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  const { user, teamMember, role } = useAuth();
  const { isSuperAdmin } = usePermissions();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Helper function to get user display name
  const getDisplayName = () => {
    if (teamMember) {
      return `${teamMember.firstName} ${teamMember.lastName}`;
    }
    // Super admin (not in team collection)
    if (isSuperAdmin()) {
      return user?.displayName || 'Super Admin';
    }
    return user?.displayName || 'User';
  };

  // Helper function to get user initials
  const getUserInitials = () => {
    if (teamMember) {
      return `${teamMember.firstName.charAt(0)}${teamMember.lastName.charAt(0)}`;
    }
    // Super admin (not in team collection)
    if (isSuperAdmin()) {
      const name = user?.displayName || 'Super Admin';
      return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
    }
    const name = user?.displayName || user?.email || 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  // Helper function to get user email
  const getUserEmail = () => {
    return teamMember?.email || user?.email || '';
  };

  // Helper function to get role display
  const getRoleDisplay = () => {
    if (isSuperAdmin()) {
      return 'Super Admin';
    }
    if (role) {
      return role.charAt(0).toUpperCase() + role.slice(1);
    }
    return 'User';
  };

  return (
    <div className="min-h-screen bg-[var(--color-background-secondary)]">
      {/* Main Content */}
      <div className="flex flex-col">
        {/* Top Header */}
        <header className="bg-[var(--color-background-primary)] shadow-theme-sm backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-[2000px] mx-auto">
            <div className="px-6 py-3">
              <div className="flex items-center justify-between">
                {/* Profile */}
                <Link 
                  href="/profile" 
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-[var(--color-background-secondary)] transition-all duration-200"
                >
                  <div className="w-10 h-10 bg-[var(--color-primary-500)] rounded-xl flex items-center justify-center shadow-theme-sm">
                    <span className="text-[var(--color-text-inverse)] text-sm font-medium">{getUserInitials()}</span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-[var(--color-text-primary)] text-sm font-medium">{getDisplayName()}</p>
                    <p className="text-[var(--color-text-tertiary)] text-xs">{getUserEmail()}</p>
                    {role && (
                      <p className="text-[var(--color-text-tertiary)] text-xs">Role: {getRoleDisplay()}</p>
                    )}
                  </div>
                </Link>

                {/* Logout Button */}
                <button 
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-4 py-2.5 text-[var(--color-error-600)] bg-[var(--color-error-500)]/5 rounded-xl hover:bg-[var(--color-error-500)]/10 transition-all duration-200"
                >
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1">
          <div className="max-w-[2000px] mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 