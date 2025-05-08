import Link from 'next/link';
import posthog from 'posthog-js';

import { ctaTextSignal } from '@/src/features/home/state/ctaSignals';
import { isEmployeeSignal } from '@/src/features/home/state/ctaSignals';

export default function CTAButton() {
  const trackCtaClick = (ctaType: string, isMobile: boolean = false) => {
    if (typeof window !== 'undefined') {
      posthog.capture('navbar_cta_clicked', {
        cta_type: ctaType,
        cta_text: ctaType === 'primary' ? ctaTextSignal.value : 'Sign In',
        device_type: isMobile ? 'mobile' : 'desktop',
        position: 'navbar',
        url: window.location.href,
      });
    }
  };
  return (
    <>
      {!isEmployeeSignal.value ? (
        <a
          href='https://calendly.com/rameau-stan/one-on-one'
          target='_blank'
          rel='noopener noreferrer'
          onClick={() => trackCtaClick('primary')}
        >
          <button className='px-2 py-1 xl:px-6 xl:py-2.5 bg-[#9071FF] text-white rounded-full hover:bg-[#9071FF]/90 transition font-medium text-sm lg:text-lg'>
            {ctaTextSignal.value}
          </button>
        </a>
      ) : (
        <Link href='/login' onClick={() => trackCtaClick('primary')}>
          <button className='px-2 py-1 xl:px-6 xl:py-2.5 bg-[#9071FF] text-white rounded-full hover:bg-[#9071FF]/90 transition font-medium text-sm lg:text-lg'>
            {ctaTextSignal.value}
          </button>
        </Link>
      )}
    </>
  );
}
