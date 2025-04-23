'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { LogoutButton } from '@/src/components/shared/LogoutButton';
import {
  fetchGoogleCalendarStatus,
  fetchTherapistId,
} from '@/src/features/google-calendar/utils/googleCalendarIntegrationHelpers';
import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';

import { isHeaderScrolledSignal } from '../../employee-dashboard/state/dashboardState';

export default function TherapistDashboardHeader({
  pageTitle = 'Dashboard',
  showBackButton = false,
  backButtonHref = '/therapist',
}: {
  pageTitle?: string;
  showBackButton?: boolean;
  backButtonHref?: string;
}) {
  const { user } = useUser();
  const [isCalendarConnected, setIsCalendarConnected] = useState<boolean | null>(null);
  useEffect(() => {
    const handleScroll = () => {
      isHeaderScrolledSignal.value = window.scrollY > 0;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function checkCalendar() {
      try {
        const therapistId = user?.publicMetadata?.therapistId || (await fetchTherapistId(user?.id));
        if (!therapistId) {
          setIsCalendarConnected(false);
          return;
        }
        const data = await fetchGoogleCalendarStatus(Number(therapistId));
        setIsCalendarConnected(!!data.isConnected);
      } catch {
        setIsCalendarConnected(false);
      }
    }
    checkCalendar();
  }, [user]);

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
              src='/renavestlogo.avif'
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
        {/* Right: Avatar and Logout button side by side */}
        <div className='flex items-center gap-2'>
          {isCalendarConnected === false && (
            <Link
              href='/therapist/integrations'
              className='text-gray-700 hover:text-gray-900 transition-colors'
            >
              Connect Calendar
            </Link>
          )}
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
