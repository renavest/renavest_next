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
      <div className='min-h-screen bg-gradient-to-br from-purple-50 to-green-50 flex items-center justify-center'>
        <div className='bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4'>
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
    <div className='min-h-screen bg-gradient-to-br from-purple-50 to-green-50 py-8 px-4'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <button
            onClick={() => router.back()}
            className='inline-flex items-center text-purple-600 hover:text-purple-700 mb-6 transition-colors'
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back
          </button>

          <div className='flex items-center mb-6'>
            <div className='mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mr-6'>
              <CreditCard className='h-8 w-8 text-purple-600' />
            </div>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>Billing Management</h1>
              <p className='text-lg text-gray-600'>
                Manage your saved payment methods for therapy sessions
              </p>
            </div>
          </div>
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

        {/* Benefits */}
        <div className='text-center'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Why manage billing information?
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600'>
            <div className='bg-white rounded-lg p-4 shadow-sm'>
              <div className='font-medium text-gray-900 mb-1'>Instant Booking</div>
              <div>Book sessions immediately without waiting for external payment processing</div>
            </div>
            <div className='bg-white rounded-lg p-4 shadow-sm'>
              <div className='font-medium text-gray-900 mb-1'>Secure & Reliable</div>
              <div>All payment information is secured with bank-level encryption via Stripe</div>
            </div>
          </div>
        </div>
      </div>
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
    <div className='bg-white rounded-2xl shadow-xl overflow-hidden mb-8'>
      <div className='p-6 border-b border-gray-200'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-gray-900'>Saved Payment Methods</h2>
          {!addingNew && (
            <button
              onClick={onAddPaymentMethod}
              className={`inline-flex items-center px-4 py-2 border-0 text-sm font-medium rounded-lg shadow-sm transition-all duration-200 ${COLORS.WARM_PURPLE.bg} ${COLORS.WARM_WHITE.DEFAULT} ${COLORS.WARM_PURPLE.hover} ${COLORS.WARM_PURPLE.focus}`}
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
              <AlertTriangle className='w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0' />
              <div>
                <h3 className='text-sm font-medium text-red-800'>Error</h3>
                <div className='mt-1 text-sm text-red-700'>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add New Payment Method Form */}
        {addingNew && stripeOptions && (
          <div className='border border-gray-200 rounded-lg p-6 mb-6 bg-gray-50'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900'>Add New Payment Method</h3>
              <button
                onClick={onCancelAdd}
                className='text-gray-500 hover:text-gray-700 transition-colors'
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
            <CreditCard className='w-12 h-12 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>No payment methods</h3>
            <p className='text-gray-600 mb-6'>
              Add a payment method to book therapy sessions directly through our platform.
            </p>
            {!addingNew && (
              <button
                onClick={onAddPaymentMethod}
                className={`inline-flex items-center px-6 py-3 border-0 text-base font-medium rounded-lg shadow-lg transition-all duration-200 ${COLORS.WARM_PURPLE.bg} ${COLORS.WARM_WHITE.DEFAULT} ${COLORS.WARM_PURPLE.hover} ${COLORS.WARM_PURPLE.focus}`}
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
