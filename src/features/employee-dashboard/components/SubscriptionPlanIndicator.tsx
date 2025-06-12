'use client';

import { Crown, Zap } from 'lucide-react';
import { useState } from 'react';

import { useSubscription } from '@/src/hooks/useSubscription';
import { cn } from '@/src/lib/utils';

interface SubscriptionPlanIndicatorProps {
  className?: string;
}

export function SubscriptionPlanIndicator({ className }: SubscriptionPlanIndicatorProps) {
  const { hasActiveSubscription, hasStarterSubscription, loading } = useSubscription();
  const [isHovered, setIsHovered] = useState(false);

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
    window.location.href = '/employee/billing';
  };

  return (
    <div
      className={cn(
        'relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer',
        isPremium
          ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300'
          : isStarter
            ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300'
            : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300',
        'hover:shadow-md hover:scale-105',
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
        <div className='absolute top-full mt-2 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-48'>
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
              <button
                onClick={handleUpgradeClick}
                className='text-xs text-purple-600 hover:text-purple-800 font-medium transition-colors'
              >
                {isStarter ? 'Upgrade to Premium →' : 'Start Free Trial →'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
