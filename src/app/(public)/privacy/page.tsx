'use client';

import React from 'react';

import FloatingHeader from '@/src/features/home/components/Navbar';
import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';

export default function PrivacyPage() {
  return (
    <div className='min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)]'>
      <FloatingHeader title='Renavest' />

      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center'>
          Privacy & Security Policy
        </h1>

        <div className='space-y-8'>
          <section className='bg-white rounded-2xl p-6 shadow-sm'>
            <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
              Enterprise-Grade Security Framework
            </h2>
            <div className='space-y-4'>
              <div className='flex items-start space-x-3'>
                <span
                  className={cn('inline-block w-2 h-2 mt-2 rounded-full', COLORS.WARM_PURPLE['10'])}
                ></span>
                <p className='text-gray-600'>
                  Comprehensive SOC 2 security principles implemented across our platform
                </p>
              </div>
              <div className='flex items-start space-x-3'>
                <span
                  className={cn('inline-block w-2 h-2 mt-2 rounded-full', COLORS.WARM_PURPLE['10'])}
                ></span>
                <p className='text-gray-600'>
                  Rigorous focus on Security, Confidentiality, and Processing Integrity
                </p>
              </div>
              <div className='flex items-start space-x-3'>
                <span
                  className={cn('inline-block w-2 h-2 mt-2 rounded-full', COLORS.WARM_PURPLE['10'])}
                ></span>
                <p className='text-gray-600'>
                  Security-first approach embedded in our development lifecycle
                </p>
              </div>
            </div>
          </section>

          <section className='bg-white rounded-2xl p-6 shadow-sm'>
            <h2 className='text-2xl font-semibold text-gray-800 mb-4'>Financial Data Protection</h2>
            <div className='space-y-4'>
              <div className='flex items-start space-x-3'>
                <span
                  className={cn('inline-block w-2 h-2 mt-2 rounded-full', COLORS.WARM_PURPLE['10'])}
                ></span>
                <p className='text-gray-600'>
                  End-to-end encryption for all financial and personal data
                </p>
              </div>
              <div className='flex items-start space-x-3'>
                <span
                  className={cn('inline-block w-2 h-2 mt-2 rounded-full', COLORS.WARM_PURPLE['10'])}
                ></span>
                <p className='text-gray-600'>
                  Secure ingestion pipeline with multi-layered protection
                </p>
              </div>
              <div className='flex items-start space-x-3'>
                <span
                  className={cn('inline-block w-2 h-2 mt-2 rounded-full', COLORS.WARM_PURPLE['10'])}
                ></span>
                <p className='text-gray-600'>Role-based access controls to limit data exposure</p>
              </div>
            </div>
          </section>

          <section className='bg-white rounded-2xl p-6 shadow-sm'>
            <h2 className='text-2xl font-semibold text-gray-800 mb-4'>Security Infrastructure</h2>
            <div className='space-y-4'>
              <div className='flex items-start space-x-3'>
                <span
                  className={cn('inline-block w-2 h-2 mt-2 rounded-full', COLORS.WARM_PURPLE['10'])}
                ></span>
                <p className='text-gray-600'>
                  AWS-native security services powering our entire infrastructure
                </p>
              </div>
              <div className='flex items-start space-x-3'>
                <span
                  className={cn('inline-block w-2 h-2 mt-2 rounded-full', COLORS.WARM_PURPLE['10'])}
                ></span>
                <p className='text-gray-600'>
                  Clerk for robust authentication and identity management
                </p>
              </div>
              <div className='flex items-start space-x-3'>
                <span
                  className={cn('inline-block w-2 h-2 mt-2 rounded-full', COLORS.WARM_PURPLE['10'])}
                ></span>
                <p className='text-gray-600'>AWS KMS for secure encryption key management</p>
              </div>
              <div className='flex items-start space-x-3'>
                <span
                  className={cn('inline-block w-2 h-2 mt-2 rounded-full', COLORS.WARM_PURPLE['10'])}
                ></span>
                <p className='text-gray-600'>S3 with default encryption for secure data storage</p>
              </div>
              <div className='flex items-start space-x-3'>
                <span
                  className={cn('inline-block w-2 h-2 mt-2 rounded-full', COLORS.WARM_PURPLE['10'])}
                ></span>
                <p className='text-gray-600'>
                  AWS CloudTrail for comprehensive security audit logging
                </p>
              </div>
            </div>
          </section>

          <section className='bg-white rounded-2xl p-6 shadow-sm'>
            <h2 className='text-2xl font-semibold text-gray-800 mb-4'>Enterprise Readiness</h2>
            <div className='space-y-4'>
              <div className='flex items-start space-x-3'>
                <span
                  className={cn('inline-block w-2 h-2 mt-2 rounded-full', COLORS.WARM_PURPLE['10'])}
                ></span>
                <p className='text-gray-600'>
                  Comprehensive security questionnaires available upon request
                </p>
              </div>
              <div className='flex items-start space-x-3'>
                <span
                  className={cn('inline-block w-2 h-2 mt-2 rounded-full', COLORS.WARM_PURPLE['10'])}
                ></span>
                <p className='text-gray-600'>Clear escalation path for security concerns</p>
              </div>
              <div className='flex items-start space-x-3'>
                <span
                  className={cn('inline-block w-2 h-2 mt-2 rounded-full', COLORS.WARM_PURPLE['10'])}
                ></span>
                <p className='text-gray-600'>
                  Founder-level commitment to enterprise security requirements
                </p>
              </div>
              <div className='flex items-start space-x-3'>
                <span
                  className={cn('inline-block w-2 h-2 mt-2 rounded-full', COLORS.WARM_PURPLE['10'])}
                ></span>
                <p className='text-gray-600'>
                  Customizable data retention policies for compliance needs
                </p>
              </div>
            </div>
          </section>

          <section className='text-center'>
            <p className='text-sm text-gray-500 italic'>
              Last Updated: {new Date().toLocaleDateString()}
            </p>
            <p className='mt-4 text-sm text-gray-600'>
              For any security inquiries, please contact:
              <a
                href='mailto:security@renavest.com'
                className='ml-2 text-purple-600 hover:underline'
              >
                security@renavest.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
