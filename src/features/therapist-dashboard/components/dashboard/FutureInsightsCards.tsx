import { TrendingUp } from 'lucide-react';

export const FutureInsightsCards = () => {
  const futureFeatures = [
    {
      title: 'Client Behavior Analysis',
      description: 'Gain deep insights into client progress and patterns',
      icon: (
        <svg
          className='w-8 h-8 text-purple-600'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
          />
        </svg>
      ),
      comingSoon: true,
    },
    {
      title: 'Treatment Effectiveness Tracker',
      description: 'Monitor and evaluate treatment outcomes',
      icon: (
        <svg
          className='w-8 h-8 text-green-600'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M13 10V3L4 14h7v7l9-11h-7z'
          />
        </svg>
      ),
      comingSoon: true,
    },
    {
      title: 'Client Communication Insights',
      description: 'Analyze communication patterns and engagement',
      icon: (
        <svg
          className='w-8 h-8 text-blue-600'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
          />
        </svg>
      ),
      comingSoon: true,
    },
  ];

  return (
    <div className='grid md:grid-cols-3 gap-4'>
      {futureFeatures.map((feature, index) => (
        <div
          key={index}
          className='bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden'
        >
          <div className='flex items-center mb-4'>
            {feature.icon}
            <h3 className='ml-3 text-lg font-semibold text-gray-800'>{feature.title}</h3>
          </div>
          <p className='text-gray-500 text-sm mb-4'>{feature.description}</p>
          {feature.comingSoon && (
            <div className='absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full'>
              Coming Soon
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
