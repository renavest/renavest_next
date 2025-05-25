'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getRouteForRole, getUserRoleFromUser } from '@/src/features/auth/utils/routeMapping';

export default function AuthCheckPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [message, setMessage] = useState('Finalizing your session, please wait...');
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 15; // Increased to 30 seconds
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
        retryCount,
      });

      // Check if user has both role and onboardingComplete flag
      if (userRole && onboardingComplete) {
        const targetRoute = getRouteForRole(userRole);
        setMessage(`Setup complete! Redirecting to ${targetRoute}...`);
        console.log('AuthCheckPage - Redirecting to dashboard:', {
          userRole,
          targetRoute,
          userId: user.id,
        });
        router.replace(targetRoute);
        return;
      }

      // User doesn't have complete metadata yet
      if (retryCount < maxRetries) {
        setMessage(
          `Waiting for account setup to complete (Role: ${userRole || 'Pending'}, Onboarding: ${onboardingComplete === undefined ? 'Pending' : onboardingComplete}). Attempt ${retryCount + 1}/${maxRetries}`,
        );

        const timer = setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          // Force a re-check by reloading user data
          user.reload?.();
        }, retryDelay);

        return () => clearTimeout(timer);
      } else {
        // Max retries reached
        console.error('AuthCheckPage - Max retries reached, webhook may have failed', {
          userId: user.id,
          finalRole: userRole,
          finalOnboardingComplete: onboardingComplete,
          publicMetadata: user.publicMetadata,
        });
        setMessage(
          'Account setup is taking longer than expected. Please try logging in again or contact support.',
        );
      }
    }
  }, [user, isLoaded, isSignedIn, router, retryCount]);

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
      <div className='text-center p-8 bg-white shadow-lg rounded-lg max-w-md mx-4'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-6'></div>
        <p className='text-lg text-gray-700 leading-relaxed mb-4'>{message}</p>

        {/* Show progress indicator */}
        <div className='w-full bg-gray-200 rounded-full h-2 mb-4'>
          <div
            className='bg-purple-500 h-2 rounded-full transition-all duration-300'
            style={{ width: `${(retryCount / maxRetries) * 100}%` }}
          ></div>
        </div>

        {retryCount >= maxRetries && (
          <div className='mt-6 space-y-3'>
            <button
              onClick={() => router.replace('/login')}
              className='w-full px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors'
            >
              Go to Login
            </button>
            <button
              onClick={() => {
                setRetryCount(0);
                setMessage('Retrying account setup...');
                user?.reload?.();
              }}
              className='w-full px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors'
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
