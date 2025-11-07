'use client';
/* eslint-disable max-lines-per-function */

import { useUser } from '@clerk/nextjs';
import { Heart, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getRouteForRole, getUserRoleFromUser } from '@/src/features/auth/utils/routeMapping';
import { COLORS } from '@/src/styles/colors';

const encouragingMessages = [
  'Setting up your financial wellness sanctuary...',
  'Preparing your personalized experience...',
  'Connecting you to financial peace...',
  'Almost ready to welcome you home...',
  'Creating your secure space...',
];

const loadingQuotes = [
  '💜 Taking care of your money is taking care of yourself',
  '✨ Every financial journey begins with a single step',
  '🌱 Your future self will thank you for starting today',
  "🤗 We're here to support you every step of the way",
  '💎 Financial wellness is the ultimate self-care',
];

// Simplified background with fewer distracting elements
function CleanBackground() {
  return (
    <div className='absolute inset-0 overflow-hidden pointer-events-none'>
      <div className='absolute top-32 left-20 w-64 h-64 bg-purple-100 rounded-full opacity-10 animate-pulse-purple'></div>
      <div className='absolute bottom-40 right-16 w-48 h-48 bg-purple-50 rounded-full opacity-15 animate-pulse-purple'></div>
    </div>
  );
}

export default function AuthCheckPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [actualProgress, setActualProgress] = useState(0);
  const maxRetries = 15; // 30 seconds
  const retryDelay = 2000; // 2 seconds

  // Helper to check readiness from server
  const checkServerReady = async () => {
    try {
      const res = await fetch('/api/auth/status', { credentials: 'include' });
      if (!res.ok) return false;
      const data = await res.json();
      return data.ready === true;
    } catch (e) {
      console.error('auth-check: error calling /api/auth/status', e);
      return false;
    }
  };

  // Cycle through encouraging messages
  useEffect(() => {
    const messageTimer = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % encouragingMessages.length);
    }, 4000);

    return () => clearInterval(messageTimer);
  }, []);

  // Cycle through quotes
  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % loadingQuotes.length);
    }, 5000);

    return () => clearInterval(quoteTimer);
  }, []);

  // Better progress tracking - synchronized with retry timing
  useEffect(() => {
    const progressTimer = setInterval(() => {
      setActualProgress((prev) => {
        // Progress should be based on retryCount and maxRetries for consistency
        const baseProgress = (retryCount / maxRetries) * 90; // Max 90% from retry progress

        // Add small incremental progress within each retry cycle (0-10%)
        const cycleProgress = Math.min(10, prev - baseProgress);
        const newCycleProgress = cycleProgress < 10 ? cycleProgress + 0.5 : 10;

        return Math.min(95, baseProgress + newCycleProgress);
      });
    }, 100); // Faster updates for smoother animation

    return () => clearInterval(progressTimer);
  }, [retryCount, maxRetries]);

  // Reset cycle progress when retryCount changes
  useEffect(() => {
    const baseProgress = (retryCount / maxRetries) * 90;
    setActualProgress(baseProgress);
  }, [retryCount, maxRetries]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      router.replace('/login');
      return;
    }

    if (user) {
      const userRole = getUserRoleFromUser(user);
      const unsafeOnboardingComplete = user.unsafeMetadata?.onboardingComplete as boolean | undefined;
      const onboardingComplete = user.publicMetadata?.onboardingComplete as boolean | undefined;

      console.info('AuthCheckPage - User Data:', {
        userId: user.id,
        roleFromMetadata: userRole,
        onboardingCompleteFromMetadata: onboardingComplete,
        unsafeOnboardingComplete,
        publicMetadata: user.publicMetadata,
        unsafeMetadata: user.unsafeMetadata,
        retryCount,
      });

      // Check if onboardingComplete or role is in unsafeMetadata but not in publicMetadata
      // If so, sync them to publicMetadata via API (direct assignment won't persist to Clerk)
      const unsafeRole = user.unsafeMetadata?.role as string | undefined;
      const publicRole = user.publicMetadata?.role as string | undefined;
      const needsOnboardingSync = unsafeOnboardingComplete === true && onboardingComplete !== true;
      const needsRoleSync = unsafeRole && !publicRole;
      
      if (needsOnboardingSync || needsRoleSync) {
        (async () => {
          try {
            const syncResponse = await fetch('/api/auth/sync-onboarding-metadata', {
              method: 'POST',
            });

            if (syncResponse.ok) {
              const syncResult = await syncResponse.json();
              console.info('AuthCheckPage - Synced metadata from unsafeMetadata:', syncResult);
              
              // Reload user to get updated metadata
              await user.reload();
            } else {
              console.error('AuthCheckPage - Failed to sync metadata:', await syncResponse.text());
            }
          } catch (syncError) {
            console.error('AuthCheckPage - Error syncing metadata:', syncError);
          }
        })();
      }

      // Check if user has both role and onboardingComplete flag (fast-path)
      // Also check unsafeMetadata as fallback in case sync hasn't completed yet
      const effectiveOnboardingComplete = onboardingComplete || unsafeOnboardingComplete;
      if (userRole && effectiveOnboardingComplete) {
        const targetRoute = getRouteForRole(userRole);
        console.info('AuthCheckPage - Redirecting to dashboard:', {
          userRole,
          targetRoute,
          userId: user.id,
          onboardingComplete,
          unsafeOnboardingComplete,
          effectiveOnboardingComplete,
        });

        // Complete the progress and redirect
        setActualProgress(100);
        setTimeout(() => {
          router.replace(targetRoute);
        }, 800);
        return;
      }

      // Otherwise consult the server for readiness
      (async () => {
        const ready = await checkServerReady();
        if (ready) {
          const targetRoute = getRouteForRole(userRole ?? null);
          router.replace(targetRoute);
          return;
        }

        // User doesn't have complete metadata yet
        if (retryCount < maxRetries) {
          const timer = setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            // Force a re-check by reloading user data
            user.reload?.();
          }, retryDelay);

          return () => clearTimeout(timer);
        } else {
          // Max retries reached - PREVENT INFINITE LOOP by redirecting to a safe route
          console.error('AuthCheckPage - Max retries reached, redirecting to safe route', {
            userId: user.id,
            finalRole: userRole,
            finalOnboardingComplete: onboardingComplete,
            publicMetadata: user.publicMetadata,
          });

          // Attempt manual database sync
          try {
            const syncResponse = await fetch('/api/auth/sync-user-database', {
              method: 'POST',
            });

            if (syncResponse.ok) {
              const syncResult = await syncResponse.json();
              console.info('Manual sync successful:', syncResult);

              // Reload user and redirect to their appropriate dashboard
              await user.reload();
              const refreshedRole = getUserRoleFromUser(user);
              const targetRoute = getRouteForRole(refreshedRole ?? 'employee');
              router.replace(targetRoute);
              return;
            } else {
              console.error('Manual sync failed:', await syncResponse.text());
            }
          } catch (syncError) {
            console.error('Manual sync error:', syncError);
          }

          // Final failsafe: redirect to employee dashboard regardless of role
          // This breaks the infinite loop and gets the user to a functional page
          router.replace('/employee');
        }
      })();
    }
  }, [user, isLoaded, isSignedIn, router, retryCount]);

  const currentMessage = encouragingMessages[currentMessageIndex];
  const currentQuote = loadingQuotes[currentQuoteIndex];

  const handleRetry = () => {
    setRetryCount(0);
    setActualProgress(0);
    user?.reload?.();
  };

  const handleBackToLogin = () => router.replace('/login');

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center ${COLORS.WARM_WHITE.bg} relative px-4`}
    >
      <CleanBackground />

      {/* Main Content Container - Properly Centered */}
      <div className='w-full max-w-md mx-auto relative z-10'>
        {/* Card Container */}
        <div className='bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden'>
          {/* Logo Section - Simplified */}
          <div className='bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 px-8 py-8 text-center'>
            <div className='relative w-16 h-16 mx-auto mb-4'>
              <img
                src='/renavestlogo.png'
                alt='Renavest'
                className='w-full h-full object-contain drop-shadow-sm'
              />
            </div>
            <h1 className='text-xl font-semibold text-gray-900 mb-1'>Welcome to Renavest</h1>
            <p className='text-sm text-purple-600 font-medium'>Financial wellness starts here</p>
          </div>

          {/* Content Section */}
          <div className='px-8 py-8'>
            {/* Status Icon */}
            <div className='flex justify-center mb-6'>
              <div className='w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center shadow-sm'>
                {actualProgress === 100 ? (
                  <CheckCircle className='w-6 h-6 text-purple-600' />
                ) : (
                  <Clock className='w-6 h-6 text-purple-600 animate-pulse' />
                )}
              </div>
            </div>

            {/* Message */}
            <div className='text-center mb-6'>
              <h2 className='text-lg font-semibold text-gray-900 mb-2 animate-fade-in-up'>
                {currentMessage}
              </h2>
              <p className='text-sm text-gray-600'>
                {retryCount < maxRetries
                  ? `Setting up your space (${Math.round(retryCount * 2)}s)`
                  : 'Taking a bit longer than usual...'}
              </p>
            </div>

            {/* Progress Bar - Actually Working */}
            <div className='w-full bg-gray-100 rounded-full h-2 mb-6 overflow-hidden'>
              <div
                className='h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500 ease-out'
                style={{ width: `${Math.min(actualProgress, 100)}%` }}
              />
            </div>

            {/* Inspirational Quote */}
            <div className='bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6 border border-purple-100'>
              <p className='text-gray-700 text-sm text-center leading-relaxed'>{currentQuote}</p>
            </div>

            {/* Error State */}
            {retryCount >= maxRetries && (
              <div className='space-y-4 animate-fade-in-up'>
                <div className='p-4 bg-amber-50 border border-amber-200 rounded-xl'>
                  <div className='text-center'>
                    <Clock className='w-5 h-5 text-amber-600 mx-auto mb-2' />
                    <h3 className='font-semibold text-amber-800 mb-1'>Almost there!</h3>
                    <p className='text-amber-700 text-sm'>
                      We're putting extra care into setting up your experience. You can try
                      refreshing or reach out if needed.
                    </p>
                  </div>
                </div>

                <div className='flex flex-col gap-3'>
                  <button
                    onClick={handleRetry}
                    className='w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2'
                  >
                    <Sparkles className='w-4 h-4' />
                    Try Again
                  </button>
                  <button
                    onClick={handleBackToLogin}
                    className='w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium flex items-center justify-center gap-2'
                  >
                    <Heart className='w-4 h-4' />
                    Back to Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className='text-center mt-6'>
          <div className='flex items-center justify-center gap-2 text-purple-600 mb-1'>
            <Heart className='w-3 h-3 fill-current' />
            <p className='text-xs font-medium'>Crafted with love by the Renavest team</p>
            <Heart className='w-3 h-3 fill-current' />
          </div>
          <p className='text-xs text-gray-500'>Your financial wellness journey starts here</p>
        </div>
      </div>
    </div>
  );
}
