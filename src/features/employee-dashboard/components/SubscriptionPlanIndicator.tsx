'use client';

import { Crown, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useSubscription } from '@/src/hooks/useSubscription';
import { cn } from '@/src/lib/utils';

interface SubscriptionPlanIndicatorProps {
  className?: string;
}

export function SubscriptionPlanIndicator({ className }: SubscriptionPlanIndicatorProps) {
  const { hasActiveSubscription, hasStarterSubscription, loading } = useSubscription();
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  // Determine plan status
  const planName = hasActiveSubscription
    ? hasStarterSubscription
      ? 'Starter'
      : 'Premium'
    : 'Free';
  const isPremium = hasActiveSubscription && !hasStarterSubscription;
  const isStarter = hasActiveSubscription && hasStarterSubscription;

  if (loading) {
    return <div className={cn('animate-pulse bg-gray-200 rounded-full h-6 w-16', className)}></div>;
  }

  const handleUpgradeClick = () => {
    // Navigate to billing page for upgrade
    router.push('/employee/billing');
  };

  return (
    <div
      className={cn(
        'relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200',
        isPremium
          ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300'
          : isStarter
            ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300 cursor-pointer hover:shadow-md hover:scale-105'
            : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300 cursor-pointer hover:shadow-md hover:scale-105',
        !isPremium &&
          'hover:bg-gradient-to-r hover:from-purple-100 hover:to-purple-200 hover:text-purple-800 hover:border-purple-300',
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={!isPremium ? handleUpgradeClick : undefined}
    >
      {isPremium ? (
        <Crown className='w-3 h-3' />
      ) : isStarter ? (
        <Zap className='w-3 h-3' />
      ) : (
        <div className='w-2 h-2 rounded-full bg-gray-500'></div>
      )}
      <span>{planName}</span>

      {/* Hover tooltip */}
      {isHovered && (
        <>
          {/* Invisible bridge to prevent tooltip from disappearing */}
          <div className='absolute top-full right-0 w-full h-2 z-40'></div>
          <div
            className={cn(
              'absolute top-full mt-1 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-48',
              !isPremium &&
                'cursor-pointer hover:border-purple-300 hover:shadow-xl transition-all duration-200',
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={!isPremium ? handleUpgradeClick : undefined}
          >
            <div className='text-sm text-gray-800 font-medium mb-1'>
              {planName} Plan {isPremium ? '✨' : isStarter ? '⚡' : '🆓'}
            </div>
            <div className='text-xs text-gray-600 space-y-1'>
              {isPremium ? (
                <>
                  <div>• Unlimited chat access</div>
                  <div>• Priority therapist matching</div>
                  <div>• Advanced wellness insights</div>
                </>
              ) : isStarter ? (
                <>
                  <div>• Direct therapist chat</div>
                  <div>• AI-powered matching</div>
                  <div>• Session booking</div>
                </>
              ) : (
                <>
                  <div>• Limited chat access</div>
                  <div>• Basic therapist browsing</div>
                  <div>• Session booking only</div>
                </>
              )}
            </div>
            {!isPremium && (
              <div className='mt-2 pt-2 border-t border-gray-200'>
                <div className='text-xs text-purple-600 font-medium mb-1 cursor-pointer hover:text-purple-800 transition-colors'>
                  {isStarter ? '✨ Upgrade to Premium' : '🚀 Start Free Trial'}
                </div>
                <div className='text-xs text-gray-500'>
                  {isStarter
                    ? 'Unlock all features + priority support'
                    : '7 days free, then $9.99/month'}
                </div>
                <div className='text-xs text-gray-400 mt-1 italic'>Click anywhere to upgrade</div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
