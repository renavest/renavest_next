import { AlertTriangle } from 'lucide-react';

export function MetricsErrorFallback({ error }: { error?: Error }) {
  return (
    <div className='bg-white rounded-lg shadow-sm p-4 flex items-center space-x-4 border-l-4 border-red-500'>
      <AlertTriangle className='h-8 w-8 text-red-500' />
      <div>
        <h3 className='text-lg font-semibold text-gray-800'>Error Loading Metrics</h3>
        <p className='text-gray-600 text-sm'>
          {error?.message || 'Unable to load dashboard metrics. Please try again later.'}
        </p>
      </div>
    </div>
  );
}
