'use client';

import { LogOut, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

import { handleLogout } from '../../auth/utils/auth';
import { isHeaderScrolledSignal } from '../state/dashboardState';

export default function DashboardHeader() {
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      isHeaderScrolledSignal.value = scrollPosition > 0;
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 
        z-50
        transition-all duration-300 ease-in-out
        bg-[#faf9f6] py-6 px-20
        ${isHeaderScrolledSignal.value ? 'shadow-md' : 'shadow-lg'}`}
    >
      <div style={{ maxWidth: '1500px' }} className='flex mx-auto items-center'>
        <div className='flex'>
          <Image
            className='mr-4'
            src='/renavestlogo.avif'
            alt='Renavest Logo'
            width={50}
            height={50}
          />
          <h1
            className={`
              text-2xl font-semibold
              transition-all duration-300
              text-gray-800
            `}
          >
            Dashboard
          </h1>
        </div>
        <div className='flex flex-1' />
        <div className='flex items-center gap-4'>
          <Link
            href='/home'
            className='flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <Users className='h-4 w-4' />
            <span>Find Therapists</span>
          </Link>
          <button
            onClick={handleLogout}
            className='flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <LogOut className='h-4 w-4' />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
