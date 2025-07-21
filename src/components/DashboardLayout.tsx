'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
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
                    <span className="text-[var(--color-text-inverse)] text-sm font-medium">U</span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-[var(--color-text-primary)] text-sm font-medium">Admin User</p>
                    <p className="text-[var(--color-text-tertiary)] text-xs">admin@gem.com</p>
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