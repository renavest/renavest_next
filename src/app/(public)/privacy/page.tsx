'use client';

import { useUser } from '@clerk/nextjs';
import { ChevronLeft, Download } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { getRouteForRole, getUserRoleFromUser } from '@/src/features/auth/utils/routerUtil';
import Navbar from '@/src/features/home/components/Navbar';
import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';
import { createDate } from '@/src/utils/timezone';

// Extract each section into its own component
const SecurityFrameworkSection = () => (
  <section className='bg-gradient-to-br from-purple-50 to-white rounded-3xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300'>
    <h2 className='text-2xl font-bold text-gray-900 mb-4 flex items-center'>
      <span className='mr-3 text-[#9071FF]'>🛡️</span>
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
            className={cn('inline-block w-3 h-3 mt-2 rounded-full', COLORS.WARM_PURPLE['10'])}
          ></span>
          <p className='text-gray-700 text-base'>{text}</p>
        </div>
      ))}
    </div>
  </section>
);

const FinancialDataProtectionSection = () => (
  <section className='bg-gradient-to-br from-purple-50 to-white rounded-3xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300'>
    <h2 className='text-2xl font-bold text-gray-900 mb-4 flex items-center'>
      <span className='mr-3 text-[#9071FF]'>💳</span>
      Financial Data Protection
    </h2>
    <div className='space-y-4'>
      {[
        'End-to-end encryption for all financial and personal data',
        'Secure ingestion pipeline with multi-layered protection',
        'Role-based access controls to limit data exposure',
      ].map((text, index) => (
        <div key={index} className='flex items-start space-x-3'>
          <span
            className={cn('inline-block w-3 h-3 mt-2 rounded-full', COLORS.WARM_PURPLE['10'])}
          ></span>
          <p className='text-gray-700 text-base'>{text}</p>
        </div>
      ))}
    </div>
  </section>
);

const SecurityInfrastructureSection = () => (
  <section className='bg-gradient-to-br from-purple-50 to-white rounded-3xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300'>
    <h2 className='text-2xl font-bold text-gray-900 mb-4 flex items-center'>
      <span className='mr-3 text-[#9071FF]'>🌐</span>
      Security Infrastructure
    </h2>
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
            className={cn('inline-block w-3 h-3 mt-2 rounded-full', COLORS.WARM_PURPLE['10'])}
          ></span>
          <p className='text-gray-700 text-base'>{text}</p>
        </div>
      ))}
    </div>
  </section>
);

const EnterpriseReadinessSection = () => (
  <section className='bg-gradient-to-br from-purple-50 to-white rounded-3xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300'>
    <h2 className='text-2xl font-bold text-gray-900 mb-4 flex items-center'>
      <span className='mr-3 text-[#9071FF]'>🏢</span>
      Enterprise Readiness
    </h2>
    <div className='space-y-4'>
      {[
        'Comprehensive security questionnaires available upon request',
        'Clear escalation path for security concerns',
        'Founder-level commitment to enterprise security requirements',
        'Customizable data retention policies for compliance needs',
      ].map((text, index) => (
        <div key={index} className='flex items-start space-x-3'>
          <span
            className={cn('inline-block w-3 h-3 mt-2 rounded-full', COLORS.WARM_PURPLE['10'])}
          ></span>
          <p className='text-gray-700 text-base'>{text}</p>
        </div>
      ))}
    </div>
  </section>
);

const ContactSection = () => {
  const [showPdf, setShowPdf] = React.useState(false);

  return (
    <section className='text-center bg-purple-50 rounded-3xl p-6 shadow-md'>
      <p className='text-sm text-gray-500 italic mb-2'>
        Last Updated: {createDate().toLocaleString()}
      </p>
      <p className='text-sm text-gray-600 mb-4'>
        For any security inquiries, please contact:
        <a href='mailto:hello@renavestapp.com' className='ml-2 text-[#9071FF] hover:underline'>
          hello@renavestapp.com
        </a>
      </p>

      {showPdf ? (
        <div className='w-full mb-4'>
          <div className='relative w-full rounded-lg overflow-hidden' style={{ height: '70vh' }}>
            <iframe
              src='https://drive.google.com/file/d/19LQ5FYIEeLBNXe6ocegDrq6PRnFucRTe/preview'
              className='w-full h-full'
              allow='autoplay'
              title='Privacy Policy PDF'
            />
          </div>
          <button
            onClick={() => setShowPdf(false)}
            className='mt-4 inline-flex items-center px-6 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors'
          >
            Hide PDF
          </button>
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center'>
          <button
            onClick={() => setShowPdf(true)}
            className='inline-flex items-center px-6 py-2 bg-[#9071FF] text-white rounded-full hover:bg-[#9071FF]/90 transition-colors mb-3'
          >
            View Full Privacy Policy PDF
          </button>
          <a
            href='https://drive.google.com/file/d/19LQ5FYIEeLBNXe6ocegDrq6PRnFucRTe/view?usp=sharing'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center px-6 py-2 border border-[#9071FF] text-[#9071FF] rounded-full hover:bg-[#9071FF]/10 transition-colors'
          >
            <Download className='h-5 w-5 mr-2' />
            Download PDF
          </a>
        </div>
      )}
    </section>
  );
};

export default function PrivacyPage() {
  const { user, isLoaded } = useUser();

  // Determine the back navigation path using the new utilities
  const backPath = isLoaded && user ? getRouteForRole(getUserRoleFromUser(user)) : '/employee';

  return (
    <div className={`min-h-screen ${COLORS.WARM_WHITE.bg} font-sans`}>
      <Navbar />
      <main className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24'>
        <div className='flex items-center justify-between mb-8'>
          <Link
            href={backPath}
            className='inline-flex items-center text-gray-600 hover:text-gray-800'
          >
            <ChevronLeft className='h-5 w-5 mr-2' />
            <span>Back</span>
          </Link>
          <div className='text-sm text-gray-500 italic'>Version 1.0</div>
        </div>
        <h1 className='text-4xl sm:text-5xl font-bold text-gray-900 mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#9071FF] to-purple-600'>
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
