'use client';

import React from 'react';

import PageLayout from '@/src/components/PageLayout';
import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';

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
    <p className='text-sm text-gray-500 italic'>Last Updated: {new Date().toLocaleDateString()}</p>
    <p className='mt-4 text-sm text-gray-600'>
      For any security inquiries, please contact:
      <a href='mailto:security@renavest.com' className='ml-2 text-purple-600 hover:underline'>
        security@renavest.com
      </a>
    </p>
  </section>
);

export default function PrivacyPage() {
  return (
    <PageLayout title='Renavest' backButtonHref='/'>
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
    </PageLayout>
  );
}
