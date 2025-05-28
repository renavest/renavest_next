import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { CreditCard, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { PAYMENT_ELEMENT_OPTIONS } from '@/src/features/stripe/services/stripe-client-config';

interface AddPaymentMethodFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function AddPaymentMethodForm({ onSuccess, onError }: AddPaymentMethodFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    onError('');

    try {
      // Confirm the SetupIntent with the payment method
      const { error: confirmError } = await stripe.confirmSetup({
        elements,
        redirect: 'if_required',
      });

      if (confirmError) {
        console.error('Setup confirmation error:', confirmError);

        // Handle specific error types for better UX
        let errorMessage = 'Failed to save payment method';
        if (confirmError.type === 'card_error') {
          errorMessage = confirmError.message || 'Your card was declined';
        } else if (confirmError.type === 'validation_error') {
          errorMessage = 'Please check your payment information';
        }

        onError(errorMessage);
      } else {
        // Success! The payment method has been saved
        onSuccess();
      }
    } catch (err) {
      console.error('Unexpected error during setup:', err);
      onError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div className='p-4 border border-gray-200 rounded-lg bg-white shadow-sm'>
        <PaymentElement options={PAYMENT_ELEMENT_OPTIONS} />
      </div>

      <div className='flex space-x-4'>
        <button
          type='submit'
          disabled={!stripe || !elements || isLoading}
          className={`flex-1 inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
            !stripe || !elements || isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              Saving...
            </>
          ) : (
            <>
              <CreditCard className='w-4 h-4 mr-2' />
              Save Payment Method
            </>
          )}
        </button>
      </div>
    </form>
  );
}
