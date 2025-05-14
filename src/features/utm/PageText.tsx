'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

import { COLORS } from '@/src/styles/colors';

import { processUtmParameters, clearAllCompanyLocalStorage } from './utmCustomDemo';
interface PageUtmHandlerProps {
  children: React.ReactNode;
}

/**
 * Component that handles UTM parameter processing and site customization
 * Place this at the root of your application or on individual pages that need UTM customization
 */
export default function PageUtmHandler({ children }: PageUtmHandlerProps) {
  return (
    <Suspense
      fallback={
        <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24 bg-[#faf9f6] min-h-screen flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-purple-600 mx-auto mb-4'></div>
            <p className={`${COLORS.WARM_PURPLE.DEFAULT} text-lg`}>Loading...</p>
          </div>
        </div>
      }
    >
      <UtmParameterProcessor>{children}</UtmParameterProcessor>
    </Suspense>
  );
}

/**
 * Inner component that uses the useSearchParams hook within a Suspense boundary
 */
function UtmParameterProcessor({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // If ?reset is present, clear all relevant localStorage and reload without ?reset
      if (searchParams.get('reset') !== null) {
        clearAllCompanyLocalStorage();
        // Remove ?reset from the URL and reload
        const url = new URL(window.location.href);
        url.searchParams.delete('reset');
        window.location.replace(url.toString());
        return;
      }
      // Process and apply all UTM parameters
      processUtmParameters(searchParams);
    }
  }, [searchParams]);

  return <>{children}</>;
}
