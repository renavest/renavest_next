'use client';

import { useClerk } from '@clerk/nextjs';
import { useUser } from '@clerk/nextjs';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import { useState } from 'react';
import { InlineWidget, useCalendlyEventListener } from 'react-calendly';
import { toast } from 'sonner';

import { sendTherapistCalendlyEmail } from '@/src/features/booking/actions/sendBookingConfirmationEmail';
import { COLORS } from '@/src/styles/colors';

import { selectedRole } from '../../auth/state/authState';

interface AlternativeBookingProps {
  advisor: {
    id: string;
    name: string;
    profileUrl?: string;
    email?: string;
  };
  bookingURL: string;
}

export default function AlternativeBooking({ advisor, bookingURL }: AlternativeBookingProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    purpose: 'Intro Call',
  });
  const { user: clerkUser } = useClerk();
  const user = useUser();
  if (typeof window !== 'undefined' && clerkUser?.id) {
    posthog.identify(clerkUser.id, {
      $set_once: {
        email: clerkUser?.emailAddresses[0]?.emailAddress,
      },
      $set: {
        role: user?.publicMetadata?.role || selectedRole.value,
      },
    });
  }
  console.log(advisor);
  useCalendlyEventListener({
    onProfilePageViewed: () => console.log('onProfilePageViewed'),
    onDateAndTimeSelected: () => console.log('onDateAndTimeSelected'),
    onEventTypeViewed: () => console.log('onEventTypeViewed'),
    onEventScheduled: async (_e) => {
      try {
        // Show loading toast
        toast.loading('Notifying therapist about your booking...');
        // Send email to therapist
        if (advisor.email) {
          const emailResult = await sendTherapistCalendlyEmail({
            therapistName: advisor.name,
            therapistEmail: advisor.email,
            clientName: clerkUser?.fullName || 'Client',
            clientEmail: clerkUser?.emailAddresses[0]?.emailAddress || '',
          });

          if (!emailResult.success) {
            console.error('Failed to send therapist notification:', emailResult.error);
            // Continue with booking process even if email fails
          }
        }

        // Track the event in PostHog
        posthog.capture('booking_scheduled', {
          advisor_id: advisor.id,
          client_id: clerkUser?.id,
        });

        // Dismiss loading toast
        toast.dismiss();

        // Show success toast
        toast.success('Booking confirmed! The therapist has been notified.');

        // Redirect to booking confirmation page
        router.push('/book/alternative-confirmation');
      } catch (error) {
        console.error('Booking scheduling error:', error);
        toast.error('There was an issue scheduling your booking. Please try again.');
      }
    },
    onPageHeightResize: (e) => console.log(e.data.payload.height),
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Show loading state
    toast.loading('Sending your request...');

    try {
      // Send email to therapist
      if (advisor.email) {
        const emailResult = await sendTherapistCalendlyEmail({
          therapistName: advisor.name,
          therapistEmail: advisor.email || '',
          clientName: formData.name,
          clientEmail: formData.email,
        });

        if (!emailResult.success) {
          console.error('Failed to send therapist notification:', emailResult.error);
          toast.error('Failed to send request to therapist');
          return;
        }
      }

      // Track the event in PostHog
      posthog.capture('booking_request_sent', {
        advisor_id: advisor.id,
        client_name: formData.name,
        client_email: formData.email,
      });

      // Dismiss loading toast
      toast.dismiss();

      // Show success toast
      toast.success('Request sent to therapist');

      // Redirect to confirmation page
      router.push('/book/alternative-success');

      // Reset form after submission
      setFormData({
        name: '',
        email: '',
        message: '',
        purpose: 'Intro Call',
      });
    } catch (error) {
      toast.error('Failed to send request');
      console.error(error);
    }
  };

  // Extract form rendering to reduce function line count
  const renderForm = () => (
    <div className='flex items-center justify-center min-h-screen bg-warm-white bg-opacity-100 p-4'>
      <div className='relative w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg'>
        {/* Back Button */}
        <Link
          href={`/explore`}
          className={`absolute top-4 left-4 flex items-center ${COLORS.WARM_PURPLE.DEFAULT} ${COLORS.WARM_PURPLE.hoverText} transition-colors`}
          aria-label='Back to Booking'
        >
          <ChevronLeft className='h-6 w-6' />
        </Link>

        {advisor.profileUrl && (
          <div className='flex justify-center mb-6'>
            <div
              className={`relative w-24 h-24 rounded-full overflow-hidden border-4 ${COLORS.WARM_PURPLE.border}`}
            >
              <Image
                src={advisor.profileUrl}
                alt={`${advisor.name}'s profile`}
                fill
                className='object-cover'
                priority
              />
            </div>
          </div>
        )}

        <h2 className={`text-2xl font-bold text-center mb-4 ${COLORS.WARM_PURPLE.DEFAULT}`}>
          Schedule an Intro Call with {advisor.name}
        </h2>

        <p className='text-center text-gray-600 mb-6 px-4'>
          Fill out the form below, and {advisor.name} will review your request and reach out to
          schedule a convenient time.
        </p>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label htmlFor='name' className='block text-sm font-medium text-gray-700'>
              Your Name
            </label>
            <input
              type='text'
              id='name'
              name='name'
              value={formData.name}
              onChange={handleInputChange}
              required
              className={`mt-1 block w-full rounded-md border-warm-purple/30 shadow-sm 
              ${COLORS.WARM_PURPLE.focus} 
              transition-all duration-300 ease-in-out`}
            />
          </div>

          <div>
            <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
              Your Email
            </label>
            <input
              type='email'
              id='email'
              name='email'
              value={formData.email}
              onChange={handleInputChange}
              required
              className={`mt-1 block w-full rounded-md border-warm-purple/30 shadow-sm 
              ${COLORS.WARM_PURPLE.focus} 
              transition-all duration-300 ease-in-out`}
            />
          </div>

          <div>
            <label htmlFor='message' className='block text-sm font-medium text-gray-700'>
              Additional Information
            </label>
            <textarea
              id='message'
              name='message'
              rows={4}
              value={formData.message}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-warm-purple/30 shadow-sm 
              ${COLORS.WARM_PURPLE.focus} 
              transition-all duration-300 ease-in-out`}
              placeholder="Share a bit about why you'd like to connect (optional)"
            />
          </div>

          <div>
            <button
              type='submit'
              className={`w-full ${COLORS.WARM_PURPLE.bg} ${COLORS.WARM_PURPLE.hover} text-white py-2 px-4 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-offset-2 
              ${COLORS.WARM_PURPLE.ring}
              transition-all duration-300 ease-in-out 
              transform hover:scale-[1.02] active:scale-[0.98]`}
            >
              Request Intro Call
            </button>
          </div>
        </form>

        <div className='mt-6 text-center text-sm text-gray-500'>
          <p className={`${COLORS.WARM_PURPLE.DEFAULT}`}>
            We'll help you connect with {advisor.name} to discuss your needs.
          </p>
          <p className='mt-2'>Typical response time is within 1-2 business days.</p>
        </div>
      </div>
    </div>
  );

  return bookingURL ? (
    <div className='flex items-center justify-center min-h-screen bg-warm-white bg-opacity-100 p-4'>
      <InlineWidget url={bookingURL} />
    </div>
  ) : (
    renderForm()
  );
}
