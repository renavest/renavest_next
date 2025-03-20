import { cn } from '@/src/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
}

export default function MetricCard({ title, value, subtitle, className }: MetricCardProps) {
  return (
    <div
      className={cn('bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm', className)}
    >
      <h3 className='text-sm text-gray-600 mb-1'>{title}</h3>
      <p className='text-2xl md:text-3xl font-semibold text-gray-900'>{value}</p>
      {subtitle && <p className='text-sm text-gray-500 mt-1'>{subtitle}</p>}
    </div>
  );
}
