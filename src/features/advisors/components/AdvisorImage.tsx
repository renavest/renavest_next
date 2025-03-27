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
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

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
      {isLoading && <div className='absolute inset-0 bg-gray-200 animate-pulse' />}

      <Image
        src={hasError ? fallbackUrl : advisor.profileUrl || fallbackUrl}
        alt={advisor.name}
        {...(fill ? { fill: true } : { width, height })}
        className={cn(
          'object-cover',
          fill ? 'absolute inset-0' : '',
          isLoading ? 'opacity-0' : 'opacity-100',
          'transition-opacity duration-300',
        )}
        priority={priority}
        sizes={fill ? '100vw' : undefined}
        onLoadingComplete={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
}
