'use client';
import React from 'react';

const mockStats = [
  { label: 'Total Sessions', value: 128 },
  { label: 'Active Therapists', value: 12 },
  { label: 'Employees Helped', value: 54 },
];

const mockTherapists = [
  {
    name: 'Dr. Jane Smith',
    specialty: 'Cognitive Behavioral Therapy',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    name: 'Dr. John Doe',
    specialty: 'Mindfulness & Stress Reduction',
    image: 'https://randomuser.me/api/portraits/men/46.jpg',
  },
];

export default function ExampleLandingPage() {
  return (
    <div className='min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4'>
      <div className='w-full max-w-6xl flex flex-col md:flex-row gap-8'>
        {/* Left: Dashboard/Stats */}
        <div className='flex-1 space-y-6'>
          <h2 className='text-2xl font-bold text-gray-800 mb-4'>Dashboard Overview</h2>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            {mockStats.map((stat) => (
              <div
                key={stat.label}
                className='bg-white rounded-lg shadow p-6 flex flex-col items-center'
              >
                <span className='text-3xl font-bold text-indigo-600'>{stat.value}</span>
                <span className='text-gray-600 mt-2'>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: View Therapists */}
        <div className='flex-1 space-y-6'>
          <h2 className='text-2xl font-bold text-gray-800 mb-4'>View Therapists</h2>
          <div className='grid grid-cols-1 gap-4'>
            {mockTherapists.map((therapist) => (
              <div
                key={therapist.name}
                className='bg-white rounded-lg shadow flex items-center p-4'
              >
                <img
                  src={therapist.image}
                  alt={therapist.name}
                  className='w-16 h-16 rounded-full object-cover mr-4'
                />
                <div>
                  <div className='font-semibold text-lg text-gray-900'>{therapist.name}</div>
                  <div className='text-gray-500 text-sm'>{therapist.specialty}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Insights Section */}
      <div className='w-full max-w-6xl mt-12'>
        <h2 className='text-2xl font-bold text-gray-800 mb-4'>Data Insights</h2>
        <div className='bg-white rounded-lg shadow p-8 flex flex-col items-center'>
          <span className='text-4xl font-bold text-indigo-600 mb-2'>92%</span>
          <span className='text-gray-600'>Employee Satisfaction Rate</span>
        </div>
      </div>
    </div>
  );
}
