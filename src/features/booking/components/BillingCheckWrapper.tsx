'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { ALLOWED_EMAILS } from '@/src/constants';

interface BillingCheckWrapperProps {
  children: React.ReactNode;
  advisorId: string;
  shouldCheckBilling: boolean; // Only check for direct bookings, not external
  userEmail?: string; // Optional prop to double-check staff status
}

export default function BillingCheckWrapper({
  children,
  advisorId,
  shouldCheckBilling,
  userEmail,
}: BillingCheckWrapperProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(shouldCheckBilling);
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);

  useEffect(() => {
    // Safety check: if user is staff, never check billing regardless of shouldCheckBilling
    const isStaffUser = userEmail && ALLOWED_EMAILS.includes(userEmail);

    if (!shouldCheckBilling || isStaffUser) {
      setIsChecking(false);
      setHasPaymentMethod(true); // Allow staff to proceed
      if (isStaffUser) {
        console.log('Staff user detected, bypassing billing check:', userEmail);
      }
      return;
    }

    const checkBillingSetup = async () => {
      try {
        const response = await fetch('/api/stripe/billing-setup-check');

        if (!response.ok) {
          throw new Error('Failed to check billing setup');
        }

        const data = await response.json();

        if (!data.hasPaymentMethod) {
          // Redirect to billing setup with therapist ID
          toast.info('Please add a payment method to book sessions directly');
          router.push(`/billing/setup?therapistId=${advisorId}&redirect=/book/${advisorId}`);
          return;
        }

        setHasPaymentMethod(true);
      } catch (error) {
        console.error('Error checking billing setup:', error);
        toast.error('Unable to verify billing information');
        // Allow booking to continue in case of error
        setHasPaymentMethod(true);
      } finally {
        setIsChecking(false);
      }
    };

    checkBillingSetup();
  }, [shouldCheckBilling, advisorId, router, userEmail]);

  if (isChecking) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-purple-50 to-green-50 flex items-center justify-center'>
        <div className='bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4'></div>
          <p className='text-center text-gray-600'>Checking billing information...</p>
        </div>
      </div>
    );
  }

  if (shouldCheckBilling && !hasPaymentMethod) {
    // This shouldn't happen as we redirect above, but just in case
    return null;
  }

  return <>{children}</>;
}
