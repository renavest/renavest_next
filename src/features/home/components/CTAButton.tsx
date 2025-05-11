import Link from 'next/link';
import posthog from 'posthog-js';

import { ctaTextSignal, isEmployeeSignal } from '../../utm/utmCustomDemo';

export default function CTAButton({ className }: { className?: string }) {
  const trackCtaClick = (ctaType: string, isMobile: boolean = false) => {
    if (typeof window !== 'undefined') {
      posthog.capture('landing_page_cta_clicked', {
        cta_type: ctaType,
        cta_text: ctaType === 'primary' ? ctaTextSignal.value : 'Sign In',
        device_type: isMobile ? 'mobile' : 'desktop',
        position: 'landing_page',
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
          <button className={`${className}`}>{ctaTextSignal.value}</button>
        </a>
      ) : (
        <Link href='/login' onClick={() => trackCtaClick('primary')}>
          <button className={`${className}`}>{ctaTextSignal.value}</button>
        </Link>
      )}
    </>
  );
}
