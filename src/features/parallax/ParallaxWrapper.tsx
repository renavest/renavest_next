import { ReactNode, useEffect, useState } from 'react';

import { useUpdateControllerOnRouteChange } from '@/src/features/parallax/hooks/useParallaxRoute';

interface ParallaxWrapperProps {
  children: ReactNode;
}

export default function ParallaxWrapper({ children }: ParallaxWrapperProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Use the hook to update controller on route changes
  useUpdateControllerOnRouteChange();

  useEffect(() => {
    // Check if window width is >= 1024px (lg breakpoint in Tailwind)
    const checkIfDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    // Check if user prefers reduced motion
    const checkReducedMotion = () => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      // Add listener for changes
      mediaQuery.addEventListener('change', (e) => {
        setPrefersReducedMotion(e.matches);
      });
    };

    // Check on initial load
    checkIfDesktop();
    checkReducedMotion();

    // Set up event listener for window resize
    window.addEventListener('resize', checkIfDesktop);

    // Clean up
    return () => window.removeEventListener('resize', checkIfDesktop);
  }, []);

  // Only apply parallax effects on desktop and if the user doesn't prefer reduced motion
  if (!isDesktop || prefersReducedMotion) {
    return <>{children}</>;
  }

  // The ParallaxProvider is now at the root level, so we just return the children directly
  return <>{children}</>;
}
