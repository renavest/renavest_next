'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { ChevronLeft, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

import { LogoutButton } from '@/src/features/auth/components/auth/LogoutButton';
import { fetchTherapistId } from '@/src/features/google-calendar/utils/googleCalendarIntegration';
import {
  trackTherapistDashboard,
  trackTherapistMarketplace,
} from '@/src/features/posthog/therapistTracking';
import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';

import { isHeaderScrolledSignal } from '../../employee-dashboard/state/dashboardState';
import { therapistIdSignal } from '../state/therapistDashboardState';

export default function TherapistNavbar({
  pageTitle = 'Therapist Dashboard',
  showBackButton = false,
  backButtonHref = '/therapist',
}: {
  pageTitle?: string;
  showBackButton?: boolean;
  backButtonHref?: string;
}) {
  const { user } = useUser();

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

  const handleMarketplaceClick = () => {
    if (therapistIdSignal.value) {
      trackTherapistMarketplace.marketplaceViewed(therapistIdSignal.value, {
        user_id: user?.id,
        email: user?.emailAddresses?.[0]?.emailAddress,
      });
    }
  };

  const handleProfileClick = () => {
    if (therapistIdSignal.value) {
      trackTherapistDashboard.navigationClicked('profile', therapistIdSignal.value, {
        user_id: user?.id,
        email: user?.emailAddresses?.[0]?.emailAddress,
      });
    }
  };

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
              className='mr-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg border border-gray-200'
              aria-label='Back to Dashboard'
            >
              <ChevronLeft className='h-5 w-5' />
              <span className='text-sm font-medium hidden sm:inline'>Back</span>
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
        {/* Right: Profile link, Marketplace link, Logout, Avatar */}
        <div className='flex items-center gap-3'>
          <Link
            href='/explore'
            onClick={handleMarketplaceClick}
            className='flex items-center gap-1.5 text-gray-700 hover:text-gray-900 transition-colors text-sm px-3 py-2 rounded-lg hover:bg-gray-100 border border-transparent hover:border-gray-200'
          >
            <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
            <span className='hidden sm:inline'>Marketplace</span>
          </Link>
          <Link
            href='/therapist/profile'
            onClick={handleProfileClick}
            className='flex items-center gap-1.5 text-gray-700 hover:text-gray-900 transition-colors text-sm px-3 py-2 rounded-lg hover:bg-gray-100 border border-transparent hover:border-gray-200'
          >
            <User className='h-4 w-4' />
            <span className='hidden sm:inline'>Profile</span>
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
