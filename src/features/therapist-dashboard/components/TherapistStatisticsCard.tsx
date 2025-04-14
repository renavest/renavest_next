'use client';

import { Clock, Users, CheckCircle2, BookOpen } from 'lucide-react';

import { TherapistStatistics } from '@/src/features/therapist-dashboard/types';

export function TherapistStatisticsCard({ statistics }: { statistics: TherapistStatistics }) {
  const statisticsItems = [
    {
      icon: <Clock className='h-5 w-5 text-purple-600' />,
      title: 'Total Sessions',
      value: statistics.totalSessions,
      subtitle: 'Upcoming',
    },
    {
      icon: <Users className='h-5 w-5 text-purple-600' />,
      title: 'Total Clients',
      value: statistics.totalClients,
      subtitle: 'Active',
    },
    {
      icon: <CheckCircle2 className='h-5 w-5 text-purple-600' />,
      title: 'Completed Sessions',
      value: statistics.completedSessions,
      subtitle: 'All time',
    },
    {
      icon: <BookOpen className='h-5 w-5 text-purple-600' />,
      title: 'Resource Library',
      value: 24,
      subtitle: 'Worksheets',
    },
  ];

  return (
    <div className='bg-white rounded-xl p-6 border border-purple-100 shadow-sm'>
      <div className='grid md:grid-cols-4 gap-4'>
        {statisticsItems.map((item, index) => (
          <div key={index} className='flex items-center gap-4 bg-gray-50 p-4 rounded-lg'>
            {item.icon}
            <div>
              <p className='text-xs text-gray-500'>{item.title}</p>
              <p className='text-xl font-bold text-gray-800'>{item.value}</p>
              <p className='text-xs text-gray-500'>{item.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
