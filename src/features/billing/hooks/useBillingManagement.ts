import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { PaymentMethodsService } from '../services/payment-methods';
import type { PaymentMethod, BillingManagementHook } from '../types';

/**
 * useBillingManagement Hook
 *
 * Custom hook for managing payment methods in the billing feature.
 * Handles loading, adding, and removing payment methods with proper error handling.
 *
 * @returns Object containing payment methods state and management functions
 */
export function useBillingManagement(): BillingManagementHook {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingNew, setAddingNew] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push('/login');
      return;
    }

    fetchPaymentMethods();
  }, [user, isLoaded, router]);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const data = await PaymentMethodsService.fetchPaymentMethods();
      setPaymentMethods(data.paymentMethods);
    } catch (err) {
      console.error('Error fetching payment methods:', err);
      setError(err instanceof Error ? err.message : 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    try {
      setAddingNew(true);
      setError(null);

      const data = await PaymentMethodsService.createSetupIntent();
      setClientSecret(data.clientSecret);
    } catch (err) {
      console.error('Error creating setup intent:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize payment method setup');
      toast.error('Failed to start payment method setup');
      setAddingNew(false);
    }
  };

  const handleRemovePaymentMethod = async (paymentMethodId: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) {
      return;
    }

    try {
      setRemoving(paymentMethodId);
      await PaymentMethodsService.removePaymentMethod(paymentMethodId);
      setPaymentMethods((prev) => prev.filter((pm) => pm.id !== paymentMethodId));
      toast.success('Payment method removed successfully');
    } catch (err) {
      console.error('Error removing payment method:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to remove payment method');
    } finally {
      setRemoving(null);
    }
  };

  const handleSetupSuccess = () => {
    setAddingNew(false);
    setClientSecret(null);
    toast.success('Payment method added successfully!');
    fetchPaymentMethods();
  };

  const handleCancelAdd = () => {
    setAddingNew(false);
    setClientSecret(null);
  };

  return {
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
  };
}
