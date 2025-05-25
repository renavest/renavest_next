'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getRouteForRole, getUserRoleFromUser } from '@/src/features/auth/utils/routeMapping';
import type { UserRole } from '@/src/shared/types';

export default function AuthCheckPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [message, setMessage] = useState('Finalizing your session, please wait...');
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 10; // Approx 20 seconds
  const retryDelay = 2000; // 2 seconds

  useEffect(() => {
    if (!isLoaded) {
      setMessage('Loading user data...');
      return;
    }

    if (!isSignedIn) {
      setMessage('Session not active. Redirecting to login...');
      router.replace('/login');
      return;
    }

    if (user) {
      const userRole = getUserRoleFromUser(user);
      const onboardingComplete = user.publicMetadata?.onboardingComplete as boolean | undefined;

      console.log('AuthCheckPage - User Data:', {
        userId: user.id,
        roleFromMetadata: userRole,
        onboardingCompleteFromMetadata: onboardingComplete,
        publicMetadata: user.publicMetadata,
      });

      if (userRole && onboardingComplete) {
        const targetRoute = getRouteForRole(userRole);
        setMessage(`Setup complete! Redirecting to ${targetRoute}...`);
        router.replace(targetRoute);
      } else {
        setMessage(
          `Waiting for account setup to complete (Role: ${userRole || 'Pending'}, Onboarding: ${onboardingComplete === undefined ? 'Pending' : onboardingComplete}). Attempt ${retryCount + 1}/${maxRetries}`,
        );
        if (retryCount < maxRetries) {
          const timer = setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            // Clerk's useUser hook should re-trigger useEffect when user object updates.
            // If not, you might need to manually trigger a re-check or reload user data.
            // Forcing a reload of the user can be done via user.reload() if necessary.
          }, retryDelay);
          return () => clearTimeout(timer);
        } else {
          setMessage(
            'Account setup is taking longer than expected. Please try logging in again or contact support.',
          );
          // Optionally redirect to login after timeout
          // setTimeout(() => router.replace('/login'), 5000);
        }
      }
    }
  }, [user, isLoaded, isSignedIn, router, retryCount]);

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
      <div className='text-center p-8 bg-white shadow-lg rounded-lg max-w-md mx-4'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-6'></div>
        <p className='text-lg text-gray-700 leading-relaxed'>{message}</p>
        {retryCount >= maxRetries && (
          <div className='mt-6'>
            <button
              onClick={() => router.replace('/login')}
              className='px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors'
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
