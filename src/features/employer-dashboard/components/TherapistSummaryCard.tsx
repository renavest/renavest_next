import { ArrowRight, Heart } from 'lucide-react';
import Link from 'next/link';

// Mock therapist data
const therapists = [
  {
    id: 1,
    name: 'Dr. Emily Chen',
    specialty: 'Financial Mindfulness',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: 2,
    name: 'Dr. Michael Rodriguez',
    specialty: 'Financial Anxiety',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: 3,
    name: 'Dr. Sarah Johnson',
    specialty: 'Debt Psychology',
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
  {
    id: 4,
    name: 'Dr. David Kim',
    specialty: 'Financial Planning',
    image: 'https://randomuser.me/api/portraits/men/75.jpg',
  },
];

export default function TherapistSummaryCard() {
  return (
    <div className='bg-white rounded-xl shadow-sm border border-purple-100 p-6 h-full'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-2'>
          <Heart className='w-5 h-5 text-purple-600' />
          <h3 className='text-lg font-semibold text-gray-700'>View Financial Therapists</h3>
        </div>
        <Link
          href='/employer/therapists'
          className='text-purple-600 hover:text-purple-800 flex items-center gap-1 text-sm font-medium transition-colors'
        >
          View all <ArrowRight className='w-4 h-4' />
        </Link>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {therapists.map((therapist) => (
          <div key={therapist.id} className='flex flex-col items-center text-center group'>
            <img
              src={therapist.image}
              alt={therapist.name}
              className='w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm transition-transform group-hover:scale-105 mb-2'
            />
            <p className='font-medium text-gray-800 text-sm'>{therapist.name}</p>
            <p className='text-xs text-gray-500'>{therapist.specialty}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
