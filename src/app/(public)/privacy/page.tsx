'use client';

import { useUser } from '@clerk/nextjs';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { timezoneSignal } from '@/src/features/booking/components/TherapistAvailability/useTherapistAvailability';
import Navbar from '@/src/features/home/components/Navbar';
import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';
import { createDate } from '@/src/utils/timezone';

// Extract each section into its own component
const SecurityFrameworkSection = () => (
  <section className='bg-white rounded-2xl p-6 shadow-sm'>
    <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
      Enterprise-Grade Security Framework
    </h2>
    <div className='space-y-4'>
      {[
        'Comprehensive SOC 2 security principles implemented across our platform',
        'Rigorous focus on Security, Confidentiality, and Processing Integrity',
        'Security-first approach embedded in our development lifecycle',
      ].map((text, index) => (
        <div key={index} className='flex items-start space-x-3'>
          <span
            className={cn('inline-block w-2 h-2 mt-2 rounded-full', COLORS.WARM_PURPLE['10'])}
          ></span>
          <p className='text-gray-600'>{text}</p>
        </div>
      ))}
    </div>
  </section>
);

const FinancialDataProtectionSection = () => (
  <section className='bg-white rounded-2xl p-6 shadow-sm'>
    <h2 className='text-2xl font-semibold text-gray-800 mb-4'>Financial Data Protection</h2>
    <div className='space-y-4'>
      {[
        'End-to-end encryption for all financial and personal data',
        'Secure ingestion pipeline with multi-layered protection',
        'Role-based access controls to limit data exposure',
      ].map((text, index) => (
        <div key={index} className='flex items-start space-x-3'>
          <span
            className={cn('inline-block w-2 h-2 mt-2 rounded-full', COLORS.WARM_PURPLE['10'])}
          ></span>
          <p className='text-gray-600'>{text}</p>
        </div>
      ))}
    </div>
  </section>
);

const SecurityInfrastructureSection = () => (
  <section className='bg-white rounded-2xl p-6 shadow-sm'>
    <h2 className='text-2xl font-semibold text-gray-800 mb-4'>Security Infrastructure</h2>
    <div className='space-y-4'>
      {[
        'AWS-native security services powering our entire infrastructure',
        'Clerk for robust authentication and identity management',
        'AWS KMS for secure encryption key management',
        'S3 with default encryption for secure data storage',
        'AWS CloudTrail for comprehensive security audit logging',
      ].map((text, index) => (
        <div key={index} className='flex items-start space-x-3'>
          <span
            className={cn('inline-block w-2 h-2 mt-2 rounded-full', COLORS.WARM_PURPLE['10'])}
          ></span>
          <p className='text-gray-600'>{text}</p>
        </div>
      ))}
    </div>
  </section>
);

const EnterpriseReadinessSection = () => (
  <section className='bg-white rounded-2xl p-6 shadow-sm'>
    <h2 className='text-2xl font-semibold text-gray-800 mb-4'>Enterprise Readiness</h2>
    <div className='space-y-4'>
      {[
        'Comprehensive security questionnaires available upon request',
        'Clear escalation path for security concerns',
        'Founder-level commitment to enterprise security requirements',
        'Customizable data retention policies for compliance needs',
      ].map((text, index) => (
        <div key={index} className='flex items-start space-x-3'>
          <span
            className={cn('inline-block w-2 h-2 mt-2 rounded-full', COLORS.WARM_PURPLE['10'])}
          ></span>
          <p className='text-gray-600'>{text}</p>
        </div>
      ))}
    </div>
  </section>
);

const ContactSection = () => (
  <section className='text-center'>
    <p className='text-sm text-gray-500 italic'>
      Last Updated: {createDate(new Date().toISOString(), timezoneSignal.value).toLocaleString()}
    </p>
    <p className='mt-4 text-sm text-gray-600'>
      For any security inquiries, please contact:
      <a href='mailto:hello@renavestapp.com' className='ml-2 text-purple-600 hover:underline'>
        hello@renavestapp.com
      </a>
    </p>
  </section>
);

export default function PrivacyPage() {
  const { user, isLoaded } = useUser();

  // Determine the back navigation path
  // TODO: Create a more robust way to determine default dashboard based on user role
  const backPath =
    isLoaded && user
      ? (() => {
          // If no role metadata is set, default to employee dashboard
          const role = (user.publicMetadata?.role as string | undefined) || 'employee';
          switch (role) {
            case 'employer':
              return '/employer/dashboard';
            case 'therapist':
              return '/therapist/dashboard';
            default:
              return '/employee';
          }
        })()
      : '/employee'; // Default to employee dashboard for logged-in users without explicit routing

  return (
    <div className={`min-h-screen ${COLORS.WARM_WHITE.bg} font-sans`}>
      <Navbar />
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-20'>
        <Link
          href={backPath}
          className='inline-flex items-center text-gray-600 hover:text-gray-800 mb-6'
        >
          <ChevronLeft className='h-5 w-5 mr-2' />
          <span>Back</span>
        </Link>
        <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center'>
          Privacy & Security Policy
        </h1>

        <div className='space-y-8'>
          <SecurityFrameworkSection />
          <FinancialDataProtectionSection />
          <SecurityInfrastructureSection />
          <EnterpriseReadinessSection />
          <ContactSection />
        </div>
      </main>
    </div>
  );
}
