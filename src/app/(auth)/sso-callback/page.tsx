'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

import { COLORS } from '@/src/styles/colors';

export default function Page() {
  useEffect(() => {
    // Determine redirect path based on role
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

    // Perform redirect if possible
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('role_from_oauth');
      const redirectPath = getRedirectPath(role);
      redirect(redirectPath);
    }
  }, []);

  // Render a loading indicator or placeholder
  return (
    <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24 bg-[#faf9f6] min-h-screen flex items-center justify-center'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-purple-600 mx-auto mb-4'></div>
        <p className={`${COLORS.WARM_PURPLE.DEFAULT} text-lg`}>Loading...</p>
      </div>
    </div>
  );
}
