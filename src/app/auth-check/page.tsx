'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getRouteForRole, getUserRoleFromUser } from '@/src/features/auth/utils/routeMapping';
import { COLORS } from '@/src/styles/colors';

export default function AuthCheckPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [message, setMessage] = useState('Setting up your account...');
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 15; // 30 seconds
  const retryDelay = 2000; // 2 seconds

  useEffect(() => {
    if (!isLoaded) {
      setMessage('Loading your profile...');
      return;
    }

    if (!isSignedIn) {
      setMessage('Redirecting to sign in...');
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
        setMessage('Welcome! Taking you to your dashboard...');
        console.log('AuthCheckPage - Redirecting to dashboard:', {
          userRole,
          targetRoute,
          userId: user.id,
        });

        // Add a small delay for better UX
        setTimeout(() => {
          router.replace(targetRoute);
        }, 1000);
        return;
      }

      // User doesn't have complete metadata yet
      if (retryCount < maxRetries) {
        const messages = [
          'Setting up your account...',
          'Preparing your workspace...',
          'Almost ready...',
          'Finalizing your profile...',
        ];
        const messageIndex = Math.floor(retryCount / 4) % messages.length;
        setMessage(messages[messageIndex]);

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
        setMessage('Taking longer than expected...');
      }
    }
  }, [user, isLoaded, isSignedIn, router, retryCount]);

  return (
    <div className={`min-h-screen flex items-center justify-center ${COLORS.WARM_WHITE.bg}`}>
      <div className='w-full max-w-md mx-auto px-6'>
        <div className='bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden'>
          <div className='px-8 py-12 text-center'>
            {/* Logo */}
            <div className='flex justify-center mb-8'>
              <div className='relative w-16 h-16'>
                <img
                  src='/renavestlogo.png'
                  alt='Renavest'
                  className='w-full h-full object-contain'
                />
              </div>
            </div>

            {/* Animated gradient spinner */}
            <div className='flex justify-center mb-8'>
              <div className='relative'>
                <div className='w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 animate-spin'>
                  <div className='absolute inset-2 bg-white rounded-full'></div>
                </div>
                <div className='absolute inset-0 w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 animate-pulse opacity-20'></div>
              </div>
            </div>

            {/* Message */}
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>{message}</h2>

            <p className='text-gray-600 mb-8 leading-relaxed'>
              We're preparing your personalized experience. This will just take a moment.
            </p>

            {/* Progress indicator */}
            <div className='w-full bg-gray-100 rounded-full h-2 mb-8 overflow-hidden'>
              <div
                className='h-2 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-500 ease-out'
                style={{
                  width: `${Math.min((retryCount / maxRetries) * 100, 90)}%`,
                  animation: retryCount < maxRetries ? 'pulse 2s infinite' : 'none',
                }}
              ></div>
            </div>

            {retryCount >= maxRetries && (
              <div className='space-y-4'>
                <div className='p-4 bg-amber-50 border border-amber-200 rounded-xl'>
                  <p className='text-amber-800 text-sm'>
                    Setup is taking longer than usual. You can try refreshing or contact support if
                    this continues.
                  </p>
                </div>

                <div className='flex flex-col sm:flex-row gap-3'>
                  <button
                    onClick={() => {
                      setRetryCount(0);
                      setMessage('Retrying setup...');
                      user?.reload?.();
                    }}
                    className='flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => router.replace('/login')}
                    className='flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium'
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Subtle footer */}
        <div className='text-center mt-6'>
          <p className='text-sm text-gray-500'>Powered by Renavest</p>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}
