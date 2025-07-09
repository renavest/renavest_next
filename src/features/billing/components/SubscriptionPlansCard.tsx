'use client';

import { Check, MessageCircle, Zap } from 'lucide-react';
import { useState } from 'react';

import { SUBSCRIPTION_PLANS } from '@/src/config/billing';

import { cn } from '@/src/lib/utils';

import type { SubscriptionPlansCardProps } from '../types';

/**
 * SubscriptionPlansCard Component
 *
 * Displays available subscription plans with features, pricing, and upgrade options.
 * Handles employer sponsorship and current plan highlighting.
 *
 * @param props - Component props including current plan, sponsorship info, and callbacks
 */
export function SubscriptionPlansCard({
  currentPlan,
  hasEmployerSponsorship = false,
  employerName,
  onSubscribe,
  className,
}: SubscriptionPlansCardProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (plan.id === 'basic' || currentPlan === plan.stripePriceId) return;

    try {
      setIsLoading(plan.id);
      await onSubscribe(plan.stripePriceId, hasEmployerSponsorship);
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const isCurrentPlan = (plan: SubscriptionPlan) => {
    if (plan.id === 'basic') return !currentPlan;
    return currentPlan === plan.stripePriceId;
  };

  return (
    <div className={cn('bg-white rounded-xl p-6 border border-purple-100 shadow-sm', className)}>
      <div className='mb-6'>
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>Choose Your Plan</h2>
        <p className='text-gray-600'>
          Unlock premium features like direct messaging with your therapist
        </p>
        {hasEmployerSponsorship && employerName && (
          <div className='mt-3 p-3 bg-green-50 border border-green-200 rounded-lg'>
            <div className='flex items-center gap-2 text-green-800'>
              <Zap className='w-4 h-4' />
              <span className='font-medium'>Employer Sponsored</span>
            </div>
            <p className='text-sm text-green-700 mt-1'>
              {employerName} is covering your subscription costs
            </p>
          </div>
        )}
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrent = isCurrentPlan(plan);
          const loading = isLoading === plan.id;

          return (
            <div
              key={plan.id}
              className={cn(
                'relative border rounded-xl p-6 transition-all hover:shadow-md',
                plan.highlight ? 'border-purple-200 bg-purple-50' : 'border-gray-200 bg-white',
                isCurrent && 'ring-2 ring-purple-500',
              )}
            >
              {plan.badge && (
                <div className='absolute -top-3 left-1/2 transform -translate-x-1/2'>
                  <span className='bg-purple-600 text-white text-xs font-medium px-3 py-1 rounded-full'>
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className='text-center mb-4'>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>{plan.name}</h3>
                <p className='text-sm text-gray-600 mb-4'>{plan.description}</p>

                <div className='mb-4'>
                  {plan.price === 0 ? (
                    <span className='text-3xl font-bold text-gray-900'>Free</span>
                  ) : (
                    <div>
                      <span className='text-3xl font-bold text-gray-900'>${plan.price}</span>
                      <span className='text-gray-600'>/{plan.interval}</span>
                      {hasEmployerSponsorship && (
                        <div className='text-sm text-green-600 font-medium mt-1'>
                          Sponsored by {employerName}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <ul className='space-y-3 mb-6'>
                {plan.features.map((feature, index) => (
                  <li key={index} className='flex items-start gap-2 text-sm'>
                    <Check
                      className={cn(
                        'w-4 h-4 mt-0.5 flex-shrink-0',
                        plan.highlight ? 'text-purple-600' : 'text-green-600',
                      )}
                    />
                    <span className='text-gray-700'>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan)}
                disabled={loading || isCurrent || plan.id === 'basic'}
                className={cn(
                  'w-full py-3 px-4 rounded-lg font-medium transition-colors',
                  isCurrent
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : plan.highlight
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white',
                  loading && 'opacity-50 cursor-not-allowed',
                  plan.id === 'basic' && 'bg-gray-100 text-gray-400 cursor-not-allowed',
                )}
              >
                {loading
                  ? 'Processing...'
                  : isCurrent
                    ? 'Current Plan'
                    : plan.id === 'basic'
                      ? 'Current Plan'
                      : hasEmployerSponsorship
                        ? 'Activate with Employer Sponsorship'
                        : `Upgrade to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      <div className='mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
        <div className='flex items-start gap-3'>
          <MessageCircle className='w-5 h-5 text-blue-600 mt-0.5' />
          <div>
            <h4 className='font-medium text-blue-900 mb-1'>Why upgrade to Premium?</h4>
            <p className='text-sm text-blue-800'>
              Direct messaging allows you to stay connected with your therapist between sessions,
              ask quick questions, and maintain continuity in your mental health journey.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
