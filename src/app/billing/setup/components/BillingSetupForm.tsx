'use client';

import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { CreditCard, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { COLORS } from '@/src/styles/colors';

interface BillingSetupFormProps {
  onSuccess: () => void;
}

export default function BillingSetupForm({ onSuccess }: BillingSetupFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Confirm the SetupIntent with the payment method
      const { error: confirmError } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/billing/setup/success`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        console.error('Setup confirmation error:', confirmError);
        setError(confirmError.message || 'Failed to save payment method');
        toast.error(confirmError.message || 'Failed to save payment method');
      } else {
        // Success! The payment method has been saved
        toast.success('Payment method saved successfully!');
        onSuccess();
      }
    } catch (err) {
      console.error('Unexpected error during setup:', err);
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div>
        <div className='flex items-center mb-4'>
          <CreditCard className='w-5 h-5 text-gray-600 mr-2' />
          <h3 className='text-lg font-semibold text-gray-900'>Payment Information</h3>
        </div>

        <div className='p-4 border border-gray-200 rounded-lg bg-gray-50'>
          <PaymentElement
            options={{
              layout: 'tabs',
              paymentMethodOrder: ['card'],
            }}
          />
        </div>
      </div>

      {error && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <div className='flex'>
            <div className='ml-3'>
              <h3 className='text-sm font-medium text-red-800'>Payment Setup Error</h3>
              <div className='mt-2 text-sm text-red-700'>
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className='flex flex-col space-y-4'>
        <button
          type='submit'
          disabled={!stripe || !elements || isLoading}
          className={`w-full inline-flex items-center justify-center px-6 py-3 border-0 text-base font-semibold rounded-full shadow-lg transition-all duration-200 ${
            !stripe || !elements || isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : `${COLORS.WARM_PURPLE.bg} ${COLORS.WARM_WHITE.DEFAULT} ${COLORS.WARM_PURPLE.hover} ${COLORS.WARM_PURPLE.focus}`
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              Saving Payment Method...
            </>
          ) : (
            <>
              <CreditCard className='w-4 h-4 mr-2' />
              Save Payment Method
            </>
          )}
        </button>

        <div className='text-center'>
          <p className='text-sm text-gray-500'>
            Your payment method will be securely saved for future bookings.
            <br />
            You won't be charged until you book a session.
          </p>
        </div>
      </div>
    </form>
  );
}
