import { CreditCard, Lock, MessageCircle, Sparkles } from 'lucide-react';
import { ReactNode, useState } from 'react';

import { useSubscription } from '@/src/hooks/useSubscription';

interface SubscriptionGateProps {
  children: ReactNode;
  feature: string;
  description?: string;
  className?: string;
  showUpgradeButton?: boolean;
}

interface PlanFeature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const STARTER_PLAN_FEATURES: PlanFeature[] = [
  {
    icon: MessageCircle,
    title: 'Direct Chat with Therapists',
    description: 'Real-time messaging with licensed mental health professionals',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Matching',
    description: 'Get matched with therapists based on your specific needs',
  },
  {
    icon: Lock,
    title: 'Priority Support',
    description: 'Dedicated customer support and faster response times',
  },
];

/**
 * Subscription gate component that protects premium features
 * Shows upgrade prompt for users without active subscriptions
 */
export function SubscriptionGate({
  children,
  feature,
  description,
  className = '',
  showUpgradeButton = true,
}: SubscriptionGateProps) {
  const { hasActiveSubscription, loading, error } = useSubscription();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    if (isUpgrading) return;

    setIsUpgrading(true);
    try {
      const response = await fetch('/api/stripe/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_SUBSCRIPTION_PRICE_ID_STARTER,
          successUrl: `${window.location.origin}/billing/success?feature=${encodeURIComponent(feature)}`,
          cancelUrl: window.location.href,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (err) {
      console.error('Upgrade error:', err);
      alert('Failed to start upgrade process. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className={`bg-gray-50 rounded-xl border border-gray-200 ${className}`}>
        <div className='p-6 text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
          <p className='text-gray-600 mt-2'>Checking subscription status...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`bg-red-50 rounded-xl border border-red-200 ${className}`}>
        <div className='p-6 text-center'>
          <div className='text-red-600 mb-2'>⚠️</div>
          <p className='text-red-800 font-medium'>Unable to verify subscription</p>
          <p className='text-red-600 text-sm mt-1'>{error}</p>
        </div>
      </div>
    );
  }

  // If user has active subscription, show the protected content
  if (hasActiveSubscription) {
    return <>{children}</>;
  }

  // Show subscription gate for users without active subscription
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      <div className='p-6 md:p-8'>
        {/* Header */}
        <div className='text-center mb-6'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4'>
            <Lock className='h-8 w-8 text-blue-600' />
          </div>
          <h3 className='text-xl font-semibold text-gray-900 mb-2'>Unlock {feature}</h3>
          <p className='text-gray-600'>
            {description || `${feature} is available with a Renavest subscription.`}
          </p>
        </div>

        {/* Features List */}
        <div className='space-y-4 mb-6'>
          {STARTER_PLAN_FEATURES.map((planFeature, index) => (
            <div key={index} className='flex items-start space-x-3'>
              <div className='flex-shrink-0'>
                <planFeature.icon className='h-5 w-5 text-blue-600 mt-0.5' />
              </div>
              <div>
                <h4 className='text-sm font-medium text-gray-900'>{planFeature.title}</h4>
                <p className='text-sm text-gray-600'>{planFeature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Upgrade Button */}
        {showUpgradeButton && (
          <div className='text-center'>
            <button
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className='inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {isUpgrading ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className='h-4 w-4 mr-2' />
                  Start Free Trial
                </>
              )}
            </button>
            <p className='text-xs text-gray-500 mt-2'>
              7-day free trial • Cancel anytime • No commitment
            </p>
          </div>
        )}

        {/* Alternative Link */}
        <div className='text-center mt-4 pt-4 border-t border-gray-200'>
          <a
            href='/billing'
            className='text-sm text-blue-600 hover:text-blue-800 transition-colors'
          >
            View all plans and pricing →
          </a>
        </div>
      </div>
    </div>
  );
}
