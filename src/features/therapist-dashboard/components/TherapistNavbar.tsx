'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { ChevronLeft, Calendar, Check, AlertCircle, CheckCircle, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

import { LogoutButton } from '@/src/features/auth/components/auth/LogoutButton';
import {
  useGoogleCalendarIntegration,
  fetchTherapistId,
} from '@/src/features/google-calendar/utils/googleCalendarIntegration';
import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';

import { isHeaderScrolledSignal } from '../../employee-dashboard/state/dashboardState';
import { therapistIdSignal } from '../state/therapistDashboardState';

export default function TherapistNavbar({
  pageTitle = 'Therapist Dashboard',
}: {
  pageTitle?: string;
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
      className='fixed top-0 left-0 right-0 z-40 border-b shadow-sm bg-white py-3 px-4 md:px-8 lg:px-20 transition-all'
      style={{ minHeight: 64 }}
    >
      <div className='flex items-center justify-between max-w-7xl mx-auto'>
        {/* Left: Logo and Title */}
        <div className='flex items-center'>
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
        {/* Right: User Avatar */}
        <div className='ml-1 lg:ml-2'>
          <UserButton afterSignOutUrl='/login' />
        </div>
      </div>
    </header>
  );
}
