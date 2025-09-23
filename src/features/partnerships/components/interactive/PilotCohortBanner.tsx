'use client';

import { effect } from '@preact-signals/safe-react';
import { Calendar } from 'lucide-react';
import posthog from 'posthog-js';
import { useEffect, useState } from 'react';

// Fixed pilot cohort end date - update this when extending the pilot program
const PILOT_COHORT_END_DATE = new Date('2024-02-15T23:59:59-08:00'); // Feb 15, 2024 11:59 PM PST

function PilotCohortBanner() {
  // State for countdown timer
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Calculate initial time left
  const calculateTimeLeft = () => {
    const now = new Date();
    const difference = PILOT_COHORT_END_DATE.getTime() - now.getTime();

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    } else {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
  };

  // Effect to update countdown timer
  useEffect(() => {
    // Set initial time left
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      // Stop timer when countdown reaches zero
      if (
        newTimeLeft.days === 0 &&
        newTimeLeft.hours === 0 &&
        newTimeLeft.minutes === 0 &&
        newTimeLeft.seconds === 0
      ) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Don't show banner if pilot cohort has ended
  const now = new Date();
  if (now > PILOT_COHORT_END_DATE) {
    return null;
  }

  // Effect to track banner visibility
  effect(() => {
    if (typeof window !== 'undefined') {
      posthog.capture('partnerships_pilot_cohort_banner_viewed', {
        timestamp: new Date().toISOString(),
        cohort_end_date: PILOT_COHORT_END_DATE.toISOString(),
      });
    }
  });

  // Track demo booking
  const handleBookDemo = () => {
    if (typeof window !== 'undefined') {
      posthog.capture('partnerships_pilot_cohort_demo_booked', {
        timestamp: new Date().toISOString(),
        cohort_end_date: PILOT_COHORT_END_DATE.toISOString(),
      });
      // You might want to add a modal or redirect to a booking page
      window.open('https://calendly.com/rameau-stan/one-on-one', '_blank');
    }
  };

  return (
    <section className='w-full bg-[#f9f8ff] py-6'>
      <div className='max-w-5xl mx-auto px-4'>
        <div className='bg-white border border-gray-200 text-gray-900 rounded-xl p-6 flex items-center justify-between space-x-6 shadow-md'>
          <div className='flex items-center space-x-4'>
            <div className='bg-[#9071FF]/20 w-8 h-8 rounded-full flex items-center justify-center'>
              <span className='text-[#9071FF] text-xs font-bold'>!</span>
            </div>
            <div>
              <h3 className='text-xl font-bold mb-1 text-[#9071FF]'>Limited Partnership Spots Available</h3>
              <div className='flex items-center space-x-2'>
                <span className='text-lg font-semibold'>Partnership pilot closes in:</span>
                <div className='flex space-x-1'>
                  <div className='bg-[#9071FF]/10 text-[#9071FF] px-2 py-1 rounded text-sm font-mono'>
                    {timeLeft.days}d
                  </div>
                  <div className='bg-[#9071FF]/10 text-[#9071FF] px-2 py-1 rounded text-sm font-mono'>
                    {timeLeft.hours.toString().padStart(2, '0')}h
                  </div>
                  <div className='bg-[#9071FF]/10 text-[#9071FF] px-2 py-1 rounded text-sm font-mono'>
                    {timeLeft.minutes.toString().padStart(2, '0')}m
                  </div>
                  <div className='bg-[#9071FF]/10 text-[#9071FF] px-2 py-1 rounded text-sm font-mono'>
                    {timeLeft.seconds.toString().padStart(2, '0')}s
                  </div>
                </div>
              </div>
              <p className='text-gray-600 mt-1'>
                Join our exclusive partnership program—claim your spot before they're gone.
              </p>
            </div>
          </div>
          <button
            onClick={handleBookDemo}
            className='bg-[#9071FF] hover:bg-[#7a5fe6] text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center space-x-2'
          >
            <Calendar size={20} />
            <span>Book Partnership Call</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default PilotCohortBanner;