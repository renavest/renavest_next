'use client';

import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function StripeConnectReturnPage() {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Verify the connection status and then redirect
    const verifyConnection = async () => {
      try {
        // Give Stripe a moment to process the account setup
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Fetch the latest connection status
        const response = await fetch('/api/stripe/connect/status');
        const data = await response.json();

        if (data.connected) {
          if (data.payoutsEnabled) {
            toast.success('Bank account connected successfully! You can now receive payments.');
          } else if (data.requiresAction) {
            toast.warning('Bank account connected, but additional information is required.');
          } else {
            toast.info('Bank account connected. Setup is being processed.');
          }
        } else {
          toast.error('Bank account connection could not be verified.');
        }
      } catch (error) {
        console.error('Error verifying connection:', error);
        toast.error('Unable to verify bank account connection.');
      } finally {
        setIsVerifying(false);
        // Redirect to integrations page
        setTimeout(() => {
          router.push('/therapist/integrations?tab=stripe');
        }, 3000);
      }
    };

    verifyConnection();
  }, [router]);

  return (
    <div className='min-h-screen bg-[#faf9f6] flex items-center justify-center'>
      <div className='text-center max-w-md mx-auto'>
        {isVerifying ? (
          <>
            <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-purple-600 mx-auto mb-4'></div>
            <h1 className='text-xl font-semibold text-gray-800 mb-2'>
              Verifying Bank Account Connection
            </h1>
            <p className='text-gray-600'>Please wait while we confirm your bank account setup...</p>
          </>
        ) : (
          <>
            <CheckCircle className='h-16 w-16 text-green-500 mx-auto mb-4' />
            <h1 className='text-xl font-semibold text-gray-800 mb-2'>Setup Complete</h1>
            <p className='text-gray-600 mb-4'>Redirecting you back to your integrations page...</p>
          </>
        )}
      </div>
    </div>
  );
}
