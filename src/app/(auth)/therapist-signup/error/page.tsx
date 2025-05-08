'use client';

import Link from 'next/link';

export default function TherapistSignupErrorPage() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4'>
      <div className='max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center'>
        <div className='mb-6'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='#EF4444'
            className='w-16 h-16 mx-auto'
          >
            <path
              fillRule='evenodd'
              d='M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z'
              clipRule='evenodd'
            />
          </svg>
        </div>

        <h1 className='text-2xl font-bold text-gray-800 mb-4'>Access Denied</h1>

        <p className='text-gray-600 mb-6'>
          Your email address is not registered in our therapist database. Only approved therapists
          can sign up for an account.
        </p>

        <div className='mb-6'>
          <p className='text-sm text-gray-500'>
            If you believe this is an error or if you're a therapist interested in joining our
            platform, please contact us.
          </p>
        </div>

        <div className='space-y-4'>
          <a
            href='mailto:support@renavestapp.com'
            className='block w-full bg-[#9071FF] hover:bg-purple-700 text-white py-2 px-4 rounded-md transition-colors'
          >
            Contact Support
          </a>

          <Link
            href='/'
            className='block w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md transition-colors'
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
