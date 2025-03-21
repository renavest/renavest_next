import { cn } from '@/src/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: number;
  className?: string;
  trendClassName?: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  className,
  trendClassName,
}: MetricCardProps) {
  return (
    <div className={cn('p-6 bg-white rounded-xl border border-purple-100 shadow-sm', className)}>
      <h3 className='text-sm font-medium mb-2'>{title}</h3>
      <div className='flex items-baseline gap-2'>
        <p className='text-2xl md:text-3xl font-semibold'>{value}</p>
        {trend !== undefined && (
          <span
            className={cn(
              'text-sm font-medium',
              trendClassName || (trend >= 0 ? 'text-green-600' : 'text-red-600'),
            )}
          >
            {trend >= 0 ? '+' : ''}
            {trend}%
          </span>
        )}
      </div>
      <p className='text-sm mt-1 opacity-80'>{subtitle}</p>
    </div>
  );
}
