'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { ChevronLeft, Calendar, Check, AlertCircle, CheckCircle, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

import { LogoutButton } from '@/src/features/auth/components/LogoutButton';
import {
  useGoogleCalendarIntegration,
  fetchTherapistId,
} from '@/src/features/google-calendar/utils/googleCalendarIntegration';
import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';

import { isHeaderScrolledSignal } from '../../employee-dashboard/state/dashboardState';
import { therapistIdSignal } from '../state/therapistDashboardState';

export default function TherapistDashboardHeader({
  pageTitle = 'Therapist Dashboard',
  showBackButton = false,
  backButtonHref = '/therapist',
  isOnboarded = false,
}: {
  pageTitle?: string;
  showBackButton?: boolean;
  backButtonHref?: string;
  isOnboarded?: boolean;
}) {
  const { user } = useUser();

  // Use the Google Calendar integration hook with refresh capability
  const { status: calendarStatus, refreshStatus } = useGoogleCalendarIntegration(
    therapistIdSignal.value || 0,
  );

  useEffect(() => {
    const handleScroll = () => {
      isHeaderScrolledSignal.value = window.scrollY > 0;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get therapist ID if not in metadata
  useEffect(() => {
    async function getTherapistId() {
      if (user?.id && !therapistIdSignal.value) {
        const therapistId = await fetchTherapistId(user.id);
        therapistIdSignal.value = therapistId;
      }
    }
    getTherapistId();
  }, [user?.id]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 border-b shadow-sm',
        isHeaderScrolledSignal.value ? 'border-gray-200 shadow-md' : 'border-transparent',
        COLORS.WARM_WHITE.bg,
        'py-3 md:py-4 px-4 md:px-8 lg:px-20 transition-all',
      )}
      style={{ minHeight: 64 }}
    >
      <div className='flex items-center justify-between max-w-7xl mx-auto'>
        {/* Left: Back button, Logo, Title */}
        <div className='flex items-center'>
          {showBackButton && (
            <Link
              href={backButtonHref}
              className='mr-3 flex items-center text-gray-600 hover:text-gray-800 transition-colors'
              aria-label='Back'
            >
              <ChevronLeft className='h-6 w-6' />
            </Link>
          )}
          <div className='relative flex-shrink-0 w-8 h-8 md:w-10 md:h-10 mx-3'>
            <Image
              src='/renavestlogo.png'
              alt='Renavest Logo'
              fill
              sizes='(max-width: 768px) 32px, 40px'
              className='object-contain'
              priority
            />
          </div>
          <h1 className='ml-3 text-xl md:text-2xl font-semibold text-gray-800 transition-all duration-300 hidden sm:block'>
            {pageTitle}
          </h1>
        </div>
        {/* Right: Integration status, Logout, Avatar */}
        <div className='flex items-center gap-3'>
          {!isOnboarded && (
            <Link
              href='/therapist/onboarding'
              className='flex items-center gap-1.5 text-gray-700 hover:text-gray-900 transition-colors text-sm px-2 py-1 rounded-md hover:bg-gray-100'
            >
              <CheckCircle className='h-4 w-4' />
              <span>Onboarding</span>
            </Link>
          )}
          <Link
            href='/therapist/'
            className='flex items-center gap-1.5 text-gray-700 hover:text-gray-900 transition-colors text-sm px-2 py-1 rounded-md hover:bg-gray-100'
          >
            <User className='h-4 w-4' />
            <span>View Profile</span>
          </Link>
          <div className='h-6 w-px bg-gray-200 mx-1'></div>
          <Link
            href='/therapist/integrations'
            className='flex items-center gap-1.5 text-gray-700 hover:text-gray-900 transition-colors text-sm px-2 py-1 rounded-md hover:bg-gray-100'
            onClick={() => {
              // Optional: Refresh status when clicking on integrations link
              refreshStatus();
            }}
          >
            <Calendar className='h-4 w-4' />
            <span>Integrations</span>
            {calendarStatus.isLoading ? (
              <span className='h-2 w-2 rounded-full bg-gray-300 animate-pulse'></span>
            ) : calendarStatus.isConnected ? (
              <Check className='h-4 w-4 text-green-500' />
            ) : (
              <AlertCircle className='h-4 w-4 text-amber-500' />
            )}
          </Link>
          <div className='h-6 w-px bg-gray-200 mx-1'></div>
          <LogoutButton />
          <div className='h-6 w-px bg-gray-200 mx-1'></div>
          <div className='ml-1 lg:ml-2'>
            <UserButton afterSignOutUrl='/login' />
          </div>
        </div>
      </div>
    </header>
  );
}
