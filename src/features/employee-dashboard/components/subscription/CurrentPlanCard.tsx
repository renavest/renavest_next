'use client';

import { Crown, Zap, ArrowRight, Sparkles, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useSubscription } from '@/src/hooks/useSubscription';
import { cn } from '@/src/lib/utils';

interface CurrentPlanCardProps {
  className?: string;
}

export function CurrentPlanCard({ className }: CurrentPlanCardProps) {
  const { hasActiveSubscription, hasStarterSubscription, loading } = useSubscription();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  // Determine plan status
  const planName = hasActiveSubscription
    ? hasStarterSubscription
      ? 'Starter'
      : 'Premium'
    : 'Free';
  const isPremium = hasActiveSubscription && !hasStarterSubscription;
  const isStarter = hasActiveSubscription && hasStarterSubscription;
  const isFree = !hasActiveSubscription;

  const handleUpgradeClick = () => {
    setIsNavigating(true);
    router.push('/employee/billing');
  };

  if (loading) {
    return (
      <div className={cn('bg-white rounded-xl shadow-sm border border-gray-200 p-6', className)}>
        <div className='animate-pulse'>
          <div className='h-6 bg-gray-200 rounded w-1/3 mb-4'></div>
          <div className='h-4 bg-gray-200 rounded w-2/3 mb-2'></div>
          <div className='h-4 bg-gray-200 rounded w-1/2'></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden',
        className,
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'p-6 border-b border-gray-100',
          isPremium
            ? 'bg-gradient-to-r from-purple-50 to-purple-100'
            : isStarter
              ? 'bg-gradient-to-r from-blue-50 to-blue-100'
              : 'bg-gradient-to-r from-gray-50 to-gray-100',
        )}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center',
                isPremium ? 'bg-purple-200' : isStarter ? 'bg-blue-200' : 'bg-gray-200',
              )}
            >
              {isPremium ? (
                <Crown className='w-6 h-6 text-purple-700' />
              ) : isStarter ? (
                <Zap className='w-6 h-6 text-blue-700' />
              ) : (
                <div className='w-4 h-4 rounded-full bg-gray-500'></div>
              )}
            </div>
            <div>
              <h3 className='text-xl font-semibold text-gray-900'>
                {planName} Plan
                {isPremium && ' ✨'}
                {isStarter && ' ⚡'}
                {isFree && ' 🆓'}
              </h3>
              <p
                className={cn(
                  'text-sm',
                  isPremium ? 'text-purple-700' : isStarter ? 'text-blue-700' : 'text-gray-600',
                )}
              >
                {isPremium
                  ? 'All premium features unlocked'
                  : isStarter
                    ? 'Essential features included'
                    : 'Limited access - upgrade for more'}
              </p>
            </div>
          </div>
          {!isPremium && (
            <div className='text-right'>
              <div className='text-sm text-gray-500 mb-1'>
                {isStarter ? 'Upgrade Available' : 'Start Free Trial'}
              </div>
              <button
                onClick={handleUpgradeClick}
                disabled={isNavigating}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                  'bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow-md',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
              >
                {isNavigating ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <Sparkles className='w-4 h-4' />
                    {isStarter ? 'Upgrade' : 'Start Trial'}
                    <ArrowRight className='w-4 h-4' />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Features */}
      <div className='p-6'>
        <h4 className='text-sm font-semibold text-gray-900 mb-4'>
          {isPremium ? 'Your Premium Features' : `${planName} Plan Features`}
        </h4>
        <div className='space-y-3'>
          {isPremium ? (
            <>
              <FeatureItem icon={Check} text='Unlimited chat access' included={true} />
              <FeatureItem icon={Check} text='Priority therapist matching' included={true} />
              <FeatureItem icon={Check} text='Advanced wellness insights' included={true} />
              <FeatureItem icon={Check} text='Session booking' included={true} />
              <FeatureItem icon={Check} text='24/7 support' included={true} />
            </>
          ) : isStarter ? (
            <>
              <FeatureItem icon={Check} text='Direct therapist chat' included={true} />
              <FeatureItem icon={Check} text='AI-powered matching' included={true} />
              <FeatureItem icon={Check} text='Session booking' included={true} />
              <FeatureItem icon={Check} text='Basic insights' included={true} />
              <FeatureItem
                icon={Crown}
                text='Priority support'
                included={false}
                upgradeFeature={true}
              />
            </>
          ) : (
            <>
              <FeatureItem icon={Check} text='Basic therapist browsing' included={true} />
              <FeatureItem icon={Check} text='Session booking only' included={true} />
              <FeatureItem
                icon={Zap}
                text='Direct therapist chat'
                included={false}
                upgradeFeature={true}
              />
              <FeatureItem
                icon={Crown}
                text='AI-powered matching'
                included={false}
                upgradeFeature={true}
              />
              <FeatureItem
                icon={Sparkles}
                text='Advanced insights'
                included={false}
                upgradeFeature={true}
              />
            </>
          )}
        </div>

        {/* Upgrade CTA for non-premium users */}
        {!isPremium && (
          <div className='mt-6 pt-6 border-t border-gray-100'>
            <div className='bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <h5 className='font-semibold text-gray-900 mb-1'>
                    {isStarter ? 'Unlock Premium Features' : 'Start Your Free Trial'}
                  </h5>
                  <p className='text-sm text-gray-600'>
                    {isStarter
                      ? 'Get unlimited access and priority support'
                      : 'Try all features free for 7 days, then $9.99/month'}
                  </p>
                </div>
                <ArrowRight className='w-5 h-5 text-purple-600' />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface FeatureItemProps {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  included: boolean;
  upgradeFeature?: boolean;
}

function FeatureItem({ icon: Icon, text, included, upgradeFeature = false }: FeatureItemProps) {
  return (
    <div className='flex items-center gap-3'>
      <div
        className={cn(
          'w-5 h-5 rounded-full flex items-center justify-center',
          included
            ? 'bg-green-100 text-green-600'
            : upgradeFeature
              ? 'bg-purple-100 text-purple-600'
              : 'bg-gray-100 text-gray-400',
        )}
      >
        <Icon className='w-3 h-3' />
      </div>
      <span
        className={cn(
          'text-sm',
          included
            ? 'text-gray-900'
            : upgradeFeature
              ? 'text-purple-700 font-medium'
              : 'text-gray-500',
        )}
      >
        {text}
        {upgradeFeature && ' (Upgrade to unlock)'}
      </span>
    </div>
  );
}
