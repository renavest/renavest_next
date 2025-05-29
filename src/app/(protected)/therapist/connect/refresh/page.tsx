'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function StripeConnectRefreshPage() {
  const router = useRouter();

  useEffect(() => {
    // Show message and redirect back to integrations
    toast.info('Please complete your bank account setup to receive payments.');

    // Redirect back to integrations page after a short delay
    const timeout = setTimeout(() => {
      router.push('/therapist/integrations?tab=stripe');
    }, 2000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className='min-h-screen bg-[#faf9f6] flex items-center justify-center'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-purple-600 mx-auto mb-4'></div>
        <h1 className='text-xl font-semibold text-gray-800 mb-2'>Bank Account Setup Required</h1>
        <p className='text-gray-600 mb-4'>
          Redirecting you back to complete your bank account setup...
        </p>
      </div>
    </div>
  );
}
