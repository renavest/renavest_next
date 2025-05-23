import Image from 'next/image';

import { useTherapistImage } from '@/src/hooks/useTherapistImage';
import { cn } from '@/src/lib/utils';

interface TherapistImageProps {
  profileUrl?: string | null;
  name: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackUrl?: string;
  showLoadingState?: boolean;
  priority?: boolean;
}

export function TherapistImage({
  profileUrl,
  name,
  width = 80,
  height = 80,
  className,
  fallbackUrl,
  showLoadingState = true,
  priority = false,
}: TherapistImageProps) {
  const { imageSrc, isLoading, handleLoad, handleError } = useTherapistImage({
    profileUrl,
    fallbackUrl,
  });

  return (
    <div className={cn('relative', className)}>
      {/* Loading state */}
      {showLoadingState && isLoading && (
        <div
          className={cn('absolute inset-0 bg-gray-200 animate-pulse rounded-full', className)}
          style={{ width, height }}
          aria-label='Image loading'
        />
      )}

      {/* Image */}
      <Image
        src={imageSrc}
        alt={`${name}'s profile`}
        width={width}
        height={height}
        className={cn(
          'object-cover',
          isLoading && showLoadingState ? 'opacity-0' : 'opacity-100',
          className,
        )}
        onLoad={handleLoad}
        onError={handleError}
        priority={priority}
        placeholder='blur'
        blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      />
    </div>
  );
}
