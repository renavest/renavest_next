interface MetricsErrorFallbackProps {
  error: Error;
}

export function MetricsErrorFallback({ error }: MetricsErrorFallbackProps) {
  return (
    <div className='bg-red-50 p-4 rounded-lg'>
      <h3 className='text-red-700 font-semibold'>Error Loading Data</h3>
      <p className='text-red-600 text-sm mt-2'>
        {error instanceof Error ? error.message : 'Unknown error'}
      </p>
    </div>
  );
}
