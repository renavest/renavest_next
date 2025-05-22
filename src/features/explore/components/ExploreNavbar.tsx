'use client';

import { UserButton } from '@clerk/nextjs';
import { ChevronLeft, Menu, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { LogoutButton } from '@/src/features/auth/components/auth/LogoutButton';
import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';

import {
  isHeaderScrolledSignal,
  isMobileMenuOpenSignal,
} from '../../employee-dashboard/state/dashboardState';

const MobileNavigation = () => (
  <div
    className={`
      md:hidden fixed inset-x-0 top-[57px] bg-white border-t border-gray-100
      transition-all duration-300 ease-in-out shadow-lg
      ${isMobileMenuOpenSignal.value ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}
    `}
  >
    <div className='p-4 space-y-2'>
      <div className='px-4 py-3 border-t border-gray-100 mt-3'>
        <LogoutButton
          className='w-full flex items-center justify-center space-x-2 text-red-600 hover:bg-red-50 p-2 rounded-md'
          iconClassName='h-5 w-5'
          textClassName='font-medium'
        />
      </div>
      <div className='px-4 py-3 flex items-center justify-center'>
        <span className='text-sm text-gray-500 mr-3'>Your Account</span>
        <UserButton afterSignOutUrl='/login' />
      </div>
    </div>
  </div>
);

const DesktopNavigation = () => (
  <div className='hidden md:flex items-center gap-3 lg:gap-4'>
    <div className='h-6 w-px bg-gray-200 mx-1'></div>
    {/* <span className='px-4 py-1 rounded-full bg-[#F3F0FF] text-[#9071FF] font-semibold text-sm shadow-sm mr-2'>
      400 credits left
    </span> */}
    <LogoutButton />
    <div className='ml-1 lg:ml-2'>
      <UserButton afterSignOutUrl='/login' />
    </div>
  </div>
);

export default function ExploreNavbar({
  pageTitle = 'Explore',
  showBackButton = false,
  additionalActions = null,
}: {
  pageTitle?: string;
  showBackButton?: boolean;
  additionalActions?: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      isHeaderScrolledSignal.value = window.scrollY > 0;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    isMobileMenuOpenSignal.value = !isMobileMenuOpenSignal.value;
  };

  const handleBackClick = () => {
    router.back();
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 backdrop-blur-sm border-b',
        isHeaderScrolledSignal.value ? 'border-gray-200 shadow-sm' : 'border-transparent',
        COLORS.WARM_WHITE.bg,
        'py-3 px-4 md:py-4 md:px-8 lg:px-20',
      )}
    >
      <div className='flex items-center justify-between max-w-7xl mx-auto'>
        {/* Logo and Title Container */}
        <div className='flex items-center'>
          {/* Optional Back Button */}
          {showBackButton && (
            <button
              onClick={handleBackClick}
              className='mr-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg border border-gray-200'
              aria-label='Back to Previous Page'
            >
              <ChevronLeft className='h-5 w-5' />
              <span className='text-sm font-medium hidden sm:inline'>Back</span>
            </button>
          )}

          {/* Logo */}
          <div className='relative flex-shrink-0 w-10 h-10 md:w-12 md:h-12'>
            <Image
              src='/renavestlogo.png'
              alt='Renavest Logo'
              fill
              sizes='(max-width: 768px) 40px, 48px'
              className='object-contain'
              priority
            />
          </div>

          {/* Dynamic Page Title */}
          <h1 className='ml-3 md:ml-4 text-xl md:text-2xl font-semibold text-gray-800 transition-all duration-300'>
            {pageTitle}
          </h1>
        </div>

        {/* Mobile Menu Button */}
        <div className='flex items-center space-x-2'>
          {/* Optional Additional Actions */}
          {additionalActions}

          <button
            onClick={toggleMobileMenu}
            className='md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
            aria-label={isMobileMenuOpenSignal.value ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpenSignal.value ? (
              <X className='h-6 w-6' />
            ) : (
              <Menu className='h-6 w-6' />
            )}
          </button>
        </div>

        {/* Desktop Navigation */}
        <DesktopNavigation />

        {/* Mobile Navigation */}
        <MobileNavigation />
      </div>
    </header>
  );
}
