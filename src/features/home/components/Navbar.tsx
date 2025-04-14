'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { Menu, Users, X, Shield, DollarSign, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

import { LogoutButton } from '@/src/components/shared/LogoutButton';
import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';

import {
  isHeaderScrolledSignal,
  isMobileMenuOpenSignal,
} from '../../employee-dashboard/state/dashboardState';

// Extract common navigation items into a separate component
const NavigationItem = ({
  href,
  icon: Icon,
  label,
  isMobile = false,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isMobile?: boolean;
}) => (
  <Link
    href={href}
    className={cn(
      'flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors',
      'group hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500',
      isMobile && 'w-full py-3 hover:bg-gray-50',
    )}
  >
    <Icon
      className={cn(
        isMobile ? 'h-5 w-5' : 'h-4 w-4',
        'text-gray-500 group-hover:text-primary-600 transition-colors',
      )}
    />
    <span className={isMobile ? 'text-base' : 'text-sm font-medium'}>{label}</span>
  </Link>
);

// Mobile Navigation Component
const MobileNavigation = ({ isSignedIn }: { isSignedIn: boolean }) => (
  <div
    className={`
      md:hidden fixed inset-x-0 top-[57px] bg-white border-t border-gray-100
      transition-all duration-300 ease-in-out shadow-lg
      ${isMobileMenuOpenSignal.value ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}
    `}
  >
    <div className='p-4 space-y-2'>
      <NavigationItem href='/explore' icon={Users} label='Find Therapists' isMobile />
      <NavigationItem href='/pricing' icon={DollarSign} label='Pricing' isMobile />
      <NavigationItem href='/privacy' icon={Shield} label='Privacy & Security' isMobile />

      {isSignedIn && (
        <>
          <div className='px-4 py-3 border-t border-gray-100 mt-3'>
            <LogoutButton
              className='w-full flex items-center justify-center space-x-2 text-red-600 hover:bg-red-50 p-2 rounded-md'
              iconClassName='h-5 w-5'
              textClassName='font-medium'
            />
          </div>
          <div className='px-4 py-3 flex items-center'>
            <span className='text-sm text-gray-500 mr-3'>Your Account</span>
            <UserButton afterSignOutUrl='/login' />
          </div>
        </>
      )}
    </div>
  </div>
);

// Desktop Navigation Component
const DesktopNavigation = ({ isSignedIn }: { isSignedIn: boolean }) => (
  <div className='hidden md:flex items-center gap-3 lg:gap-4'>
    <NavigationItem href='/explore' icon={Users} label='Find Therapists' />
    <NavigationItem href='/pricing' icon={DollarSign} label='Pricing' />
    <NavigationItem href='/privacy' icon={Shield} label='Privacy & Security' />

    {isSignedIn && (
      <>
        <div className='h-6 w-px bg-gray-200 mx-1'></div>
        <LogoutButton />
        <div className='ml-1 lg:ml-2'>
          <UserButton afterSignOutUrl='/login' />
        </div>
      </>
    )}
  </div>
);

export default function DashboardHeader({
  pageTitle = 'Dashboard',
  showBackButton = false,
  additionalActions = null,
}: {
  pageTitle?: string;
  showBackButton?: boolean;
  additionalActions?: React.ReactNode;
}) {
  const { isSignedIn = false } = useUser();

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

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 backdrop-blur-sm border-b',
        isHeaderScrolledSignal.value ? 'border-gray-200 shadow-sm' : 'border-transparent',
        COLORS.WARM_WHITE.bg,
        'py-3 px-4 md:py-4 md:px-8 lg:px-20',
        'transition-all duration-300 ease-in-out', // Added smooth transition
      )}
    >
      <div className='flex items-center justify-between max-w-7xl mx-auto'>
        {/* Logo and Title Container */}
        <div className='flex items-center'>
          {/* Optional Back Button */}
          {showBackButton && (
            <Link
              href='/dashboard'
              className='mr-3 text-gray-600 hover:text-gray-800 transition-colors group'
            >
              <ChevronLeft className='h-6 w-6 group-hover:text-primary-600' />
            </Link>
          )}

          {/* Logo */}
          <div className='relative flex-shrink-0 w-10 h-10 md:w-12 md:h-12'>
            <Image
              src='/renavestlogo.avif'
              alt='Renavest Logo'
              fill
              sizes='(max-width: 768px) 40px, 48px'
              className='object-contain hover:scale-105 transition-transform'
              priority
            />
          </div>

          {/* Dynamic Page Title */}
          <h1 className='ml-3 md:ml-4 text-xl md:text-2xl font-semibold text-gray-800 transition-all duration-300 hover:text-primary-600'>
            {pageTitle}
          </h1>
        </div>

        {/* Mobile Menu Button */}
        <div className='flex items-center space-x-2'>
          {/* Optional Additional Actions */}
          {additionalActions}

          <button
            onClick={toggleMobileMenu}
            className='md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors group'
            aria-label={isMobileMenuOpenSignal.value ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpenSignal.value ? (
              <X className='h-6 w-6 group-hover:text-primary-600' />
            ) : (
              <Menu className='h-6 w-6 group-hover:text-primary-600' />
            )}
          </button>
        </div>

        {/* Desktop Navigation */}
        <DesktopNavigation isSignedIn={isSignedIn} />

        {/* Mobile Navigation */}
        <MobileNavigation isSignedIn={isSignedIn} />
      </div>
    </header>
  );
}
