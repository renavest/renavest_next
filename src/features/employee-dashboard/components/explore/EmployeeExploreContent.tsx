'use client';

import { useEffect, useState } from 'react';

import AdvisorGrid from '@/src/features/explore/components/AdvisorGrid';
import { Advisor } from '@/src/shared/types';

export default function EmployeeExploreContent() {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/explore');
        if (!response.ok) {
          throw new Error('Failed to fetch therapists');
        }
        const data = await response.json();
        setAdvisors(data.advisors || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAdvisors();
  }, []);

  if (loading) {
    return (
      <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
        <div className='p-6'>
          <div className='mb-6'>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>Find Your Financial Therapist</h2>
            <p className='text-gray-600'>
              Browse our network of verified financial therapists and find the perfect match for your needs.
            </p>
          </div>
          <div className='flex justify-center items-center py-12'>
            <div className='flex flex-col items-center space-y-4'>
              <div className='w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin'></div>
              <span className='text-gray-500 font-medium'>Loading therapists...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
        <div className='p-6'>
          <div className='mb-6'>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>Find Your Financial Therapist</h2>
            <p className='text-gray-600'>
              Browse our network of verified financial therapists and find the perfect match for your needs.
            </p>
          </div>
          <div className='flex justify-center items-center py-12'>
            <div className='text-center'>
              <p className='text-red-600 mb-4'>Error loading therapists: {error}</p>
              <button 
                onClick={() => window.location.reload()}
                className='bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg'
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
      <div className='p-6'>
        <div className='mb-6'>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>Find Your Financial Therapist</h2>
          <p className='text-gray-600'>
            Browse our network of verified financial therapists and find the perfect match for your needs.
          </p>
        </div>
        <AdvisorGrid advisors={advisors} />
      </div>
    </div>
  );
}
