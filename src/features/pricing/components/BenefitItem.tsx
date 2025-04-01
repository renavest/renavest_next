export function BenefitItem({
  icon,
  color,
  title,
  description,
}: {
  icon: 'check' | 'turnover' | 'roi' | 'quick';
  color: 'green' | 'blue' | 'purple' | 'yellow';
  title: string;
  description: string;
}) {
  // Icon paths based on type
  const iconPaths: Record<string, string> = {
    check: 'M5 13l4 4L19 7',
    turnover:
      'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z',
    roi: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    quick: 'M13 10V3L4 14h7v7l9-11h-7z',
  };

  return (
    <div className='flex gap-3'>
      <div className={`h-10 w-10 rounded-full bg-${color}-100 flex items-center justify-center`}>
        <svg
          className={`h-6 w-6 text-${color}-600`}
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={iconPaths[icon]} />
        </svg>
      </div>
      <div>
        <h3 className='font-medium'>{title}</h3>
        <p className='text-sm text-gray-600'>{description}</p>
      </div>
    </div>
  );
}
