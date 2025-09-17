'use client';

import { useAuth } from '@/features/auth/presentation/providers/AuthProvider';
import { useEffect } from 'react';

export default function DebugPage() {
  const { user, loading, error } = useAuth();

  useEffect(() => {
    console.log('Debug page - Auth state:', { user, loading, error });
  }, [user, loading, error]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
        
        <div className="bg-card border border-primary rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Current Auth State</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {loading ? 'true' : 'false'}</p>
            <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</p>
            <p><strong>Error:</strong> {error || 'none'}</p>
          </div>
        </div>

        <div className="bg-card border border-primary rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Test Login</h2>
          <p className="text-muted-foreground mb-4">
            Use this page to test authentication. Check the browser console for detailed logs.
          </p>
          <div className="space-y-2">
            <p>1. Open browser console (F12)</p>
            <p>2. Try logging in from the login page</p>
            <p>3. Watch the console logs</p>
            <p>4. Check if the user state updates here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
