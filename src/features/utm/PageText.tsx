'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

import { processUtmParameters } from './utmCustomDemo';

interface PageUtmHandlerProps {
  children: React.ReactNode;
}

/**
 * Component that handles UTM parameter processing and site customization
 * Place this at the root of your application or on individual pages that need UTM customization
 */
export default function PageUtmHandler({ children }: PageUtmHandlerProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
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
      // Process and apply all UTM parameters
      processUtmParameters(searchParams);
    }
  }, [searchParams]);

  return <>{children}</>;
}

/**
 * HOC to wrap any component with UTM parameter handling
 */
export function withUtmCustomization<P extends object>(Component: React.ComponentType<P>) {
  return function WithUtmCustomization(props: P) {
    return (
      <PageUtmHandler>
        <Component {...props} />
      </PageUtmHandler>
    );
  };
}
