'use client';

import { useState } from 'react';

interface ResetState {
  userId?: number;
  userDbFields?: {
    subscriptionStatus: string | null;
    stripeSubscriptionId: string | null;
    subscriptionEndDate: string | null;
    cancelAtPeriodEnd: boolean;
  };
  hasStripeCustomer?: boolean;
  stripeInfo?: {
    customerId: string;
    subscriptionCount: number;
    subscriptions: Array<{
      id: string;
      status: string;
      priceId: string;
      created: string;
    }>;
  } | null;
}

interface ResetResults {
  success: boolean;
  message: string;
  results: {
    userId: number;
    steps: string[];
    errors: string[];
  };
  nextSteps: string[];
}

export default function StripeResetDevPage() {
  const [currentState, setCurrentState] = useState<ResetState | null>(null);
  const [resetResults, setResetResults] = useState<ResetResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  const checkCurrentState = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/dev/reset-stripe', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setCurrentState(data);
      setResetResults(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check state');
    } finally {
      setLoading(false);
    }
  };

  const performReset = async () => {
    if (
      !confirm(
        'Are you sure you want to reset the Stripe integration? This will cancel all subscriptions and clear all data.',
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/dev/reset-stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmReset: true }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResetResults(data);
      setCurrentState(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6'>
        <h1 className='text-2xl font-bold text-yellow-800 mb-2'>
          🚧 Development Stripe Reset Tool
        </h1>
        <p className='text-yellow-700'>
          This tool allows you to reset your Stripe integration for testing purposes.
          <strong> Only available in development mode.</strong>
        </p>
      </div>

      {error && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
          <h3 className='text-red-800 font-medium'>Error</h3>
          <p className='text-red-700'>{error}</p>
        </div>
      )}

      <div className='grid gap-6'>
        {/* Action Buttons */}
        <div className='flex gap-4'>
          <button
            onClick={checkCurrentState}
            disabled={loading}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? 'Loading...' : 'Check Current State'}
          </button>

          <button
            onClick={performReset}
            disabled={loading}
            className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? 'Resetting...' : 'Reset Stripe Integration'}
          </button>
        </div>

        {/* Current State Display */}
        {currentState && (
          <div className='bg-white border rounded-lg p-6'>
            <h2 className='text-xl font-semibold mb-4'>Current Stripe State</h2>

            <div className='space-y-4'>
              <div>
                <h3 className='font-medium text-gray-900'>User Info</h3>
                <p className='text-sm text-gray-600'>User ID: {currentState.userId}</p>
                <p className='text-sm text-gray-600'>
                  Has Stripe Customer: {currentState.hasStripeCustomer ? '✅ Yes' : '❌ No'}
                </p>
              </div>

              {currentState.userDbFields && (
                <div>
                  <h3 className='font-medium text-gray-900'>Database Fields</h3>
                  <div className='text-sm text-gray-600 space-y-1'>
                    <p>
                      Subscription Status: {currentState.userDbFields.subscriptionStatus || 'None'}
                    </p>
                    <p>
                      Stripe Subscription ID:{' '}
                      {currentState.userDbFields.stripeSubscriptionId || 'None'}
                    </p>
                    <p>End Date: {currentState.userDbFields.subscriptionEndDate || 'None'}</p>
                    <p>
                      Cancel at Period End:{' '}
                      {currentState.userDbFields.cancelAtPeriodEnd ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              )}

              {currentState.stripeInfo && (
                <div>
                  <h3 className='font-medium text-gray-900'>Stripe Customer Info</h3>
                  <p className='text-sm text-gray-600'>
                    Customer ID: {currentState.stripeInfo.customerId}
                  </p>
                  <p className='text-sm text-gray-600'>
                    Subscription Count: {currentState.stripeInfo.subscriptionCount}
                  </p>

                  {currentState.stripeInfo.subscriptions &&
                    currentState.stripeInfo.subscriptions.length > 0 && (
                      <div className='mt-2'>
                        <h4 className='font-medium text-gray-800'>Active Subscriptions:</h4>
                        <div className='space-y-1'>
                          {currentState.stripeInfo.subscriptions.map((sub, idx) => (
                            <div key={idx} className='text-sm text-gray-600 bg-gray-50 p-2 rounded'>
                              <p>ID: {sub.id}</p>
                              <p>Status: {sub.status}</p>
                              <p>Price ID: {sub.priceId}</p>
                              <p>Created: {new Date(sub.created).toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reset Results Display */}
        {resetResults && (
          <div className='bg-green-50 border border-green-200 rounded-lg p-6'>
            <h2 className='text-xl font-semibold text-green-800 mb-4'>Reset Completed ✅</h2>

            <div className='space-y-4'>
              <p className='text-green-700'>{resetResults.message}</p>

              <div>
                <h3 className='font-medium text-green-800'>Steps Completed:</h3>
                <ul className='list-disc list-inside text-sm text-green-700 space-y-1'>
                  {resetResults.results.steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>

              {resetResults.results.errors.length > 0 && (
                <div>
                  <h3 className='font-medium text-red-800'>Errors:</h3>
                  <ul className='list-disc list-inside text-sm text-red-700 space-y-1'>
                    {resetResults.results.errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h3 className='font-medium text-green-800'>Next Steps:</h3>
                <ul className='list-disc list-inside text-sm text-green-700 space-y-1'>
                  {resetResults.nextSteps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
          <h2 className='text-lg font-semibold text-blue-800 mb-2'>How to Use</h2>
          <ol className='list-decimal list-inside text-sm text-blue-700 space-y-2'>
            <li>
              <strong>Check Current State</strong> - See what Stripe data exists for your user
            </li>
            <li>
              <strong>Reset Integration</strong> - Cancel subscriptions and clear all data
            </li>
            <li>
              <strong>Test Subscription Flow</strong> - Go to <code>/employee/billing</code> to test
            </li>
            <li>
              <strong>Verify Webhooks</strong> - Complete a subscription and check that syncing
              works
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
