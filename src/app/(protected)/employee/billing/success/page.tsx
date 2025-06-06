'use client';

import { CheckCircle, MessageCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useSubscription } from '@/src/hooks/useSubscription';

interface FeatureHighlight {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

const FEATURES: FeatureHighlight[] = [
  {
    icon: MessageCircle,
    title: 'Direct Chat with Therapists',
    description: 'Start conversations with licensed mental health professionals instantly',
    action: {
      label: 'Start Chatting',
      href: '/employee',
    },
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Matching',
    description: 'Get matched with therapists who specialize in your specific needs',
    action: {
      label: 'Find Your Match',
      href: '/employee',
    },
  },
];

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { subscription, loading, refetchSubscription } = useSubscription();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const sessionId = searchParams.get('session_id');
  const feature = searchParams.get('feature');

  useEffect(() => {
    // Refresh subscription status after successful payment
    const refreshSubscription = async () => {
      setIsRefreshing(true);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for webhook processing
      await refetchSubscription();
      setIsRefreshing(false);
    };

    refreshSubscription();
  }, [refetchSubscription]);

  const handleGetStarted = () => {
    if (feature) {
      // Redirect to the specific feature they were trying to access
      router.push(`/employee#${feature.toLowerCase().replace(/\s+/g, '-')}`);
    } else {
      router.push('/employee');
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4'>
      <div className='max-w-4xl mx-auto'>
        {/* Success Header */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6'>
            <CheckCircle className='h-12 w-12 text-green-600' />
          </div>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>Welcome to Renavest! 🎉</h1>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
            Your subscription is now active and you have full access to all premium features.
          </p>
          {sessionId && <p className='text-sm text-gray-500 mt-2'>Session ID: {sessionId}</p>}
        </div>

        {/* Subscription Status */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-8'>
          <h2 className='text-2xl font-semibold text-gray-900 mb-4'>Your Subscription</h2>
          {loading || isRefreshing ? (
            <div className='flex items-center space-x-3'>
              <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600'></div>
              <span className='text-gray-600'>Syncing your subscription...</span>
            </div>
          ) : subscription ? (
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='text-gray-700'>Status</span>
                <span className='px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium capitalize'>
                  {subscription.status}
                </span>
              </div>
              {subscription.currentPeriodEnd && (
                <div className='flex items-center justify-between'>
                  <span className='text-gray-700'>Next billing</span>
                  <span className='text-gray-900 font-medium'>
                    {new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString()}
                  </span>
                </div>
              )}
              {subscription.cancelAtPeriodEnd && (
                <div className='p-3 bg-orange-50 border border-orange-200 rounded-lg'>
                  <p className='text-orange-800 text-sm'>
                    Your subscription will cancel at the end of the current period.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className='text-gray-600'>
              Still processing your subscription. Please wait a moment...
            </div>
          )}
        </div>

        {/* Feature Highlights */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-8'>
          <h2 className='text-2xl font-semibold text-gray-900 mb-6'>What's Now Available</h2>
          <div className='grid md:grid-cols-2 gap-6'>
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                className='border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow'
              >
                <div className='flex items-start space-x-4'>
                  <div className='flex-shrink-0'>
                    <feature.icon className='h-8 w-8 text-blue-600' />
                  </div>
                  <div className='flex-1'>
                    <h3 className='text-lg font-medium text-gray-900 mb-2'>{feature.title}</h3>
                    <p className='text-gray-600 mb-4'>{feature.description}</p>
                    {feature.action && (
                      <a
                        href={feature.action.href}
                        className='inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors'
                      >
                        {feature.action.label}
                        <ArrowRight className='h-4 w-4 ml-1' />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-8'>
          <h2 className='text-2xl font-semibold text-gray-900 mb-4'>Next Steps</h2>
          <div className='space-y-4'>
            <div className='flex items-start space-x-3'>
              <div className='flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center'>
                <span className='text-blue-600 font-semibold text-sm'>1</span>
              </div>
              <div>
                <h3 className='font-medium text-gray-900'>Complete Your Profile</h3>
                <p className='text-gray-600 text-sm'>
                  Add more details about your preferences to get better therapist matches.
                </p>
              </div>
            </div>
            <div className='flex items-start space-x-3'>
              <div className='flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center'>
                <span className='text-blue-600 font-semibold text-sm'>2</span>
              </div>
              <div>
                <h3 className='font-medium text-gray-900'>Browse Available Therapists</h3>
                <p className='text-gray-600 text-sm'>
                  Explore our network of licensed mental health professionals.
                </p>
              </div>
            </div>
            <div className='flex items-start space-x-3'>
              <div className='flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center'>
                <span className='text-blue-600 font-semibold text-sm'>3</span>
              </div>
              <div>
                <h3 className='font-medium text-gray-900'>Start Your First Conversation</h3>
                <p className='text-gray-600 text-sm'>
                  Send a message to begin your mental health journey.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className='text-center'>
          <button
            onClick={handleGetStarted}
            className='inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
          >
            Get Started Now
            <ArrowRight className='h-5 w-5 ml-2' />
          </button>
          <p className='text-gray-500 text-sm mt-4'>
            Need help?{' '}
            <a href='/employee/billing' className='text-blue-600 hover:text-blue-800'>
              Manage your subscription
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
