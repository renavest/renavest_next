import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';

import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
  trend?: number;
}

export default function MetricCard({ title, value, subtitle, className, trend }: MetricCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm',
        'hover:border-purple-200 transition-all duration-300',
        'hover:shadow-md hover:-translate-y-1',
        className,
      )}
    >
      <div className='flex justify-between items-start'>
        <div>
          <h3 className='text-sm text-gray-600 mb-1'>{title}</h3>
          <p className='text-2xl md:text-3xl font-semibold text-gray-900'>{value}</p>
          {subtitle && <p className='text-sm text-gray-500 mt-1'>{subtitle}</p>}
        </div>
        {trend !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-sm',
              trend >= 0
                ? cn('bg-green-50 text-green-700', COLORS.WARM_PURPLE[5])
                : 'bg-red-50 text-red-700',
            )}
          >
            {trend >= 0 ? (
              <ArrowUpIcon className='w-4 h-4 text-green-600' />
            ) : (
              <ArrowDownIcon className='w-4 h-4 text-red-600' />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
