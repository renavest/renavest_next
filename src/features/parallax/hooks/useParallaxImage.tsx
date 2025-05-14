import { useCallback } from 'react';
import { useParallaxController } from 'react-scroll-parallax';

interface ParallaxImageProps {
  onLoad: () => void;
}

export function useParallaxImage(): ParallaxImageProps {
  // Get the controller, which might be null if not wrapped in provider
  const parallaxController = useParallaxController();

  const handleLoad = useCallback(() => {
    // Update the parallax controller cache when the image loads
    if (parallaxController) {
      parallaxController.update();
    }
  }, [parallaxController]);

  return { onLoad: handleLoad };
}
