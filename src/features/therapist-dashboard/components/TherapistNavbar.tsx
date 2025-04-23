'use client';

import { UserButton } from '@clerk/nextjs';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

import { LogoutButton } from '@/src/components/shared/LogoutButton';
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
  useEffect(() => {
    const handleScroll = () => {
      isHeaderScrolledSignal.value = window.scrollY > 0;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        <div className='flex items-center'>
          <button
            className='ml-2 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 transition-shadow'
            aria-label='Account menu'
            tabIndex={0}
            type='button'
          >
            <UserButton afterSignOutUrl='/login' />
          </button>
          <LogoutButton
            className='ml-4 w-auto px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors'
            iconClassName='h-5 w-5 mr-2'
            textClassName='font-medium'
          />
        </div>
      </div>
    </header>
  );
}
