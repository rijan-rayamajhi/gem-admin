'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function FirebaseTestPage() {
  const [firebaseStatus, setFirebaseStatus] = useState<string>('Checking...');
  const [authState, setAuthState] = useState<any>(null);

  useEffect(() => {
    // Test Firebase connection
    try {
      console.log('Firebase auth object:', auth);
      console.log('Firebase app:', auth.app);
      
      setFirebaseStatus('Firebase connected successfully');
      
      // Listen to auth state changes
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log('Direct Firebase auth state change:', user);
        setAuthState(user);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Firebase connection error:', error);
      setFirebaseStatus(`Firebase error: ${error}`);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Firebase Connection Test</h1>
        
        <div className="bg-card border border-primary rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Firebase Status</h2>
          <p className="text-green-600">{firebaseStatus}</p>
        </div>

        <div className="bg-card border border-primary rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Direct Firebase Auth State</h2>
          <pre className="bg-muted p-4 rounded-lg overflow-auto">
            {JSON.stringify(authState, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
