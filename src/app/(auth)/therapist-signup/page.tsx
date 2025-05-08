'use client';

import { SignUp } from '@clerk/nextjs';

export default function TherapistSignUpPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <SignUp
        routing='path'
        path='/therapist-signup'
        appearance={{
          elements: {
            card: 'shadow-lg border-none rounded-xl max-w-md w-full',
            headerTitle: 'text-2xl font-bold text-gray-800 mb-2',
            headerSubtitle: 'text-gray-500 mb-4 text-center',
            socialButtonsBlockButton: 'w-full mb-4 rounded-lg',
            formButtonPrimary: 'w-full bg-[#9071FF] hover:bg-purple-700 text-white rounded-lg',
            socialButtons: 'gap-2',
            socialButtonsIconButton: 'border border-gray-300 rounded-lg',
            formFieldInput:
              'border border-gray-300 rounded-lg focus:border-[#9071FF] focus:ring-2 focus:ring-[#9071FF]/30',
            formFieldLabel: 'text-gray-700 font-medium',
          },
          variables: {
            colorPrimary: '#9071FF',
          },
        }}
    signInUrl='/login'
        forceRedirectUrl='/therapist/onboarding'
        fallbackRedirectUrl='/therapist/onboarding'
        signInFallbackRedirectUrl='/therapist'
      />
    </div>
  );
}
