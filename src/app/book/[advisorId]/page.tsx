'use client';

import { useUser } from '@clerk/nextjs';
import { format, parseISO } from 'date-fns';
import { Clock, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { posthog } from 'posthog-js';
import { useState, useEffect } from 'react';

import { advisorSignal } from '@/src/features/advisors/state/advisorSignals';
import { Advisor } from '@/src/shared/types';
import { COLORS } from '@/src/styles/colors';

function TherapistHeader({ therapist }: { therapist: Advisor }) {
  return (
    <div className='flex items-center mb-6'>
      <div className='mr-4'>
        <img
          src={therapist.profileUrl || '/default-avatar.png'}
          alt={therapist.name}
          className='w-16 h-16 rounded-full object-cover'
        />
      </div>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>{therapist.name}</h1>
        <p className='text-gray-600'>{therapist.title}</p>
      </div>
    </div>
  );
}

function TimeSlotGrid({
  slots,
  selectedSlot,
  onSelectSlot,
}: {
  slots: AvailableSlot[];
  selectedSlot: string | null;
  onSelectSlot: (time: string) => void;
}) {
  if (slots.length === 0) {
    return <p className='text-gray-500'>No available slots at the moment</p>;
  }

  return (
    <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
      {slots.map((slot, index) => (
        <button
          key={index}
          onClick={() => onSelectSlot(slot.startTime)}
          className={`
            flex items-center justify-center p-3 rounded-lg transition-all
            ${
              selectedSlot === slot.startTime
                ? `${COLORS.WARM_PURPLE.bg} text-white`
                : 'bg-gray-100 text-gray-700 hover:bg-purple-50'
            }
          `}
        >
          <Clock className='mr-2 h-4 w-4' />
          {format(parseISO(slot.startTime), 'MMM d, h:mm a')}
        </button>
      ))}
    </div>
  );
}

type AvailableSlot = {
  startTime: string;
  endTime: string;
};

export default function BookingPage() {
  const router = useRouter();
  const { user } = useUser();

  const [therapist] = useState<Advisor | null>(advisorSignal.value);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If no advisor is selected, redirect back
    if (!therapist) {
      router.push('/explore');
      return;
    }

    async function fetchBookingDetails() {
      try {
        // Fetch available slots from API route
        const response = await fetch('/api/calendly/availability');

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || 'Failed to fetch availability');
        }

        const slots = await response.json();
        setAvailableSlots(slots);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Failed to load booking information');
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      fetchBookingDetails();
    }
  }, [therapist, user, router]);

  const handleBookSlot = () => {
    if (therapist?.bookingURL && selectedSlot) {
      // Redirect to Calendly with pre-selected time
      const bookingUrlWithTime = `${therapist.bookingURL}?date=${encodeURIComponent(selectedSlot)}`;

      // Track therapist booking
      posthog.identify(user?.id, {
        current_therapist: {
          name: therapist.name,
          id: therapist.id,
          booking_time: selectedSlot,
        },
      });

      window.location.href = bookingUrlWithTime;
    }
  };

  if (isLoading) return <div className='text-center py-10'>Loading booking details...</div>;
  if (error) return <div className='text-red-500 text-center py-10'>{error}</div>;
  if (!therapist) return <div className='text-center py-10'>Therapist not found</div>;

  return (
    <div className='max-w-2xl mx-auto px-4 py-8'>
      <div className='bg-white shadow-lg rounded-2xl p-6'>
        <TherapistHeader therapist={therapist} />

        <div className='mb-6'>
          <h2 className='text-xl font-semibold mb-4'>Select a Time Slot</h2>
          <TimeSlotGrid
            slots={availableSlots}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
          />
        </div>

        <div className='flex space-x-4'>
          <button
            onClick={handleBookSlot}
            disabled={!selectedSlot}
            className={`flex-1 ${selectedSlot ? COLORS.WARM_PURPLE.bg : 'bg-gray-300'}`}
          >
            {selectedSlot ? 'Book Selected Time' : 'Select a Time Slot'}
          </button>

          <a
            href={therapist.bookingURL}
            target='_blank'
            rel='noopener noreferrer'
            className={`
              flex-1 inline-flex items-center justify-center py-2 px-4 
              rounded-lg text-center transition-colors
              ${COLORS.WARM_PURPLE['10']} text-purple-700 hover:bg-purple-100
            `}
          >
            Full Calendly Page <ExternalLink className='ml-2 h-4 w-4' />
          </a>
        </div>
      </div>
    </div>
  );
}
