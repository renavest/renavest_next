'use client';
import { LogOut } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

import { handleLogout } from '../../auth/utils/auth';

interface FloatingHeaderProps {
  title: string;
}

export default function FloatingHeader({ title }: FloatingHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 0);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Cleanup listener on component unmount
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
        bg-white py-3 sm:py-4 px-4 sm:px-6 lg:px-8
        ${isScrolled ? 'shadow-md' : 'shadow-lg'}`}
    >
      <div className='max-w-7xl mx-auto flex items-center justify-between'>
        <div className='flex items-center space-x-2 sm:space-x-4'>
          <Image
            src='/renavestlogo.avif'
            alt='Renavest Logo'
            width={40}
            height={40}
            className='w-8 h-8 sm:w-10 sm:h-10'
          />
          <h1 className='text-lg sm:text-2xl font-semibold text-gray-800 transition-all duration-300'>
            {title}
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className='flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm sm:text-base'
        >
          <LogOut className='h-4 w-4' />
          <span className='hidden sm:inline'>Logout</span>
        </button>
      </div>
    </header>
  );
}
