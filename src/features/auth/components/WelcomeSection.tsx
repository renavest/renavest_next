import { COLORS } from '@/src/styles/colors';
import { cn } from '@/src/lib/utils';

export default function WelcomeSection() {
  return (
    <div className='w-full md:w-1/2 flex items-center justify-center p-8 relative overflow-hidden'>
      <div className='absolute inset-0'>
        <div className={cn('absolute inset-0 z-0', COLORS.WARM_WHITE.bg)}>
          {/* Decorative lines */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`h-${i}`}
              className={cn(
                'absolute',
                COLORS.WARM_PURPLE[10],
                'h-[1px] w-full',
                'transform -rotate-5 origin-left',
              )}
              style={{ top: `${i * 12.5}%` }}
            />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`v-${i}`}
              className={cn(
                'absolute',
                COLORS.WARM_PURPLE[10],
                'w-[1px] h-full',
                'transform rotate-5 origin-top',
              )}
              style={{ left: `${i * 12.5}%` }}
            />
          ))}
        </div>
      </div>

      <div
        className={cn(
          'relative z-10 w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border-2',
          COLORS.WARM_PURPLE[20],
        )}
      >
        <h1 className='text-4xl md:text-5xl font-bold text-gray-900 leading-tight'>
          Welcome to
          <br />
          Renavest!
        </h1>

        <p className='mt-4 text-gray-600'>
          Transform your relationship with money through Financial Therapy
        </p>
      </div>
    </div>
  );
}
