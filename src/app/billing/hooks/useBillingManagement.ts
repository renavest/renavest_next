import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PaymentMethod {
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
}

interface PaymentMethodsResponse {
  paymentMethods: PaymentMethod[];
  stripeCustomerId: string | null;
}

export function useBillingManagement() {
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
      const response = await fetch('/api/stripe/payment-methods');

      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }

      const data: PaymentMethodsResponse = await response.json();
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

      const response = await fetch('/api/stripe/payment-methods', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethodId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove payment method');
      }

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
