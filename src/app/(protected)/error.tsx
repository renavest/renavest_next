'use client';

import { useEffect } from 'react';

import { useAuth } from '@clerk/nextjs';
import { AlertCircle, RefreshCw, LogOut } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProtectedError({ error, reset }: ErrorProps) {
  const { signOut } = useAuth();

  useEffect(() => {
    // Log error to monitoring service
    console.error('Protected route error:', error);
  }, [error]);

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Dashboard Error
        </h1>
        
        <p className="text-gray-600 mb-6">
          We encountered an error loading your dashboard. This might be due to authentication issues or server problems.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 transition-colors border border-gray-300 px-4 py-2 rounded-lg hover:border-gray-400"
          >
            <LogOut className="h-4 w-4" />
            Sign out and retry
          </button>
        </div>
      </div>
    </div>
  );
}