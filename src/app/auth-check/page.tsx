'use client';

import { useUser } from '@clerk/nextjs';
import { Heart, Sparkles, Coffee, CheckCircle, Clock, Smile } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getRouteForRole, getUserRoleFromUser } from '@/src/features/auth/utils/routeMapping';
import { COLORS } from '@/src/styles/colors';

const encouragingMessages = [
  {
    text: 'Setting up your personal sanctuary...',
    icon: Heart,
    description: 'Where financial wellness begins',
  },
  {
    text: 'Brewing your perfect experience...',
    icon: Coffee,
    description: 'Just like your morning ritual',
  },
  {
    text: 'Sprinkling some magic...',
    icon: Sparkles,
    description: 'Making everything just right for you',
  },
  {
    text: 'Almost ready to welcome you home...',
    icon: Smile,
    description: 'Your journey to financial peace starts here',
  },
  {
    text: 'Putting the finishing touches...',
    icon: CheckCircle,
    description: 'Every detail matters to us',
  },
];

const loadingQuotes = [
  '💜 Taking care of your money is taking care of yourself',
  '✨ Every financial journey begins with a single step',
  '🌱 Your future self will thank you for starting today',
  "🤗 We're here to support you every step of the way",
  '💎 Financial wellness is the ultimate self-care',
];

// Background floating elements component
function FloatingBackground() {
  return (
    <div className='absolute inset-0 overflow-hidden pointer-events-none'>
      <div className='absolute top-20 left-10 w-32 h-32 bg-purple-100 rounded-full opacity-20 animate-float'></div>
      <div className='absolute top-40 right-20 w-24 h-24 bg-pink-100 rounded-full opacity-25 animate-float-delayed'></div>
      <div className='absolute bottom-32 left-1/4 w-40 h-40 bg-purple-50 rounded-full opacity-15 animate-float-slow'></div>
      <div className='absolute bottom-20 right-10 w-20 h-20 bg-pink-50 rounded-full opacity-30 animate-float'></div>
    </div>
  );
}

// Logo header component
function LogoHeader({ showHeartbeat }: { showHeartbeat: boolean }) {
  return (
    <div className='bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 px-8 py-6'>
      <div className='flex justify-center mb-4'>
        <div
          className={`relative w-20 h-20 transition-transform duration-500 ${showHeartbeat ? 'scale-110' : 'scale-100'}`}
        >
          <img
            src='/renavestlogo.png'
            alt='Renavest'
            className='w-full h-full object-contain drop-shadow-lg'
          />
          <div className='absolute -inset-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse'></div>
        </div>
      </div>
    </div>
  );
}

// Main content section
function MainContent({
  currentMessage,
  currentQuote,
  progressPercentage,
  retryCount,
  maxRetries,
  onRetry,
  onBackToLogin,
}: {
  currentMessage: (typeof encouragingMessages)[0];
  currentQuote: string;
  progressPercentage: number;
  retryCount: number;
  maxRetries: number;
  onRetry: () => void;
  onBackToLogin: () => void;
}) {
  const IconComponent = currentMessage.icon;

  return (
    <div className='px-8 py-8 text-center'>
      {/* Dynamic icon with message */}
      <div className='flex justify-center mb-6'>
        <div className='relative'>
          <div className='w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center shadow-lg transform transition-all duration-500 hover:rotate-12'>
            <IconComponent className={`w-8 h-8 text-purple-600 transition-all duration-300`} />
          </div>
          {/* Animated rings */}
          <div className='absolute inset-0 w-16 h-16 rounded-full border-2 border-purple-300 opacity-25 animate-ping'></div>
          <div className='absolute inset-2 w-12 h-12 rounded-full border border-pink-300 opacity-40 animate-pulse'></div>
        </div>
      </div>

      {/* Main message with smooth transitions */}
      <div className='h-20 flex flex-col justify-center mb-6'>
        <h2 className='text-2xl font-bold text-gray-900 mb-2 animate-fade-in-up'>
          {currentMessage.text}
        </h2>
        <p className='text-purple-600 text-sm font-medium animate-fade-in-up opacity-80'>
          {currentMessage.description}
        </p>
      </div>

      {/* Inspirational quote */}
      <div className='bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 mb-8 border border-purple-100'>
        <p className='text-gray-700 text-sm leading-relaxed font-medium transition-all duration-500'>
          {currentQuote}
        </p>
      </div>

      {/* Enhanced progress indicator */}
      <div className='w-full bg-gray-100 rounded-full h-3 mb-6 overflow-hidden shadow-inner'>
        <div
          className='h-3 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 transition-all duration-700 ease-out relative overflow-hidden'
          style={{ width: `${progressPercentage}%` }}
        >
          <div className='absolute inset-0 bg-white bg-opacity-30 animate-shimmer'></div>
          {progressPercentage > 20 && (
            <div className='absolute right-2 top-0.5 text-xs text-white font-bold opacity-90'>
              {Math.round(progressPercentage)}%
            </div>
          )}
        </div>
      </div>

      {/* Time indicator */}
      <div className='flex items-center justify-center gap-2 text-gray-500 mb-6'>
        <Clock className='w-4 h-4' />
        <span className='text-sm'>
          {retryCount < maxRetries
            ? `Setting up your space (${Math.round(retryCount * 2)}s)`
            : 'Taking a bit longer than usual...'}
        </span>
      </div>

      {retryCount >= maxRetries && (
        <div className='space-y-6 animate-fade-in-up'>
          <div className='p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl'>
            <div className='flex items-center justify-center gap-2 mb-3'>
              <Clock className='w-5 h-5 text-amber-600' />
              <h3 className='font-semibold text-amber-800'>Almost there!</h3>
            </div>
            <p className='text-amber-700 text-sm leading-relaxed'>
              We're putting extra care into setting up your experience. Sometimes the best things
              take a little longer. You can try refreshing, or reach out to us if needed.
            </p>
          </div>

          <div className='flex flex-col sm:flex-row gap-4'>
            <button
              onClick={onRetry}
              className='flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2'
            >
              <Sparkles className='w-4 h-4' />
              Try Again
            </button>
            <button
              onClick={onBackToLogin}
              className='flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all duration-300 font-medium flex items-center justify-center gap-2 hover:scale-105'
            >
              <Heart className='w-4 h-4' />
              Back to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced footer component
function EnhancedFooter() {
  return (
    <div className='text-center mt-8'>
      <div className='flex items-center justify-center gap-2 text-purple-600 mb-2'>
        <Heart className='w-4 h-4 fill-current animate-pulse' />
        <p className='text-sm font-medium'>Crafted with love by the Renavest team</p>
        <Heart className='w-4 h-4 fill-current animate-pulse' />
      </div>
      <p className='text-xs text-gray-500'>Your financial wellness journey starts here</p>
    </div>
  );
}

export default function AuthCheckPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [showHeartbeat, setShowHeartbeat] = useState(true);
  const maxRetries = 15; // 30 seconds
  const retryDelay = 2000; // 2 seconds

  // Cycle through encouraging messages
  useEffect(() => {
    const messageTimer = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % encouragingMessages.length);
    }, 3000);

    return () => clearInterval(messageTimer);
  }, []);

  // Cycle through quotes
  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % loadingQuotes.length);
    }, 4000);

    return () => clearInterval(quoteTimer);
  }, []);

  // Heartbeat animation control
  useEffect(() => {
    const heartbeatTimer = setInterval(() => {
      setShowHeartbeat((prev) => !prev);
    }, 1500);

    return () => clearInterval(heartbeatTimer);
  }, []);

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
      }
    }
  }, [user, isLoaded, isSignedIn, router, retryCount]);

  const currentMessage = encouragingMessages[currentMessageIndex];
  const currentQuote = loadingQuotes[currentQuoteIndex];
  const progressPercentage = Math.min((retryCount / maxRetries) * 100, 90);

  const handleRetry = () => {
    setRetryCount(0);
    user?.reload?.();
  };

  const handleBackToLogin = () => router.replace('/login');

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${COLORS.WARM_WHITE.bg} relative overflow-hidden`}
    >
      <FloatingBackground />

      <div className='w-full max-w-lg mx-auto px-6 relative z-10'>
        <div className='bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden transform hover:scale-[1.02] transition-all duration-300'>
          <LogoHeader showHeartbeat={showHeartbeat} />
          <MainContent
            currentMessage={currentMessage}
            currentQuote={currentQuote}
            progressPercentage={progressPercentage}
            retryCount={retryCount}
            maxRetries={maxRetries}
            onRetry={handleRetry}
            onBackToLogin={handleBackToLogin}
          />
        </div>

        <EnhancedFooter />
      </div>
    </div>
  );
}
