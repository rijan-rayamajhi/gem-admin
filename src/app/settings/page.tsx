'use client';

import { useAuth } from '@/features/auth/presentation/providers/AuthProvider';
import { SettingsProvider } from '@/features/app-settings/presentation/providers/SettingsProvider';
import SettingsForm from '@/features/app-settings/presentation/components/SettingsForm';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => window.history.back()}
                className="mr-4 p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                <span className="text-primary-foreground font-bold text-sm">A</span>
              </div>
              <h1 className="text-xl font-semibold text-card-foreground">App Settings</h1>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {user?.displayName || user?.email}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SettingsProvider>
          <SettingsForm />
        </SettingsProvider>
      </main>
    </div>
  );
}
