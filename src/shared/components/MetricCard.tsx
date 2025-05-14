import { LucideIcon } from 'lucide-react';

import { cn } from '@/src/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: number;
  className?: string;
  trendClassName?: string;
  titleClassName?: string;
  valueClassName?: string;
  subtitleClassName?: string;
  icon?: LucideIcon;
  iconClassName?: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  className,
  trendClassName,
  titleClassName,
  valueClassName,
  subtitleClassName,
  icon: Icon,
  iconClassName,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'p-6 bg-white rounded-xl border border-purple-100 shadow-sm relative',
        className,
      )}
    >
      {Icon && (
        <div
          className={cn(
            'absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-indigo-100',
            iconClassName,
          )}
        >
          <Icon className='w-4 h-4' />
        </div>
      )}
      <h3 className={cn('text-sm font-medium mb-2', titleClassName)}>{title}</h3>
      <div className='flex items-baseline gap-2'>
        <p className={cn('text-2xl md:text-3xl font-semibold', valueClassName)}>{value}</p>
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
      <p className={cn('text-sm mt-1 opacity-80', subtitleClassName)}>{subtitle}</p>
    </div>
  );
}
