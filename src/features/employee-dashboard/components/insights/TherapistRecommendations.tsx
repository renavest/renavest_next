'use client';

import { ArrowRight, Calendar, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import { useEffect, useState } from 'react';

import { TherapistImage } from '@/src/features/therapist-dashboard/components/TherapistImage';

interface Therapist {
  id: number;
  name: string;
  title: string;
  profileUrl: string;
  previewBlurb: string;
  bookingURL?: string;
  isPending?: boolean;
}

interface TherapistRecommendationsProps {
  showViewAllButton?: boolean;
}

export default function TherapistRecommendations({
  showViewAllButton = false,
}: TherapistRecommendationsProps) {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchTherapists() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch('/api/therapist/list-therapists?limit=2');
        if (!res.ok) throw new Error('Failed to fetch therapists');
        const data = await res.json();
        setTherapists(data.therapists || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchTherapists();
  }, []);

  const handleBookFreeSession = (therapist: Therapist) => {
    // Track booking intent
    posthog.capture('free_session_booking_clicked', {
      therapist_id: therapist.id,
      therapist_name: therapist.name,
      source: 'dashboard_recommendations',
    });

    // Navigate to booking page or external URL
    if (therapist.bookingURL) {
      window.open(therapist.bookingURL, '_blank');
    } else {
      router.push(`/book/${therapist.id}`);
    }
  };

  const handleViewAll = () => {
    posthog.capture('view_all_therapists_clicked', {
      source: 'dashboard_recommendations',
    });
    router.push('/explore');
  };

  return (
    <div className='bg-white rounded-xl p-4 md:p-8 border border-gray-100 shadow-sm'>
      <div className='flex items-center justify-between mb-4 md:mb-6'>
        <div>
          <h3 className='text-lg md:text-2xl font-semibold text-gray-800 mb-1'>
            Your Recommended Financial Therapists
          </h3>
          <p className='text-sm text-purple-600 font-medium flex items-center'>
            <Star className='w-4 h-4 mr-1' />
            Book a FREE consultation with any of these experts
          </p>
        </div>
      </div>

      <div className='space-y-4'>
        {isLoading && (
          <div className='text-gray-500 text-center py-6'>
            Loading your personalized recommendations...
          </div>
        )}
        {error && <div className='text-red-500 text-center py-6'>{error}</div>}
        {!isLoading &&
          !error &&
          therapists.map((therapist) => (
            <div
              key={therapist.id}
              className='p-4 md:p-6 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors group'
            >
              <div className='flex items-start gap-4 md:gap-6'>
                <div className='flex-shrink-0 w-16 h-16 md:w-20 md:h-20'>
                  <TherapistImage
                    profileUrl={therapist.profileUrl}
                    name={therapist.name}
                    width={80}
                    height={80}
                    className='rounded-full w-full h-full border-2 border-purple-100'
                  />
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-3'>
                    <div className='flex-1'>
                      <h4 className='text-lg md:text-xl font-semibold text-gray-800 mb-1'>
                        {therapist.name}
                      </h4>
                      <p className='text-sm md:text-base text-purple-600 font-medium mb-2'>
                        {therapist.title}
                      </p>
                      <p className='text-sm md:text-base text-gray-600 leading-relaxed'>
                        {therapist.previewBlurb}
                      </p>
                    </div>
                    <div className='flex-shrink-0'>
                      <button
                        onClick={() => handleBookFreeSession(therapist)}
                        className='bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md group-hover:scale-105'
                      >
                        <Calendar className='w-4 h-4' />
                        Book FREE Session
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {showViewAllButton && !isLoading && !error && (
        <div className='mt-6 pt-4 border-t border-gray-100'>
          <button
            onClick={handleViewAll}
            className='w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2'
          >
            Don't like these therapists? View all
            <ArrowRight className='w-4 h-4' />
          </button>
        </div>
      )}

      <p className='mt-6 text-sm text-gray-500 text-center'>
        🎯 Personalized matches based on your quiz responses • 💬 Free initial consultations
        available
      </p>
    </div>
  );
}
