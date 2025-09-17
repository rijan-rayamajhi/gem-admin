'use client';

import { useAuth } from '@/features/auth/presentation/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { SettingsProvider } from '@/features/app-settings/presentation/providers/SettingsProvider';
import SettingsForm from '@/features/app-settings/presentation/components/SettingsForm';

function SettingsContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center min-w-0 flex-1">
              <button
                onClick={() => router.push('/')}
                className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3 flex-shrink-0 hover:bg-primary/90 transition-colors"
              >
                <svg className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-card-foreground truncate">App Settings</h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <div className="text-sm text-muted-foreground hidden sm:block truncate max-w-32">
                Welcome, {user?.displayName || user?.email}
              </div>
              <button
                onClick={handleLogoutClick}
                className="bg-primary text-primary-foreground px-3 sm:px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <SettingsProvider>
          <SettingsForm />
        </SettingsProvider>
      </main>

      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to sign in again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}

export default function SettingsPage() {
  return <SettingsContent />;
}
