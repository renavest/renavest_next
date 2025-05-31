'use client';

import { UserButton, useUser, useClerk } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { signal, effect } from '@preact-signals/safe-react';
import { eq } from 'drizzle-orm';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { toast } from 'sonner';

import { db } from '@/src/db';
import { therapists, users } from '@/src/db/schema';
import { GoogleCalendarIntegration } from '@/src/features/google-calendar/components/GoogleCalendarIntegration';
import { fetchTherapistId } from '@/src/features/google-calendar/utils/googleCalendarIntegration';
import { OnboardingModal } from '@/src/features/onboarding/components/OnboardingModal';
import { OnboardingModalContent } from '@/src/features/onboarding/components/OnboardingModalContent';
import { OnboardingProvider } from '@/src/features/onboarding/context/OnboardingContext';
import TherapistDashboardHeader from '@/src/features/therapist-dashboard/components/navigation/TherapistNavbar';

export default function TherapistOnboardingPage() {
  const { user, isLoaded } = useUser();
  const { user: clerkUser } = useClerk();

  // Replace useState with signals
  const completedSteps = signal({
    profile: false,
    googleCalendar: false,
    complete: false,
  });

  const profileData = signal({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
  });

  // Use effect to check steps
  effect(() => {
    async function checkSteps() {
      if (isLoaded && user) {
        const therapistId = await fetchTherapistId(user.id);
        const calendarResponse = await fetch(
          '/api/google-calendar/status?therapistId=' + therapistId,
        );
        const calendarData = await calendarResponse.json();
        const calendarConnected = calendarData.isConnected === true;
        const profileComplete = !!(user.firstName && user.lastName);

        completedSteps.value = {
          profile: profileComplete,
          googleCalendar: calendarConnected,
          complete: profileComplete && calendarConnected,
        };
      }
    }
    checkSteps();
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    profileData.value = {
      ...profileData.value,
      [name]: value,
    };
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileData.value.firstName) {
      toast.error('First Name Required', {
        description: 'Please enter your first name.',
      });
      return;
    }

    try {
      await clerkUser?.update({
        firstName: profileData.value.firstName,
        lastName: profileData.value.lastName,
      });

      toast.success('Profile Updated', {
        description: 'Your profile has been successfully updated.',
      });

      await clerkUser?.reload();

      // Update completed steps
      completedSteps.value = {
        ...completedSteps.value,
        profile: true,
      };
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Update Failed', {
        description: 'Unable to update your profile. Please try again.',
      });
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <TherapistDashboardHeader pageTitle='Therapist Onboarding' />

      <main className='max-w-6xl mx-auto py-24 px-4 sm:px-6 lg:px-8'>
        <div className='mb-8 flex justify-between items-center'>
          <h1 className='text-3xl font-bold text-gray-900'>Welcome to Renavest</h1>
          <div className='flex items-center'>
            <UserButton />
          </div>
        </div>

        {/* Progress indicator */}
        <div className='bg-white rounded-lg shadow p-6 mb-8'>
          <h2 className='text-lg font-medium text-gray-900 mb-4'>Setup Progress</h2>
          <div className='space-y-4'>
            <div className='flex items-center'>
              {completedSteps.value.profile ? (
                <CheckCircle className='h-6 w-6 text-green-500 mr-3' />
              ) : (
                <div className='h-6 w-6 rounded-full border-2 border-gray-300 mr-3' />
              )}
              <div className='flex-1'>
                <p className='font-medium'>Complete Profile</p>
                <p className='text-sm text-gray-500'>Add your first name and last name</p>
              </div>
            </div>

            <div className='flex items-center'>
              {completedSteps.value.googleCalendar ? (
                <CheckCircle className='h-6 w-6 text-green-500 mr-3' />
              ) : (
                <div className='h-6 w-6 rounded-full border-2 border-gray-300 mr-3' />
              )}
              <div className='flex-1'>
                <p className='font-medium'>Connect Google Calendar</p>
                <p className='text-sm text-gray-500'>Sync your appointments with Google Calendar</p>
              </div>
            </div>

            {completedSteps.value.complete && (
              <div className='flex items-center mt-6 pt-4 border-t border-gray-100'>
                <CheckCircle className='h-6 w-6 text-green-500 mr-3' />
                <p className='font-medium text-green-600'>
                  All set! Your account is fully configured.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Profile completion */}
        {!completedSteps.value.profile && (
          <div className='bg-white rounded-lg shadow p-6 mb-8'>
            <h2 className='text-lg font-medium text-gray-900 mb-4'>Complete Your Profile</h2>
            <form onSubmit={handleProfileSubmit} className='space-y-6'>
              <div className='grid md:grid-cols-2 gap-6'>
                <div>
                  <label
                    htmlFor='firstName'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    First Name <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    id='firstName'
                    name='firstName'
                    value={profileData.value.firstName}
                    onChange={handleInputChange}
                    required
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                    placeholder='Enter your first name'
                  />
                </div>
                <div>
                  <label
                    htmlFor='lastName'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Last Name
                  </label>
                  <input
                    type='text'
                    id='lastName'
                    name='lastName'
                    value={profileData.value.lastName}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                    placeholder='Enter your last name'
                  />
                </div>
              </div>

              <div className='flex justify-end'>
                <button
                  type='submit'
                  className='px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Google Calendar integration */}
        {completedSteps.value.profile && (
          <div className='bg-white rounded-lg shadow p-6 mb-8'>
            <h2 className='text-lg font-medium text-gray-900 mb-4'>Google Calendar Integration</h2>
            <p className='text-gray-600 mb-6'>
              Sync your Renavest appointments with Google Calendar to manage all your sessions in
              one place.
            </p>
            <GoogleCalendarIntegration />
          </div>
        )}

        {/* Return to dashboard */}
        {completedSteps.value.complete && (
          <div className='text-center mt-12'>
            <Link href='/therapist' className='text-purple-600 hover:text-purple-800 font-medium'>
              Return to Dashboard
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
