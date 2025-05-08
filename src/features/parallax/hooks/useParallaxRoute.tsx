import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useParallaxController } from 'react-scroll-parallax';

export function useUpdateControllerOnRouteChange() {
  const pathname = usePathname();
  const parallaxController = useParallaxController();

  useEffect(() => {
    if (parallaxController) {
      // Update the parallax controller on route changes
      parallaxController.update();
    }
  }, [pathname, parallaxController]);
}
