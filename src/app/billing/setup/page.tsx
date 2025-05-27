'use client';

import { useUser } from '@clerk/nextjs';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ArrowLeft, CreditCard, Shield } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  STRIPE_PUBLISHABLE_KEY,
  STRIPE_APPEARANCE,
} from '@/src/features/stripe/services/stripe-client-config';
import { COLORS } from '@/src/styles/colors';

import BillingSetupForm from './components/BillingSetupForm';

// Initialize Stripe
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export default function BillingSetupPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get redirect URL from query params
  const redirectTo = searchParams?.get('redirect') || '/explore';
  const therapistId = searchParams?.get('therapistId');

  useEffect(() => {
    // Wait for Clerk to finish loading before checking user status
    if (!isLoaded) {
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    const createSetupIntent = async () => {
      try {
        const response = await fetch('/api/stripe/setup-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create setup intent');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error('Error creating setup intent:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize billing setup');
        toast.error('Failed to initialize billing setup');
      } finally {
        setLoading(false);
      }
    };

    createSetupIntent();
  }, [user, isLoaded, router]);

  const handleSuccess = () => {
    toast.success('Payment method added successfully!');

    // Redirect to the original destination or explore page
    if (therapistId) {
      router.push(`/book/${therapistId}`);
    } else {
      router.push(redirectTo);
    }
  };

  const handleBack = () => {
    if (therapistId) {
      router.push(`/explore`);
    } else {
      router.push(redirectTo);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-purple-50 to-green-50 flex items-center justify-center'>
        <div className='bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4'></div>
          <p className='text-center text-gray-600'>Setting up billing...</p>
        </div>
      </div>
    );
  }

  if (error || !clientSecret) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-purple-50 to-green-50 flex items-center justify-center'>
        <div className='bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4'>
          <div className='text-center'>
            <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4'>
              <CreditCard className='h-6 w-6 text-red-600' />
            </div>
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>Setup Error</h2>
            <p className='text-gray-600 mb-6'>{error || 'Failed to initialize billing setup'}</p>
            <button
              onClick={handleBack}
              className={`inline-flex items-center px-6 py-3 border-0 text-base font-medium rounded-full shadow-lg transition-all duration-200 ${COLORS.WARM_PURPLE.bg} ${COLORS.WARM_WHITE.DEFAULT} ${COLORS.WARM_PURPLE.hover} ${COLORS.WARM_PURPLE.focus}`}
            >
              <ArrowLeft className='w-4 h-4 mr-2' />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stripeOptions = {
    clientSecret,
    appearance: STRIPE_APPEARANCE,
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 to-green-50 py-8 px-4'>
      <div className='max-w-2xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-8'>
          <button
            onClick={handleBack}
            className='inline-flex items-center text-purple-600 hover:text-purple-700 mb-6 transition-colors'
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back to Explore
          </button>

          <div className='mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mb-6'>
            <CreditCard className='h-8 w-8 text-purple-600' />
          </div>

          <h1 className='text-3xl font-bold text-gray-900 mb-4'>Set Up Billing Information</h1>
          <p className='text-lg text-gray-600 max-w-md mx-auto'>
            Add a payment method to book therapy sessions directly through our platform.
          </p>
        </div>

        {/* Security Notice */}
        <div className='bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8'>
          <div className='flex items-start'>
            <Shield className='w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0' />
            <div>
              <h3 className='text-sm font-medium text-blue-900 mb-1'>Secure Payment Processing</h3>
              <p className='text-sm text-blue-700'>
                Your payment information is encrypted and securely processed by Stripe. We never
                store your card details on our servers.
              </p>
            </div>
          </div>
        </div>

        {/* Billing Form */}
        <div className='bg-white rounded-2xl shadow-xl overflow-hidden'>
          <div className='p-8'>
            <Elements stripe={stripePromise} options={stripeOptions}>
              <BillingSetupForm onSuccess={handleSuccess} />
            </Elements>
          </div>
        </div>

        {/* Benefits */}
        <div className='mt-8 text-center'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Why add billing information?</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600'>
            <div className='bg-white rounded-lg p-4 shadow-sm'>
              <div className='font-medium text-gray-900 mb-1'>Instant Booking</div>
              <div>Book sessions immediately without waiting for external calendar links</div>
            </div>
            <div className='bg-white rounded-lg p-4 shadow-sm'>
              <div className='font-medium text-gray-900 mb-1'>Seamless Experience</div>
              <div>Integrated scheduling with automatic calendar invites and reminders</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
