'use client';

import {
  Shield,
  Lock,
  Eye,
  UserCheck,
  FileText,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import React, { useState } from 'react';

import { cn } from '@/src/lib/utils';

import { authErrorSignal, firstName, selectedRole, currentStep } from '../../state/authState';
import { OnboardingStep } from '../../types';

const CollapsibleSection = ({
  title,
  icon,
  children,
  defaultOpen = false,
  bgColor = 'from-purple-50 to-white',
  borderColor = 'border-purple-100',
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  bgColor?: string;
  borderColor?: string;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`bg-gradient-to-br ${bgColor} rounded-xl p-4 border ${borderColor}`}>
      <button
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        className='w-full flex items-center justify-between text-left'
      >
        <h3 className='text-lg font-semibold text-gray-900 flex items-center'>
          {icon}
          {title}
        </h3>
        {isOpen ? (
          <ChevronUp className='h-5 w-5 text-gray-500' />
        ) : (
          <ChevronDown className='h-5 w-5 text-gray-500' />
        )}
      </button>
      {isOpen && <div className='mt-3 space-y-2'>{children}</div>}
    </div>
  );
};

const PrivacyHighlights = () => (
  <div className='bg-gradient-to-br from-purple-50 to-white rounded-xl p-4 border border-purple-100'>
    <h3 className='text-lg font-semibold text-gray-900 mb-3 flex items-center'>
      <Lock className='h-5 w-5 text-[#9071FF] mr-2' />
      Your Data is Protected
    </h3>
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm'>
      <div className='flex items-center space-x-2'>
        <div className='w-2 h-2 bg-[#9071FF] rounded-full'></div>
        <span className='text-gray-700'>End-to-end encryption</span>
      </div>
      <div className='flex items-center space-x-2'>
        <div className='w-2 h-2 bg-[#9071FF] rounded-full'></div>
        <span className='text-gray-700'>Never sold to third parties</span>
      </div>
      <div className='flex items-center space-x-2'>
        <div className='w-2 h-2 bg-[#9071FF] rounded-full'></div>
        <span className='text-gray-700'>You control your data</span>
      </div>
      <div className='flex items-center space-x-2'>
        <div className='w-2 h-2 bg-[#9071FF] rounded-full'></div>
        <span className='text-gray-700'>HIPAA-level protection</span>
      </div>
    </div>
  </div>
);

export function PrivacyPledgeStep() {
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedPrivacy || !acceptedTerms) {
      authErrorSignal.value =
        'Please accept both the privacy pledge and terms of service to continue.';
      return;
    }
    authErrorSignal.value = null;
    currentStep.value = OnboardingStep.SIGNUP;
  };

  const handleBack = () => {
    if (selectedRole.value === 'employee') {
      currentStep.value = OnboardingStep.ETHNICITY;
    } else {
      currentStep.value = OnboardingStep.ROLE_SELECTION;
    }
  };

  const handleBackToLogin = () => {
    currentStep.value = OnboardingStep.LOGIN;
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col items-center mb-6 text-center'>
        <div className='mb-3'>
          <Shield className='h-12 w-12 text-[#9071FF] mx-auto' />
        </div>
        <h2 className='text-xl font-bold text-gray-900 mb-2'>
          Your Data Stays Private, {firstName.value}
        </h2>
        <p className='text-sm text-gray-600 max-w-md'>
          Here's our commitment to protecting your privacy and financial information.
        </p>
      </div>

      <div className='space-y-4'>
        <PrivacyHighlights />

        <CollapsibleSection
          title='Security Details'
          icon={<UserCheck className='h-5 w-5 text-green-600 mr-2' />}
          bgColor='from-green-50 to-white'
          borderColor='border-green-100'
        >
          <div className='grid grid-cols-2 gap-2 text-sm'>
            <div className='flex items-center space-x-2'>
              <Lock className='h-3 w-3 text-green-600' />
              <span className='text-gray-700'>256-bit encryption</span>
            </div>
            <div className='flex items-center space-x-2'>
              <Shield className='h-3 w-3 text-green-600' />
              <span className='text-gray-700'>Regular security reviews</span>
            </div>
            <div className='flex items-center space-x-2'>
              <FileText className='h-3 w-3 text-green-600' />
              <span className='text-gray-700'>HIPAA protections</span>
            </div>
            <div className='flex items-center space-x-2'>
              <Eye className='h-3 w-3 text-green-600' />
              <span className='text-gray-700'>Ongoing compliance</span>
            </div>
          </div>
        </CollapsibleSection>

        {selectedRole.value === 'therapist' && (
          <CollapsibleSection
            title='Therapist Requirements'
            icon={<AlertTriangle className='h-5 w-5 text-amber-600 mr-2' />}
            bgColor='from-amber-50 to-white'
            borderColor='border-amber-200'
            defaultOpen={true}
          >
            <div className='text-sm text-gray-700 space-y-2'>
              <p>
                <strong>Session Reporting:</strong> All sessions must be reported for compliance and
                quality assurance.
              </p>
              <p>
                <strong>Professional Standards:</strong> Maintain ethical guidelines and
                confidentiality standards.
              </p>
            </div>
          </CollapsibleSection>
        )}

        {/* Acceptance Form */}
        <form onSubmit={handleContinue} className='space-y-4'>
          <div className='space-y-3'>
            <label className='flex items-start space-x-3 cursor-pointer'>
              <input
                type='checkbox'
                checked={acceptedPrivacy}
                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                className='mt-1 h-4 w-4 text-[#9071FF] focus:ring-[#9071FF] border-gray-300 rounded'
              />
              <span className='text-sm text-gray-700'>
                I understand and accept Renavest's privacy commitment and data protection standards.
              </span>
            </label>

            <label className='flex items-start space-x-3 cursor-pointer'>
              <input
                type='checkbox'
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className='mt-1 h-4 w-4 text-[#9071FF] focus:ring-[#9071FF] border-gray-300 rounded'
              />
              <span className='text-sm text-gray-700'>
                I agree to Renavest's{' '}
                <a
                  href='/terms'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-[#9071FF] hover:underline'
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href='/privacy'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-[#9071FF] hover:underline'
                >
                  Privacy Policy
                </a>
                {selectedRole.value === 'therapist' && (
                  <span>, including session reporting requirements</span>
                )}
                .
              </span>
            </label>
          </div>

          <div className='flex justify-between items-center mt-6'>
            <button
              type='button'
              onClick={handleBack}
              className='p-2 text-gray-600 hover:text-gray-900'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M19 12H5' />
                <path d='M12 19l-7-7 7-7' />
              </svg>
            </button>
            <button
              type='submit'
              disabled={!acceptedPrivacy || !acceptedTerms}
              className={cn(
                'py-3 px-6 rounded-full shadow-md text-sm font-medium text-white transition-all duration-300 ease-in-out transform',
                acceptedPrivacy && acceptedTerms
                  ? 'bg-black hover:bg-gray-800'
                  : 'bg-gray-400 cursor-not-allowed',
              )}
            >
              Continue to Account Creation
            </button>
          </div>
        </form>

        <div className='text-center mt-4'>
          <p className='text-sm text-gray-600'>
            Have an account?{' '}
            <button
              type='button'
              onClick={handleBackToLogin}
              className='text-gray-900 hover:underline font-medium'
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
