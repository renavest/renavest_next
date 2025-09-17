'use client';

import { useUser } from '@clerk/nextjs';
import { Menu, Users, TrendingUp, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import posthog from 'posthog-js';
import { useEffect, useState } from 'react';

import { ctaTextSignal } from '@/src/features/utm/utmCustomDemo';

import CTAButton from '../interactive/CTAButton';

const getHeaderClassName = (isHeaderScrolled: boolean) => `
  fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm
  ${
    isHeaderScrolled
      ? 'border-gray-200 shadow-md mx-4 md:mx-8 mt-3 rounded-full border'
      : 'border-transparent border-b'
  }
  py-4 px-6 md:px-10 lg:px-20
  transition-all duration-300 ease-in-out
`;

// Track navigation clicks
const trackNavClick = (
  link_name: string,
  is_mobile: boolean = false,
  userContext: { user_id?: string; company_id?: string } = {},
) => {
  if (typeof window !== 'undefined') {
    posthog.capture('navigation:link_clicked_v1', {
      link_name,
      device_type: is_mobile ? 'mobile' : 'desktop',
      url: window.location.href,
      ...userContext,
    });
  }
};

// Track CTA clicks

// Desktop Navigation Component
const DesktopNavigation = ({ isSignedIn }: { isSignedIn: boolean }) => (
  <div className='hidden lg:flex items-center gap-4 xl:gap-8'>
    <Link
      href='#what-we-do'
      className='text-gray-600 hover:text-[#9071FF] font-medium text-sm truncate'
      onClick={() => trackNavClick('what_we_do')}
    >
      How it works
    </Link>
    <Link
      href='#what-is-financial-therapy'
      className='text-gray-600 hover:text-[#9071FF] font-medium text-sm truncate'
      onClick={() => trackNavClick('what_is_financial_therapy')}
    >
      What is financial therapy?
    </Link>
    <Link
      href='#business-impact'
      className='text-gray-600 hover:text-[#9071FF] font-medium text-sm truncate'
      onClick={() => trackNavClick('business_impact')}
    >
      Partner with us
    </Link>
    {/* <Link
      href='/pricing'
      className='text-gray-600 hover:text-[#9071FF] font-medium text-sm truncate'
      onClick={() => trackNavClick('pricing')}
    >
      Pricing
    </Link> */}
    {/* Button Group */}
    <div className='flex items-center gap-3'>
      {isSignedIn ? (
        <Link href='/auth-check' onClick={() => trackNavClick('dashboard')}>
          <button className='px-6 py-2 xl:px-6 xl:py-2.5 bg-[#9071FF] text-white rounded-full hover:bg-[#9071FF]/90 transition font-medium text-sm lg:text-lg'>
            Dashboard
          </button>
        </Link>
      ) : (
        <>
          <Link href='/login' onClick={() => trackNavClick('secondary')}>
            <button className='px-6 py-1 xl:px-6 xl:py-2.5 border border-[#9071FF] text-[#9071FF] bg-transparent rounded-full hover:bg-[#9071FF]/10 transition font-medium text-sm lg:text-lg'>
              Sign In
            </button>
          </Link>
          <CTAButton className='px-6 py-2 xl:px-6 xl:py-2.5 bg-[#9071FF] text-white rounded-full hover:bg-[#9071FF]/90 transition font-medium text-sm lg:text-lg' />
        </>
      )}
    </div>
  </div>
);

// Extract mobile navigation links to a separate component
const MobileNavLinks = ({ onClose, isSignedIn }: { onClose: () => void; isSignedIn: boolean }) => (
  <div className='p-4 sm:p-6 space-y-4 '>
    <MobileNavLink
      href='#jasmine-journey'
      icon={<Users className='h-5 w-5 text-[#9071FF]' />}
      label='How it works'
      onClose={onClose}
    />
    <MobileNavLink
      href='#what-is-financial-therapy'
      icon={<Users className='h-5 w-5 text-[#9071FF]' />}
      label='What is financial therapy?'
      onClose={onClose}
    />
    <MobileNavLink
      href='#business-impact'
      icon={<TrendingUp className='h-5 w-5 text-[#9071FF]' />}
      label='Partner with us'
      onClose={onClose}
    />
    {/* <MobileNavLink
      href='/pricing'
      icon={<Coins className='h-5 w-5 text-[#9071FF]' />}
      label='Pricing'
      onClose={onClose}
    /> */}

    {/* Mobile Action Buttons */}
    <div className='pt-4 border-t border-gray-100 mt-2 space-y-3'>
      {isSignedIn ? (
        <Link
          href='/auth-check'
          className='flex items-center justify-center px-4 py-3 bg-[#9071FF] text-white rounded-lg w-full min-h-[44px]'
          onClick={() => {
            trackNavClick('dashboard', true);
            onClose();
          }}
        >
          Dashboard
        </Link>
      ) : (
        <>
          <Link
            href='/login'
            className='flex items-center justify-center px-4 py-3 border border-[#9071FF] text-[#9071FF] bg-transparent rounded-lg w-full hover:bg-[#9071FF]/10 transition text-base font-medium min-h-[44px]'
            onClick={() => {
              trackNavClick('secondary', true);
              onClose();
            }}
          >
            Sign In
          </Link>
          <a
            href='https://calendly.com/rameau-stan/one-on-one'
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center justify-center px-4 py-3 bg-[#9071FF] text-white rounded-lg w-full min-h-[44px]'
            onClick={() => trackNavClick('primary', true)}
          >
            <span className='text-base font-medium'>{ctaTextSignal.value}</span>
          </a>
        </>
      )}
    </div>
  </div>
);

// Reusable mobile navigation link component
const MobileNavLink = ({
  href,
  icon,
  label,
  onClose,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClose: () => void;
}) => (
  <Link
    href={href}
    className='flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors w-full group min-h-[44px] text-base sm:text-lg'
    onClick={() => {
      trackNavClick(href.replace('#', ''), true);
      onClose();
    }}
  >
    {icon}
    <span className='group-hover:text-[#9071FF] transition'>{label}</span>
  </Link>
);

function Navbar() {
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isSignedIn } = useUser();
  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);

    // Track mobile menu toggle
    if (typeof window !== 'undefined') {
      posthog.capture('mobile_menu_toggled', {
        action: !isMobileMenuOpen ? 'opened' : 'closed',
        url: window.location.href,
      });
    }
  };

  return (
    <header className={getHeaderClassName(isHeaderScrolled)}>
      <div className='flex items-center justify-between max-w-7xl mx-auto'>
        {/* Logo and Title Container */}
        <div className='flex items-center'>
          {/* Logo */}
          <div className='relative flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12'>
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
          <h1 className='ml-2 sm:ml-3 md:ml-4 text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 transition-all duration-300 hover:text-[#9071FF]'>
            Renavest
          </h1>
        </div>

        {/* Desktop Navigation */}
        <DesktopNavigation isSignedIn={!!isSignedIn} />

        {/* Mobile Menu Button */}
        <div className='flex items-center space-x-2 lg:hidden'>
          <button
            onClick={toggleMobileMenu}
            className='p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors group min-h-[44px] min-w-[44px]'
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? (
              <X className='h-6 w-6 text-[#9071FF]' />
            ) : (
              <Menu className='h-6 w-6 group-hover:text-[#9071FF]' />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`
          lg:hidden fixed inset-x-0 top-[120px] sm:top-[100px]
          bg-white border-t border-gray-100
          transition-all duration-300 ease-in-out shadow-lg
          ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}
          max-h-[calc(100vh-70px)] sm:max-h-[calc(100vh-80px)] overflow-y-auto
          rounded-b-2xl
        `}
      >
        <MobileNavLinks onClose={() => setIsMobileMenuOpen(false)} isSignedIn={!!isSignedIn} />
      </div>
    </header>
  );
}

export default Navbar;
