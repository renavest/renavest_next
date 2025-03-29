'use client';
import { UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import { useState, useEffect } from 'react';

import { LogoutButton } from '@/src/components/shared/LogoutButton';
import { COLORS } from '@/src/styles/colors';

interface NavbarProps {
  title: string;
}

export default function Navbar({ title }: NavbarProps) {
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
        w-full
        z-50
        transition-all duration-300 ease-in-out
        ${COLORS.WARM_WHITE.bg} py-3 sm:py-4 px-4 sm:px-6 lg:px-8
        ${isScrolled ? 'shadow-md' : 'shadow-lg'}`}
    >
      <div className='max-w-7xl mx-auto flex items-center justify-between'>
        <div className='flex items-center space-x-2 sm:space-x-4'>
          <Image
            src='/renavestlogo.avif'
            alt='Renavest Logo'
            width={120}
            height={40}
            className='object-contain h-8 sm:h-10 w-auto'
          />
          <h1 className='text-lg sm:text-2xl font-semibold text-gray-800 transition-all duration-300'>
            {title}
          </h1>
        </div>
        <div className='flex items-center space-x-2'>
          <LogoutButton />
          <UserButton />
        </div>
      </div>
    </header>
  );
}
