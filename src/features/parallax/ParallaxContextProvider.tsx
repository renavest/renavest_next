import { ReactNode, useEffect, useState } from 'react';
import { ParallaxProvider } from 'react-scroll-parallax';

interface ParallaxContextProviderProps {
  children: ReactNode;
}

export function ParallaxContextProvider({ children }: ParallaxContextProviderProps) {
  const [mounted, setMounted] = useState(false);

  // Only render the provider on the client side to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return children without the provider during SSR and initial render
    return <>{children}</>;
  }

  // Once mounted on client, wrap with ParallaxProvider
  return <ParallaxProvider>{children}</ParallaxProvider>;
}
