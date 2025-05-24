'use client';

import { Shield, Lock, Eye, UserCheck, FileText, AlertTriangle } from 'lucide-react';
import React, { useState } from 'react';

import { cn } from '@/src/lib/utils';

import { authErrorSignal, firstName, selectedRole, currentStep } from '../../state/authState';
import { OnboardingStep } from '../../types';

const PrivacyPromiseSection = () => (
  <div className='bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 border border-purple-100'>
    <h3 className='text-xl font-semibold text-gray-900 mb-4 flex items-center'>
      <Lock className='h-5 w-5 text-[#9071FF] mr-2' />
      Our Privacy Promise
    </h3>
    <div className='space-y-4'>
      <div className='flex items-start space-x-3'>
        <div className='flex-shrink-0 w-2 h-2 bg-[#9071FF] rounded-full mt-2'></div>
        <p className='text-gray-700'>
          <strong>Your financial data is encrypted end-to-end.</strong> We use bank-level security
          to protect every piece of information you share with us.
        </p>
      </div>
      <div className='flex items-start space-x-3'>
        <div className='flex-shrink-0 w-2 h-2 bg-[#9071FF] rounded-full mt-2'></div>
        <p className='text-gray-700'>
          <strong>We never sell your data.</strong> Your personal and financial information will
          never be sold to third parties or used for advertising.
        </p>
      </div>
      <div className='flex items-start space-x-3'>
        <div className='flex-shrink-0 w-2 h-2 bg-[#9071FF] rounded-full mt-2'></div>
        <p className='text-gray-700'>
          <strong>You control your information.</strong> You can view, update, or delete your data
          at any time through your account settings.
        </p>
      </div>
      <div className='flex items-start space-x-3'>
        <div className='flex-shrink-0 w-2 h-2 bg-[#9071FF] rounded-full mt-2'></div>
        <p className='text-gray-700'>
          <strong>Therapist confidentiality is protected.</strong> Your sessions with financial
          therapists are confidential and follow professional therapy standards.
        </p>
      </div>
    </div>
  </div>
);

const TherapistNoticeSection = () => (
  <div className='bg-gradient-to-br from-amber-50 to-white rounded-2xl p-6 border border-amber-200'>
    <h3 className='text-xl font-semibold text-gray-900 mb-4 flex items-center'>
      <AlertTriangle className='h-5 w-5 text-amber-600 mr-2' />
      Important Notice for Therapists
    </h3>
    <div className='space-y-3'>
      <p className='text-gray-700'>
        <strong>Mandatory Reporting Requirements:</strong> As a licensed therapist on our platform,
        you are required to report all sessions with clients for compliance and quality assurance
        purposes.
      </p>
      <p className='text-gray-700'>
        <strong>Professional Standards:</strong> All therapy sessions must adhere to professional
        ethical guidelines and confidentiality standards while maintaining necessary documentation.
      </p>
      <p className='text-gray-700'>
        <strong>Platform Compliance:</strong> Session reporting helps us ensure quality care and
        maintain our commitment to client safety and therapeutic excellence.
      </p>
    </div>
  </div>
);

const SecurityFeaturesSection = () => (
  <div className='bg-gradient-to-br from-green-50 to-white rounded-2xl p-6 border border-green-100'>
    <h3 className='text-xl font-semibold text-gray-900 mb-4 flex items-center'>
      <UserCheck className='h-5 w-5 text-green-600 mr-2' />
      How We Protect You
    </h3>
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
      <div className='flex items-center space-x-3'>
        <Eye className='h-4 w-4 text-green-600' />
        <span className='text-sm text-gray-700'>SOC 2 compliant security</span>
      </div>
      <div className='flex items-center space-x-3'>
        <Lock className='h-4 w-4 text-green-600' />
        <span className='text-sm text-gray-700'>256-bit encryption</span>
      </div>
      <div className='flex items-center space-x-3'>
        <Shield className='h-4 w-4 text-green-600' />
        <span className='text-sm text-gray-700'>Regular security audits</span>
      </div>
      <div className='flex items-center space-x-3'>
        <FileText className='h-4 w-4 text-green-600' />
        <span className='text-sm text-gray-700'>HIPAA-level protections</span>
      </div>
    </div>
  </div>
);

export function PrivacyPledgeStep() {
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const authError = authErrorSignal.value;

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
    <div className='space-y-8'>
      <div className='flex flex-col items-center mb-8 text-center'>
        <div className='mb-4'>
          <Shield className='h-16 w-16 text-[#9071FF] mx-auto' />
        </div>
        <h2 className='text-2xl font-bold text-gray-900 mb-4'>
          Your Data Stays Private, {firstName.value}
        </h2>
        <p className='text-lg text-gray-600 max-w-2xl'>
          Before we continue, here's our commitment to protecting your privacy and financial
          information.
        </p>
      </div>

      {authError && (
        <div
          className='bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative animate-fade-in'
          role='alert'
        >
          <span className='block sm:inline'>{authError}</span>
        </div>
      )}

      <div className='space-y-6'>
        <PrivacyPromiseSection />
        {selectedRole.value === 'therapist' && <TherapistNoticeSection />}
        <SecurityFeaturesSection />

        {/* Acceptance Form */}
        <form onSubmit={handleContinue} className='space-y-6'>
          <div className='space-y-4'>
            <label className='flex items-start space-x-3 cursor-pointer'>
              <input
                type='checkbox'
                checked={acceptedPrivacy}
                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                className='mt-1 h-4 w-4 text-[#9071FF] focus:ring-[#9071FF] border-gray-300 rounded'
              />
              <span className='text-sm text-gray-700'>
                I understand and accept Renavest's privacy commitment. I acknowledge that my data
                will be protected according to the standards outlined above.
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
                  <span>
                    , including the mandatory session reporting requirements for therapists
                  </span>
                )}
                .
              </span>
            </label>
          </div>

          <div className='flex flex-col sm:flex-row gap-3 pt-4'>
            <button
              type='button'
              onClick={handleBack}
              className='w-full sm:w-auto px-6 py-3 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors'
            >
              Back
            </button>
            <button
              type='submit'
              disabled={!acceptedPrivacy || !acceptedTerms}
              className={cn(
                'w-full sm:flex-1 py-3 px-6 rounded-full shadow-md text-sm font-medium text-white transition-all duration-300 ease-in-out transform',
                acceptedPrivacy && acceptedTerms
                  ? 'bg-black hover:bg-gray-800'
                  : 'bg-gray-400 cursor-not-allowed',
              )}
            >
              Continue to Account Creation
            </button>
          </div>
        </form>

        <div className='text-center'>
          <button
            type='button'
            onClick={handleBackToLogin}
            className='text-sm text-gray-500 hover:text-gray-700 hover:underline'
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
