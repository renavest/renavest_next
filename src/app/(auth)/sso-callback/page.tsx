'use client';
import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // After SSO authentication, redirect to auth-check to wait for webhook processing
    // This ensures the user's role and onboarding status are properly set before final redirect
    const timer = setTimeout(() => {
      router.replace('/auth-check');
    }, 2000); // Give Clerk a moment to process the authentication

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24 bg-[#faf9f6] min-h-screen flex items-center justify-center'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-purple-600 mx-auto mb-4'></div>
        <AuthenticateWithRedirectCallback
          signUpForceRedirectUrl='/auth-check'
          signInForceRedirectUrl='/auth-check'
        />
        <p>Setting up your account...</p>
      </div>
    </div>
  );
}
