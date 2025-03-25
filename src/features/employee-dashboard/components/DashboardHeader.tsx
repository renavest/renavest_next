'use client';

import { UserButton, useClerk } from '@clerk/nextjs';
import { LogOut, Menu, Users, X, Shield } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';

import { isHeaderScrolledSignal, isMobileMenuOpenSignal } from '../state/dashboardState';

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
      isMobile && 'w-full py-3 hover:bg-gray-50',
    )}
  >
    <Icon className={isMobile ? 'h-5 w-5' : 'h-4 w-4'} />
    <span>{label}</span>
  </Link>
);

export default function DashboardHeader() {
  const { signOut } = useClerk();
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

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 backdrop-blur-sm',
        COLORS.WARM_WHITE.bg,
        'py-4 px-4 md:py-6 md:px-20',
      )}
    >
      <div className='flex items-center justify-between max-w-7xl mx-auto'>
        {/* Logo */}
        <div className='flex items-center'>
          <Image
            className='mr-2 md:mr-4 w-10 h-10 md:w-[50px] md:h-[50px]'
            src='/renavestlogo.avif'
            alt='Renavest Logo'
            width={50}
            height={50}
          />
          <h1 className='text-xl md:text-2xl font-semibold text-gray-800 transition-all duration-300'>
            Dashboard
          </h1>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className='md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
        >
          {isMobileMenuOpenSignal.value ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
        </button>

        {/* Desktop Navigation */}
        <div className='hidden md:flex items-center gap-4'>
          <NavigationItem href='/home' icon={Users} label='Find Therapists' />
          <NavigationItem href='/privacy' icon={Shield} label='Privacy & Security' />
          <button
            onClick={handleLogout}
            className='flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <LogOut className='h-4 w-4' />
            <span>Logout</span>
          </button>
          <div className='ml-2'>
            <UserButton afterSignOutUrl='/login' />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`
            md:hidden fixed inset-x-0 top-[72px] bg-white border-t border-gray-100
            transition-all duration-300 ease-in-out
            ${isMobileMenuOpenSignal.value ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
          `}
        >
          <div className='p-4 space-y-2'>
            <NavigationItem href='/explore' icon={Users} label='Find Therapists' isMobile />
            <NavigationItem href='/privacy' icon={Shield} label='Privacy & Security' isMobile />
            <button
              onClick={handleLogout}
              className='flex items-center gap-2 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors w-full'
            >
              <LogOut className='h-5 w-5' />
              <span>Logout</span>
            </button>
            <div className='px-4 py-3'>
              <UserButton afterSignOutUrl='/login' />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
