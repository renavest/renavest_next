import { useState } from 'react';

import { getTherapistImageUrl } from '@/src/services/s3/assetUrls';

interface UseTherapistImageProps {
  profileUrl?: string | null;
  fallbackUrl?: string;
}

interface UseTherapistImageReturn {
  imageSrc: string;
  isLoading: boolean;
  hasError: boolean;
  handleLoad: () => void;
  handleError: () => void;
}

export function useTherapistImage({
  profileUrl,
  fallbackUrl = '/experts/placeholderexp.png',
}: UseTherapistImageProps): UseTherapistImageReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Determine the image source
  const imageSrc = hasError || !profileUrl ? fallbackUrl : getTherapistImageUrl(profileUrl);

  return {
    imageSrc,
    isLoading,
    hasError,
    handleLoad,
    handleError,
  };
}
