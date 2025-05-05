'use client';

import { Menu, Users, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { ctaTextSignal } from '@/src/features/home/state/ctaSignals';

function Navbar() {
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm
        ${
          isHeaderScrolled
            ? 'border-gray-200 shadow-md mx-4 md:mx-8 mt-3 rounded-full border'
            : 'border-transparent border-b'
        }
        py-4 px-6 md:px-10 lg:px-20
        transition-all duration-300 ease-in-out
      `}
    >
      <div className='flex items-center justify-between max-w-7xl mx-auto'>
        {/* Logo and Title Container */}
        <div className='flex items-center'>
          {/* Logo */}
          <div className='relative flex-shrink-0 w-10 h-10 md:w-12 md:h-12'>
            <Image
              src='/renavestlogo.png'
              alt='Renavest Logo'
              width={48}
              height={48}
              className='object-contain'
              priority
            />
          </div>

          {/* Page Title */}
          <h1 className='ml-3 md:ml-4 text-xl md:text-2xl font-semibold text-gray-800 transition-all duration-300 hover:text-[#9071FF]'>
            Renavest
          </h1>
        </div>

        {/* Desktop Navigation */}
        <div className='hidden md:flex items-center gap-8'>
          <Link
            href='#jasmine-journey'
            className='text-gray-600 hover:text-[#9071FF] font-medium text-sm'
          >
            Employee Journey
          </Link>
          <Link
            href='#business-impact'
            className='text-gray-600 hover:text-[#9071FF] font-medium text-sm'
          >
            Business Impact
          </Link>
          {/* Button Group */}
          <div className='flex items-center gap-3'>
            <Link href='/login'>
              <button className='px-6 py-2.5 border border-[#9071FF] text-[#9071FF] bg-transparent rounded-full hover:bg-[#9071FF]/10 transition font-medium text-sm'>
                Sign In
              </button>
            </Link>
            <a
              href='https://calendly.com/rameau-stan/one-on-one'
              target='_blank'
              rel='noopener noreferrer'
            >
              <button className='px-6 py-2.5 bg-[#9071FF] text-white rounded-full hover:bg-[#9071FF]/90 transition font-medium text-sm'>
                {ctaTextSignal.value}
              </button>
            </a>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className='flex items-center space-x-2 md:hidden'>
          <button
            onClick={toggleMobileMenu}
            className='p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors group'
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <Menu className='h-6 w-6 group-hover:text-[#9071FF]' />
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`
          md:hidden fixed inset-x-0 top-[65px] bg-white border-t border-gray-100
          transition-all duration-300 ease-in-out shadow-lg
          ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}
        `}
      >
        <div className='p-6 space-y-4'>
          <Link
            href='#jasmine-journey'
            className='flex items-center gap-2 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors w-full'
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Users className='h-5 w-5 text-[#9071FF]' />
            <span className='text-base'>Employee Journey</span>
          </Link>
          <Link
            href='#business-impact'
            className='flex items-center gap-2 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors w-full'
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <TrendingUp className='h-5 w-5 text-[#9071FF]' />
            <span className='text-base'>Business Impact</span>
          </Link>
          {/* Sign In Button */}
          <div className='pt-4 border-t border-gray-100 mt-2'>
            <Link
              href='/login'
              className='flex items-center justify-center px-4 py-3 border border-[#9071FF] text-[#9071FF] bg-transparent rounded-lg w-full hover:bg-[#9071FF]/10 transition text-base font-medium mb-3'
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign In
            </Link>
            <a
              href='https://calendly.com/rameau-stan/one-on-one'
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center justify-center px-4 py-3 bg-[#9071FF] text-white rounded-lg w-full'
            >
              <span className='text-base font-medium'>{ctaTextSignal.value}</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
