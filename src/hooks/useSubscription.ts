import { useUser } from '@clerk/nextjs';
import { useEffect, useState, useCallback } from 'react';

import type { SubscriptionInfo } from '@/src/features/stripe/types';

type SubscriptionStatus = SubscriptionInfo;

interface SubscriptionHookReturn {
  subscription: SubscriptionStatus | null;
  loading: boolean;
  error: string | null;
  hasActiveSubscription: boolean;
  hasStarterSubscription: boolean;
  refetchSubscription: () => Promise<void>;
}

/**
 * Custom hook for managing subscription status
 * This hook checks if a user has an active subscription and provides
 * subscription details for gating features like chat
 */
export function useSubscription(): SubscriptionHookReturn {
  const { user, isLoaded: userLoaded } = useUser();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!userLoaded || !user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await fetch('/api/stripe/subscriptions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSubscription(data);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [userLoaded, user?.id]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Helper computed properties
  const hasActiveSubscription = Boolean(
    subscription?.status && ['active', 'trialing'].includes(subscription.status),
  );

  const hasStarterSubscription = Boolean(
    hasActiveSubscription &&
      subscription?.priceId === process.env.NEXT_PUBLIC_STRIPE_SUBSCRIPTION_PRICE_ID_STARTER,
  );

  return {
    subscription,
    loading,
    error,
    hasActiveSubscription,
    hasStarterSubscription,
    refetchSubscription: fetchSubscription,
  };
}
