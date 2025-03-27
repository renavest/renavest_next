import Image from 'next/image';
import { useState } from 'react';

import { cn } from '@/src/lib/utils';
import { Advisor } from '@/src/shared/types';

interface AdvisorImageProps {
  advisor: Advisor;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
}

export default function AdvisorImage({
  advisor,
  className,
  priority = false,
  fill = false,
  width = 350,
  height = 350,
}: AdvisorImageProps) {
  const [imageLoadState, setImageLoadState] = useState({
    isLoaded: false,
    hasError: false,
  });

  const handleImageLoad = () => {
    setImageLoadState({
      isLoaded: true,
      hasError: false,
    });
  };

  const handleImageError = () => {
    setImageLoadState({
      isLoaded: false,
      hasError: true,
    });
  };

  const fallbackUrl = '/experts/placeholderexp.png';

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gray-100',
        fill ? 'w-full h-full' : 'w-[350px] h-[450px]',
        className,
      )}
    >
      {/* Loading state */}
      {!imageLoadState.isLoaded && !imageLoadState.hasError && (
        <div
          className='absolute inset-0 bg-gray-200 animate-pulse'
          aria-label='Image loading placeholder'
        />
      )}

      {imageLoadState.hasError ? (
        <div
          className='absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500'
          aria-label='Image failed to load'
        >
          No Image
        </div>
      ) : (
        <Image
          src={advisor.profileUrl || fallbackUrl}
          alt={advisor.name}
          {...(fill ? { fill: true } : { width, height })}
          className={cn(
            'object-cover',
            fill ? 'absolute inset-0' : '',
            !imageLoadState.isLoaded ? 'opacity-0' : 'opacity-100',
            'transition-opacity duration-300',
          )}
          priority={priority}
          sizes={fill ? '100vw' : undefined}
          placeholder='blur'
          blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
          onLoadingComplete={handleImageLoad}
          onError={handleImageError}
        />
      )}
    </div>
  );
}
