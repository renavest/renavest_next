'use client';
import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  const router = useRouter();
  let redirectPath = '/';
  if (localStorage.getItem('role_from_oauth')) {
    redirectPath = redirectPath + localStorage.getItem('role_from_oauth');
  }
  useEffect(() => {
    let isMounted = true;

    const getRedirectPath = (role: string | null) => {
      switch (role) {
        case 'employee':
          return '/employee';
        case 'therapist':
          return '/therapist';
        case 'employer':
          return '/employer';
        default:
          return '/';
      }
    };

    const pollUserReady = async () => {
      try {
        const res = await fetch('/api/user-ready');
        if (!res.ok) return;
        const data = await res.json();
        if (data.ready && isMounted) {
          const role = localStorage.getItem('role_from_oauth');
          router.replace(getRedirectPath(role));
        }
      } catch {
        // Ignore errors, will retry
      }
    };

    const interval = setInterval(pollUserReady, 1500);
    pollUserReady(); // Run immediately as well

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [router]);

  // Render a loading indicator or placeholder
  return (
    <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24 bg-[#faf9f6] min-h-screen flex items-center justify-center'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-purple-600 mx-auto mb-4'></div>
        <AuthenticateWithRedirectCallback
          signUpForceRedirectUrl={redirectPath}
          signInForceRedirectUrl={redirectPath}
        />
        <p>Setting up your account...</p>
      </div>
    </div>
  );
}
