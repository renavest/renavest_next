'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ArrowLeft, CreditCard, Plus, Shield, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
  AddPaymentMethodForm,
  PaymentMethodCard,
  useBillingManagement,
} from '@/src/features/billing';
import {
  STRIPE_PUBLISHABLE_KEY,
  STRIPE_APPEARANCE,
} from '@/src/features/stripe/services/stripe-client-config';
import { COLORS } from '@/src/styles/colors';

// Initialize Stripe
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export default function BillingManagementPage() {
  const router = useRouter();
  const {
    paymentMethods,
    loading,
    addingNew,
    clientSecret,
    error,
    removing,
    handleAddPaymentMethod,
    handleRemovePaymentMethod,
    handleSetupSuccess,
    handleCancelAdd,
    setError,
  } = useBillingManagement();

  if (loading) {
    return (
      <div className={`min-h-screen ${COLORS.WARM_WHITE.bg} flex items-center justify-center`}>
        <div className='bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 border border-gray-100'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4'></div>
          <p className='text-center text-gray-600'>Loading billing information...</p>
        </div>
      </div>
    );
  }

  const stripeOptions = clientSecret
    ? {
        clientSecret,
        appearance: STRIPE_APPEARANCE,
      }
    : null;

  return (
    <div className={`min-h-screen ${COLORS.WARM_WHITE.bg} font-sans`}>
      <main className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24'>
        {/* Header */}
        <div className='mb-8'>
          <button
            onClick={() => router.back()}
            className='inline-flex items-center text-purple-600 hover:text-purple-700 mb-6 transition-colors font-medium'
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back
          </button>

          <div className='bg-purple-100 rounded-2xl p-6 md:p-8 shadow-sm border border-purple-200 mb-8'>
            <div className='flex items-center'>
              <div className='flex items-center justify-center h-16 w-16 rounded-full bg-white shadow-sm mr-6'>
                <CreditCard className='h-8 w-8 text-purple-600' />
              </div>
              <div>
                <h1 className='text-3xl md:text-4xl font-bold text-black mb-2'>
                  Billing Management
                </h1>
                <p className='text-gray-600 text-base md:text-lg max-w-2xl'>
                  Manage your saved payment methods for therapy sessions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 hover:shadow-md transition-shadow duration-300'>
          <div className='flex items-start'>
            <div className='bg-blue-100 p-2 rounded-lg mr-4'>
              <Shield className='w-5 h-5 text-blue-600' />
            </div>
            <div>
              <h3 className='text-base font-semibold text-gray-800 mb-2'>
                Secure Payment Processing
              </h3>
              <p className='text-gray-600'>
                Your payment information is encrypted and securely processed by Stripe. We never
                store your card details on our servers.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Methods Section */}
        <PaymentMethodsSection
          paymentMethods={paymentMethods}
          addingNew={addingNew}
          error={error}
          removing={removing}
          stripeOptions={stripeOptions}
          onAddPaymentMethod={handleAddPaymentMethod}
          onRemovePaymentMethod={handleRemovePaymentMethod}
          onSetupSuccess={handleSetupSuccess}
          onCancelAdd={handleCancelAdd}
          onSetError={setError}
        />

        {/* Benefits Section */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 hover:shadow-md transition-shadow duration-300'>
          <h3 className='text-xl font-semibold text-gray-800 mb-6 text-center'>
            Why manage billing information?
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='bg-gray-50 rounded-lg p-6 border border-gray-100'>
              <div className='font-semibold text-gray-800 mb-2 flex items-center'>
                <div className='bg-green-100 p-2 rounded-lg mr-3'>
                  <svg className='w-5 h-5 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                Instant Booking
              </div>
              <p className='text-gray-600'>
                Book sessions immediately without waiting for external payment processing
              </p>
            </div>
            <div className='bg-gray-50 rounded-lg p-6 border border-gray-100'>
              <div className='font-semibold text-gray-800 mb-2 flex items-center'>
                <div className='bg-purple-100 p-2 rounded-lg mr-3'>
                  <Shield className='w-5 h-5 text-purple-600' />
                </div>
                Secure & Reliable
              </div>
              <p className='text-gray-600'>
                All payment information is secured with bank-level encryption via Stripe
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Payment Methods Section Component
interface PaymentMethodsSectionProps {
  paymentMethods: Array<{
    id: string;
    type: string;
    card: {
      brand: string;
      last4: string;
      exp_month: number;
      exp_year: number;
      funding: string;
    } | null;
    created: number;
  }>;
  addingNew: boolean;
  error: string | null;
  removing: string | null;
  stripeOptions: {
    clientSecret: string;
    appearance: typeof STRIPE_APPEARANCE;
  } | null;
  onAddPaymentMethod: () => void;
  onRemovePaymentMethod: (id: string) => void;
  onSetupSuccess: () => void;
  onCancelAdd: () => void;
  onSetError: (error: string) => void;
}

function PaymentMethodsSection({
  paymentMethods,
  addingNew,
  error,
  removing,
  stripeOptions,
  onAddPaymentMethod,
  onRemovePaymentMethod,
  onSetupSuccess,
  onCancelAdd,
  onSetError,
}: PaymentMethodsSectionProps) {
  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8 hover:shadow-md transition-shadow duration-300'>
      <div className='p-6 border-b border-gray-100'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-gray-800 flex items-center'>
            <div className='bg-purple-100 p-2 rounded-lg mr-3'>
              <CreditCard className='w-5 h-5 text-purple-600' />
            </div>
            Saved Payment Methods
          </h2>
          {!addingNew && (
            <button
              onClick={onAddPaymentMethod}
              className='inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
            >
              <Plus className='w-4 h-4 mr-2' />
              Add Payment Method
            </button>
          )}
        </div>
      </div>

      <div className='p-6'>
        {error && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
            <div className='flex items-start'>
              <div className='bg-red-100 p-2 rounded-lg mr-3'>
                <AlertTriangle className='w-5 h-5 text-red-600' />
              </div>
              <div>
                <h3 className='text-sm font-medium text-red-800 mb-1'>Error</h3>
                <p className='text-sm text-red-700'>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Add New Payment Method Form */}
        {addingNew && stripeOptions && (
          <div className='bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-800'>Add New Payment Method</h3>
              <button
                onClick={onCancelAdd}
                className='text-gray-500 hover:text-gray-700 transition-colors font-medium'
              >
                Cancel
              </button>
            </div>

            <Elements stripe={stripePromise} options={stripeOptions}>
              <AddPaymentMethodForm onSuccess={onSetupSuccess} onError={onSetError} />
            </Elements>
          </div>
        )}

        {/* Payment Methods List */}
        {paymentMethods.length === 0 ? (
          <div className='text-center py-12'>
            <div className='bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4'>
              <CreditCard className='w-8 h-8 text-gray-400' />
            </div>
            <h3 className='text-lg font-semibold text-gray-800 mb-2'>No payment methods</h3>
            <p className='text-gray-600 mb-6 max-w-md mx-auto'>
              Add a payment method to book therapy sessions directly through our platform.
            </p>
            {!addingNew && (
              <button
                onClick={onAddPaymentMethod}
                className='inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-base font-medium rounded-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
              >
                <Plus className='w-5 h-5 mr-2' />
                Add Your First Payment Method
              </button>
            )}
          </div>
        ) : (
          <div className='space-y-4'>
            {paymentMethods.map((paymentMethod) => (
              <PaymentMethodCard
                key={paymentMethod.id}
                paymentMethod={paymentMethod}
                onRemove={onRemovePaymentMethod}
                isRemoving={removing === paymentMethod.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
