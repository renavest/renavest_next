'use client';

import { useUser } from '@clerk/nextjs';
import { ArrowRight, Calendar, Star, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import { useEffect, useState } from 'react';

import type {
  Therapist,
  TherapistRecommendationsProps,
} from '@/src/features/employee-dashboard/types';
import { TherapistImage } from '@/src/features/therapist-dashboard/components/shared/TherapistImage';

// FAQItem component for dropdowns
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className='border-t border-gray-200'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex justify-between items-center w-full py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none'
      >
        <span>{question}</span>
        <span className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isOpen && (
        <div className='pb-2 px-2 text-sm text-gray-600'>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function TherapistRecommendations({
  showViewAllButton = false,
}: TherapistRecommendationsProps) {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatCreatingFor, setChatCreatingFor] = useState<number | null>(null);
  const router = useRouter();
  const { user } = useUser();

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
      // For therapists with external booking URLs, open in new tab
      window.open(therapist.bookingURL, '_blank');
    } else {
      // For internal booking, use correct ID format based on pending status
      const bookingId = therapist.isPending ? `pending-${therapist.id}` : therapist.id.toString();
      router.push(`/book/${bookingId}`);
    }
  };

  const createChannel = async (therapistId: number, prospectUserId: number): Promise<boolean> => {
    try {
      const response = await fetch('/api/chat/messaging', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_channel',
          therapistId,
          prospectUserId,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to create channel:', error);
      return false;
    }
  };

  const handleStartChat = async (therapist: Therapist) => {
    if (!user?.id) {
      console.error('User not authenticated');
      return;
    }

    try {
      setChatCreatingFor(therapist.id);

      // Track chat initiation
      posthog.capture('therapist_chat_initiated', {
        therapist_id: therapist.id,
        therapist_name: therapist.name,
        source: 'dashboard_recommendations',
        user_id: user.id,
      });

      // Get the database user ID first
      const userResponse = await fetch('/api/user/me');
      if (!userResponse.ok) {
        throw new Error('Failed to get user data');
      }
      const userData = await userResponse.json();

      // Create chat channel
      const success = await createChannel(therapist.id, userData.id);

      if (success) {
        // Track successful chat creation
        posthog.capture('therapist_chat_created', {
          therapist_id: therapist.id,
          therapist_name: therapist.name,
          source: 'dashboard_recommendations',
          user_id: user.id,
        });
      } else {
        throw new Error('Failed to create chat channel');
      }
    } catch (error) {
      console.error('Failed to start chat:', error);
      // Track chat creation failure
      posthog.capture('therapist_chat_failed', {
        therapist_id: therapist.id,
        therapist_name: therapist.name,
        source: 'dashboard_recommendations',
        user_id: user.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setChatCreatingFor(null);
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
            Book a FREE consultation or start a chat with any of these experts
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        {isLoading && (
          <div className='text-gray-500 text-center py-6 col-span-full'>
            Loading your personalized recommendations...
          </div>
        )}
        {error && <div className='text-red-500 text-center py-6 col-span-full'>{error}</div>}
        {!isLoading &&
          !error &&
          therapists.map((therapist) => (
            <div
              key={therapist.id}
              className='flex flex-col items-center p-4 md:p-6 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors group h-full bg-white shadow-sm'
            >
              <div className='w-20 h-20 mb-4'>
                <TherapistImage
                  profileUrl={therapist.profileUrl}
                  name={therapist.name}
                  width={80}
                  height={80}
                  className='rounded-full w-full h-full border-2 border-purple-100 object-cover object-center'
                />
              </div>
              <div className='flex-1 flex flex-col items-center text-center w-full'>
                <h4 className='text-lg md:text-xl font-semibold text-gray-800 mb-1'>
                  {therapist.name}
                </h4>
                <p className='text-sm md:text-base text-purple-600 font-medium mb-2'>
                  {therapist.title}
                </p>
                <p className='text-sm md:text-base text-gray-600 leading-relaxed mb-4'>
                  {therapist.previewBlurb}
                </p>
                {/* FAQ Section */}
                <div className='w-full mt-2'>
                  <FAQItem
                    question='How do you hold clients accountable or track progress over time?'
                    answer='I use a combination of goal-setting, session recaps, and digital tools to help clients stay on track and celebrate their progress.'
                  />
                  <FAQItem
                    question='What do you wish more clients knew before starting financial therapy?'
                    answer='That financial therapy is a collaborative process—progress comes from openness, patience, and a willingness to explore both numbers and emotions.'
                  />
                </div>
              </div>
              <div className='flex flex-col sm:flex-row gap-2 w-full mt-auto'>
                {process.env.NEXT_PUBLIC_ENABLE_CHAT_FEATURE === 'true' && (
                  <button
                    onClick={() => handleStartChat(therapist)}
                    disabled={chatCreatingFor === therapist.id}
                    className='bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 md:px-4 md:py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md group-hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed w-full'
                  >
                    <MessageCircle className='w-4 h-4' />
                    {chatCreatingFor === therapist.id ? 'Starting...' : 'Chat'}
                  </button>
                )}
                <button
                  onClick={() => handleBookFreeSession(therapist)}
                  className='bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md group-hover:scale-105 w-full'
                >
                  <Calendar className='w-4 h-4' />
                  Book FREE Session
                </button>
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
